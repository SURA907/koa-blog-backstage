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

const PRIVATE_KEY_PATH = require('./../config').TOKEN_KEY.PRIVATE_KEY
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH)

const PUBLIC_KEY_PATH = require('./../config').TOKEN_KEY.PUBLIC_KEY
const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH)

async function token_parse(ctx, next) {
  let token = ctx.request.header.authorization
  if (token) {
    // 去掉token头部标识
    let user_token = token.split(' ')[1]
    // 解析token
    let jwt_user_status = jwt.verify(user_token, PRIVATE_KEY)
    // 根据token信息查库
    let db_user_status = await user.findById(jwt_user_status.id)
    if (db_user_status.length !== 0 && db_user_status[0].update_time === jwt_user_status.update_time) {
      // token 有效
      ctx.jwt.user_status = jwt_user_status
      // 通过此中间件
      await next()
    } else {
      // token 无效, 签发一个立即过期的token
      ctx.body = {
        code: 1,
        status: 401,
        message: 'Invalid token',
        token: jwt.sign({
          data: null,
          exp: 0
        }, PUBLIC_KEY, {algorithm: 'RS256'})
      }
    }
  } else {
    // 没有token，抛出401
    ctx.throw(401, 'you do not have the access permission')
  }
 
}

module.exports = token_parse
