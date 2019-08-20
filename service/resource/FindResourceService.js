/**
 * 处理查找资源的请求
 *   在本模块应用redis缓存策略
 * id: 资源唯一标识符
 * flag: 资源种类标识符（article、user等）
 * model: 存储资源的数据库model
 */
const ObjectId = require('mongoose').Types.ObjectId
const redis = require('./../tools/redis')

class FindResourceService {
  constructor(model, id, flag) {
    this.data = null
    // 资源所在model
    this.model = model
    // 资源唯一标识符
    this.id = id
    // 资源类型
    this.flag = flag
    // 资源在redis中的标识符
    this.key = flag+'-'+id
    // 资源锁key，通过redis中这个key是否存在判断资源是否上锁
    this.lock_key = flag+'-lock-'+id
    // 锁id，防止解除不属于自己的锁
    this.lock_id = Math.random()
  }
  
  async sleep(ms) {
    await new Promise( resolve => {
      setTimeout(resolve, ms)
    })
  }

  // 查询redis，查看数据的状态
  async query_redis() {
    let result = await redis.getAsync(this.key)
    if (result !== null)  {
      this.data = redis
      throw new Error('Redis::GetData')
    }
  }

  // 刷新资源过期时间（五分钟）
  async reset_redis() {
    redis.pexpireAsync(this.key, 300000)
  }

  // redis上锁
  async redis_lock() {
    // 上锁
    // 参数'NX'保证一次最多只有一个线程set成功
    let is_lock = await redis.setAsync(this.lock_key, this.lock_id, 'NX', 'PX', 300)
    if (is_lock !== 'OK') {
      throw new Error('Redis::LockFailed')
    }
  }

  // 查询mongo
  async query_mongo() {
    let result = await this.model.find({
      _id: ObjectId(this.id),
      is_delete: 'NO'
    })
    if (result.length === 0) {
      throw new Error('Mongo::NotFound')
    }
    this.data = result[0]
  }

  // 解锁并刷新redis资源数据
  async redis_unlock_and_set_resource() {
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
    let data = JSON.stringify(this.data)
    redis.evalAsync(script, 2, ...[this.lock_key, this.key, this.lock_id, data])
  }

  async validate() {
    if (this.model === undefined || typeof this.model.find !== 'function') {
      throw new Error('Model::BadArgs')
    }
  }

  send_success_message() {
    return {
      status: 'success',
      data: this.data
    }
  }

  send_error_message(message) {
    return {
      error: 'error',
      message: message
    }
  }

  async execute() {
    try {
      await validate()
      await this.query_redis()
      await this.redis_lock()
      await this.query_mongo()
      this.redis_unlock_and_set_resource()
      return this.send_success_message()
    } catch ( err ) {
      switch (err.message) {
        case 'Redis::GetData':
          this.reset_redis()
          return this.send_success_message()
        break
        case 'Redis::LockFailed':
          await this.sleep(80)
          return await this.execute()
        break
        case 'Mongo::NotFound':
          return this.send_error_message('Source Not Found')
        break
        case 'Model::BadArgs':
          return this.send_error_message('Bad Args')
        break
        default:
          return this.send_error_message('Unkown Error')
        break
      }
    }
  }
}

module.exports = FindResourceService
