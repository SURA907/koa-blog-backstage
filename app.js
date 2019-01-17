/**
 * 封装koa及其中间件供server使用
 */
// 引入框架及中间件
const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const helmet = require('koa-helmet')

// 自定义模块
const ownRoutes = require('./routes/index')
const errorHandle = require('./tools/errorHandle')
const logHanele = require('./tools/log')
const resourceSharing = require('./tools/resourceSharing')
const jwt_config = require('./tools/jwtConfig')
const jwt_parse = require('./tools/jwtParse')

// 实例化Koa
const app = new Koa()

// 使用路由分割用户请求
router.use(ownRoutes)

// 装载中间件
app
  .use(helmet())
  .use(errorHandle)
  .use(logHanele)
  .use(resourceSharing)
  .use(jwt_config)
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

// 暴露Koa实例
module.exports = app.callback()
