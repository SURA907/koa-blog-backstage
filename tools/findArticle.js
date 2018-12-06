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
const redis_clent = redis.createClient(REDIS_CONF)

class findArticle {
  
  // 在redis中寻找文章
  static async first_find (key) {
    let data = await redis_clent.getAsync(key)
    if (data === null) {
      // 文章数据不存在
      return {load_status: undefined}
    } else {
      // 文章存在，或已有线程去数据库获取数据
      return JSON.parse(data)
    }
  }
  
  // 查询数据库
  static async query_db (article_id) {
    let data = await articles.findById(article_id)
    return data
  }
  
  // redis上锁
  static async redis_lock (key) {
    // 格式化用于上锁的key，value
    // 生成随机数作为标识符，防止解开不属于自己的锁
    let query_id = Math.random()
    let value = JSON.stringify({
      load_status: 'QUERY',
      query_id: query_id
    })
    
    // 上锁（过期时间200毫秒）
    let res = await redis_clent.setAsync(key, value, 'NX', 'PX', 200)
    
    // 判断上锁是否成功
    if (res === 'OK') {
      // 上锁成功，需要返回用于解锁的query_id
      return {status: 'completed', query_id: query_id}
    } else {
      // 上锁失败
      return {status: 'failured'}
    }
  }
  
  // redis解锁，同时刷新缓存
  static async redis_unlock (key, query_id, data) {
    // 获得锁
    let res = await redis_clent.getAsync(key)
    // 检查锁
    if (res === null) {
      // 锁不存在
      // 锁不存在可能是锁过期，或文章内容出现了更新
      // 直接返回锁正常解除，但不刷新缓存
      return true
    } else {
      res = JSON.parse(res)
      // 锁存在
      // 检查锁的状态
      if (res.load_status === 'QUERY' && res.query_id === query_id) {
        // 锁属于自己
        let value = JSON.stringify({
          load_status: 'COMPLETE',
          data: data
        })
        // 解除锁并将数据放入缓存（缓存过期时间五分钟）
        let result = await redis_clent.setAsync(key, value, 'PX', 300000)
        return result === 'OK'
      } else {
        // 锁不属于自己
        //  1、自己的锁已过期，当前另一线程在检索数据库
        //  2、自己的锁已过期，另一线程已完成对缓存的刷新
        // 直接返回锁正常解除，但不刷新缓存
        return true
      }
    }
  }
  
  // 入口
  static async main (ctx, next) {
    try {
      let article_id = ctx.params.id
      // 检查参数
      if (article_id.length && article_id.length !== 24) {
        throw(400, 'bad request, check args please')
      }
      let key = 'article-'+article_id
      // 查询缓存
      let eRedis = await this.first_find(key)
      // 查看数据状态
      if (eRedis.load_status !== undefined) {
        // 缓存中有数据
        if (eRedis.load_status === 'QUERY') {
          // 有线程正在检索数据库，延时自旋
          setTimeout(() => {
            findArticle.main(ctx, next)
          }, 100)
        } else if (eRedis.load_status === 'COMPLETE') {
          // 缓存数据可用
          // 重置缓存过期时间
          await redis_clent.pexpire(key, 300000)
          // 返回数据
          ctx.body = {
            code: 0,
            status: 200,
            from: 'catch',
            data: eRedis.data
          }
        }
      }
      // 缓存中没有数据，使用redis上锁
      let lock_status = await this.redis_lock(key)
      // 检查上锁状态
      if (lock_status.status === 'completed') {
        // 上锁成功，查询mongodb
        let db_result = await this.query_db(article_id)
        // 解锁并刷新缓存
        await this.redis_unlock(key, lock_status.query_id, db_result)
        ctx.body = {
          code: 0,
          status: 200,
          from: 'db',
          data: db_result
        }
      } else if (lock_status === 'failured') {
        // 上锁失败，自旋
        setTimeout(() => {
          findArticle.main(ctx, next)
        }, 100)
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, 'server error')
    }

  }
}

module.exports = findArticle
