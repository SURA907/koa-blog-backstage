/**
 * 处理针对article的请求
 *   在本模块应用redis缓存策略
 */
// 引入model
const articles = require('./../model/model').getModel('articles')

// 引入redis相关
const redis = require('redis')
const bluebird = require('bluebird')
const REDIS_CONF = require('./../config').REDIS


// 使用bluebird使redis操作转为Promises
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

// 创建redis客户端
const redis_client = redis.createClient(REDIS_CONF)

// 延时
async function sleep(ms) {
  await new Promise( resolve => {
    setTimeout(resolve, ms)
  }) 
}

// 查询redis，查看数据的状态
async function query_redis(key) {
  let result = await redis_client.getAsync(key)
  return result
}

// 刷新资源过期时间（五分钟）
async function reset_redis(key) {
  await redis_client.pexpire(key, 300000)
}

// redis上锁
async function redis_lock(lock_key, lock_id) {
  // 上锁
  // 参数'NX'保证一次最多只有一个线程set成功
  let is_lock = await redis_client.setAsync(lock_key, lock_id, 'NX', 'PX', 200)
  return is_lock === 'OK'
}

// 查询mongo
async function query_mongo(id) {
  let result = await articles.findById(id)
  return result
}

// 解锁并刷新redis资源数据
async function redis_unlock(lock_key, lock_id, key, data) {
  let script = `if redis.call('get', '${lock_key}') == '${lock_id}' then
    if redis.call('del', '${lock_key}') == 1 then
      return redis.call('set', '${key}', '${data}', 'PX', 300000)
    else
      return -2
    end
  else
    return -1
  end`
  // console.log(script)
  let result = await redis_client.evalAsync(script, 0)
  // console.log('unlock-: '+result)
  return result
}

// 入口
async function main(ctx, next) {
  // 文章id
  let id = ctx.params.id
  
  // 文章资源在redis中的标识符
  let key = 'article-'+id
  
  // 资源锁key，通过这个字段是否为null判断资源是否上锁
  let lock_key = 'article-lock-'+id
  
  // 锁id，防止解除不属于自己的锁
  let lock_id = Math.random()
  
  // 查询redis
  let result_redis = await query_redis(key)
  if (result_redis !== null) {
    // 从缓存中获取到了数据
    ctx.body = {
      code: 0,
      status: 200,
      from: 'cache',
      data: JSON.parse(result_redis)
    }
    // 刷新资源过期时间
    reset_redis(key)
  } else {
    // 给资源上锁
    let lock = await redis_lock(lock_key, lock_id)
    if (lock === false) {
      // 未成功上锁
      // 自旋等待
      await sleep(80)
      await main(ctx, next)
    } else {
      // 成功上锁
      let result_mongo = await query_mongo(id)
      if (result_mongo === null) {
        // 资源不存在
        ctx.throw(404, 'resourse not found')
      } else {
        // 资源存在
        // 返回数据
        ctx.body = {
          code: 0,
          status: 200,
          from: 'db',
          data: result_mongo
        }

        // 解除锁同时刷新redis数据，此操作只能解除自己设置的锁
        let data = JSON.stringify(result_mongo)
        await redis_unlock(lock_key, lock_id, key, data)
      }
    }
  }
}

module.exports = main
