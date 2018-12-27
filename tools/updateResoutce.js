import { isMainThread } from "worker_threads";

/**
 * 处理资源的更新
 *  此模块应用redis缓存策略
 *  在更新数据库之后，立即删除缓存中对应的资源（包括锁）
 * 入口参数说明：
 * id：资源唯一标识符
 * flag: 资源种类标识符（article、user等）
 * update_message: 要升级的 $set value
 */

async function main (id, flag, update_message) {
  // redis中，对应资源的key
  let key = flag+'-'+id
  // redis中，对应资源锁的key
  let lock_key = flag+'-lock-'+id
  
}