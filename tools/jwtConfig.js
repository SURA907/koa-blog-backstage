/**
 * koa-jwt 相关配置
 */
const koa_jwt = require('koa-jwt')
const fs = require('fs')
const PRIVATE_KEY_PATH = require('./../config').TOKEN_KEY.PRIVATE_KEY


// 不需要token就可以访问的url
const public_path = [
  /^\/articles/,
  /^\/users\/signin$/,
  /^\/users$/,
  /^\/mail\/signup$/,
  /^\/comments/,
]

// 解密密匙
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH)

const jwt_config = koa_jwt({
  secret: PRIVATE_KEY
}).unless({
  path: public_path
})

module.exports = jwt_config
