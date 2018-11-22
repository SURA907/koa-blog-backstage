/**
 * 路由模块
 *  切割请求
 */
const router = require('koa-router')()

// 引入子路由
const index = require('./default/index')

// 转载子路由
router.use('/', index)

module.exports = router.routes()
