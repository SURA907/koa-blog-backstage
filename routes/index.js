/**
 * 路由模块
 *  切割请求
 */
const router = require('koa-router')()

// 引入controller
const home = require('./../controller/home')


// 首页数据请求
router
  .get('/index', home.index)


module.exports = router.routes()
