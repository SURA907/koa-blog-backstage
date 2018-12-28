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
 */
const ObjectId = require('mongoose').Types.ObjectId

// update mongo数据
async function mongo_update (model, id, update_message) {
  await model.updateOne({
    _id: ObjectId(id),
  }, {$set: update_message})
}

// delete redis数据
async function redis_delete (redis_client, key, lock_key) {
  await redis_client.delAsync(lock_key)
  await redis_client.delAsync(key)
}

// 入口
async function main (model, redis_client, id, flag, update_message) {
  // redis中，对应资源的key
  let key = flag+'-'+id
  // redis中，对应资源锁的key
  let lock_key = flag+'-lock-'+id
  
  // 更新mongo资源
  await mongo_update(model, id, update_message)
  // 删除缓存中的
  await redis_delete(redis_client, key, lock_key)
  return true
}

module.exports = main
