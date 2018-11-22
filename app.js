/**
 * 封装koa及其中间件供server使用
 */
// 引入框架及中间件
const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')

// 自定义模块
const ownRoutes = require('./routes/index')
const errorHandle = require('./tools/errorHandle')


// 实例化Koa
const app = new Koa()

// 使用路由分割用户请求
router.use(ownRoutes)

// 装载中间件
app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(errorHandle)

// 暴露Koa实例
module.exports = app.callback()
