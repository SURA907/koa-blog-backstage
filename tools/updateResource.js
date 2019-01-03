/**
 * 处理资源的更新
 *  此模块应用redis缓存策略
 *  在更新数据库之后，立即删除缓存中对应的资源（包括锁）
 * 入口参数说明：
 * id：资源唯一标识符
 * flag: 资源种类标识符（article、user等）
 * update_message: 要升级的 $set value
 * model: 相应资源的model
 * redis_client: redis客户端
 * PS: 注意调用此模块前需要自行验证当前用户是否具有资源操作权限
 * 
 * 更新流程简述：
 *   删除redis数据，并上锁（和查找资源防止雪崩的锁基本相同，不同之处仅在于这个锁直接使用set而不是setnx）
 *   更新mongo数据，无论是否成功都会解锁
 * 
 * 使更新数据期间的所有请求自旋等待，增强一致性
 */
const ObjectId = require('mongoose').Types.ObjectId

// 阻塞
async function sleep (ms) {
  await new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

// update mongo数据
async function mongo_update (model, id, update_message) {
  await model.updateOne({
    _id: ObjectId(id),
  }, {$set: update_message})
}

// delete redis数据，并上锁
// 这把锁的作用是在mongo更新期间阻塞资源请求
async function redis_delete (redis_client, key, lock_key, lock_id) {
  let lua = `if redis.call('del', '${key}') == 'OK' then
    if redis.call('get', '${lock_key})' != '${lock_id}' then
      return redis.call('set', '${lock_key}', '${lock_id}', 'PX', 300)
    else
      return -4
    end
  else
    return -1
  end`
  return await redis_client.evalAsync(lua, 0)
}

// redis 解锁
// 强制解锁同时再次删除缓存数据，防止锁因到期或其他原因失效后有其他线程访问数据库
async function redis_unlock (redis_client, key, lock_key) {
  await redis_client.delAsync(lock_key)
  await redis_client.delAsync(key)
  return true
}

// 入口
async function main (model, redis_client, id, flag, update_message) {
  // redis中，对应资源的key
  let key = flag+'-'+id
  // redis中，对应资源锁的key
  let lock_key = flag+'-lock-'+id
  let lock_id = 'update'
  
  // 删除缓存中的资源，并上锁
  let result = await redis_delete(redis_client, key, lock_key, lock_id)
  if (result === -4) {
    // redis上锁失败，有其他线程正在更新当前资源，自旋
    await sleep(50)
    return await main(model, redis_client, id, flag, update_message)
  }
  // 更新mongo资源
  await mongo_update(model, id, update_message)
  // 解锁并再次删除缓存数据
  await redis_unlock(redis_client, key, lock_key)

  return true
}

module.exports = main
