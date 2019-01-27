/**
 * jwt解析
 *  没有token 抛出401
 *  有token 解析token并验证有效性
 *   token有效 通过中间件
 *   token无效 签发一个立即过期的token
 */
const fs = require('fs')
const jwt = require('jsonwebtoken')
const user = require('./../model/model').getModel('user')
const findResource = require('./../tools/findResource')
const redis_client = require('./../tools/redis')

const PRIVATE_KEY_PATH = require('./../config').TOKEN_KEY.PRIVATE_KEY
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH)


async function token_parse(ctx, next) {
  let token = ctx.request.header.authorization
  if (token === undefined) {
    // 没有token，抛出401
    ctx.throw(401, 'you do not have the access permission')
  }
  // 去掉token头部标识
  let user_token = token.split(' ')[1]
  // 解析token
  let jwt_user_status = await jwt.verify(user_token, PRIVATE_KEY)
  jwt_user_status = jwt_user_status.data
  // 根据token信息查库
  let result = await findResource(user, redis_client, jwt_user_status.id, 'user')
  if (result === null) {
    ctx.throw(401, 'Invalid token')
  }
  let db_user_status = result.data
  // let db_user_status = await user.findById(jwt_user_status.id)
  if (db_user_status === {} || db_user_status.update_at !== jwt_user_status.update_at) {
    // 用户信息修改导致token过期, 抛出401
    ctx.throw(401, 'Invalid token')
  } else {
    // token 有效
    ctx.user_status = db_user_status
    // 通过此中间件
    await next()
  }
}

module.exports = token_parse
