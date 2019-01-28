/**
 * 处理查找资源的请求
 *   在本模块应用redis缓存策略
 * 入口接收的参数说明：
 * ctx: koa ctx对象
 * next: koa next对象
 * id: 资源唯一标识符
 * flag: 资源种类标识符（article、user等）
 * model: 存储资源的数据库model
 * redis_client: 存储资源的redis
 */
const ObjectId = require('mongoose').Types.ObjectId

// 延时
async function sleep(ms) {
  await new Promise( resolve => {
    setTimeout(resolve, ms)
  })
}

// 查询redis，查看数据的状态
async function query_redis(redis_client, key) {
  let result = await redis_client.getAsync(key)
  return result
}

// 刷新资源过期时间（五分钟）
async function reset_redis(redis_client, key) {
  await redis_client.pexpireAsync(key, 300000)
}

// redis上锁
async function redis_lock(redis_client, lock_key, lock_id) {
  // 上锁
  // 参数'NX'保证一次最多只有一个线程set成功
  let is_lock = await redis_client.setAsync(lock_key, lock_id, 'NX', 'PX', 200)
  return is_lock === 'OK'
}

// 查询mongo
async function query_mongo(model, id) {
  if (model.find) {
    let result = await model.find({
      _id: ObjectId(id),
      is_delete: 'NO'
    })
    return result
  }
}

// 解锁并刷新redis资源数据
async function redis_unlock(redis_client, lock_key, lock_id, key, data) {
  /**
   *   KEYS[1]: lock_key
   *   KEYS[2]: key
   *   ARGV[1]: lock_id
   *   ARGV[2]: data
   */
  let script = `
  if (redis.call('get', KEYS[1]) == ARGV[1])
    then
      if (redis.call('del', KEYS[1]) == 1)
        then
        return redis.call('set', KEYS[2], ARGV[2], 'PX', 300000)
      else
        return -2
      end
    else
      return -1
    end`
  let result = await redis_client.evalAsync(script, 2, ...[lock_key, key, lock_id, data])
  return result
}

// 入口
async function main(model, redis_client, id, flag) {
  
  // 资源在redis中的标识符
  let key = flag+'-'+id
  // 资源锁key，通过这个字段是否为null判断资源是否上锁
  let lock_key = flag+'-lock-'+id
  // 锁id，防止解除不属于自己的锁
  let lock_id = Math.random()
  
  // 查询redis
  let result_redis = await query_redis(redis_client, key)
  if (result_redis !== null) {
    // 从缓存中获取到了数据
    // 刷新资源过期时间
    reset_redis(redis_client, key)
    return new Promise( resolve => {
      resolve({
        from: 'cache',
        data: JSON.parse(result_redis)
      })
    })
  }
  // 给资源上锁
  let lock = await redis_lock(redis_client, lock_key, lock_id)
  if (lock === false) {
    // 未成功上锁
    // 自旋等待
    await sleep(50)
    return await main(model, redis_client, id, flag)
  }
  // 成功上锁，查询数据库
  let result_mongo = await query_mongo(model, id)
  if (result_mongo.length === 0) {
    return new Promise( resolve => {
      resolve(null)
    })
  }
  // 解除锁同时刷新redis数据，此操作只能解除自己设置的锁
  let data = JSON.stringify(result_mongo[0])
  await redis_unlock(redis_client, lock_key, lock_id, key, data)
  // 返回数据
  return new Promise( resolve => {
    resolve({
      from: 'db',
      data: result_mongo[0]
    })
  })
}

module.exports = main
