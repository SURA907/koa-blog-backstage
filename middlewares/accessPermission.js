/**
 * 判断用户访问权限的中间件
 *  仅登陆过的用户可以经过此中间件的过滤
 *  无相应权限           --   抛出401
 *  具有相应权限         --   通过此中间件 (await next)
 */
const fs = require('fs')
const jwt = require('jsonwebtoken')
// 引入token解析
const jwtParse = require('./jwtParse')

const methods = {
  // 是否登录
  async isSignin (ctx, next) {
    // 解析token并检验token有效性
    await jwtParse(ctx, next)
  },
  // 是否为管理员
  async isAdmin (ctx, next) {
    // 解析并验证token有效性
    await jwtParse(ctx, next)
    // token有效，检测用户权限
    if (ctx.user_status.type !== 'admin') {
      // 无管理员权限，抛出401
      ctx.throw(401, 'only allowed admin')
    } else {
      await next()
    }
  }
}

module.exports = methods
