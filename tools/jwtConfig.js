/**
 * koa-jwt 相关配置
 */
const koa_jwt = require('koa-jwt')
const fs = require('fs')
const PUBLIC_KEY_PATH = require('./../config').TOKEN_KEY.PUBLIC_KEY


// 不需要token就可以访问的url
const public_path = [
  /^\/index$/,
  /^\/articles\//,
  /^\/user\/login$/,
]

// 加密密匙
const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH)

const jwt_config = koa_jwt({
  secret: PUBLIC_KEY
}).unless({
  path: public_path
})

module.exports = jwt_config
