/**
 * 路由模块
 *  切割请求
 */
const router = require('koa-router')()

// 引入controller
const home = require('./../controller/home')
const articles = require('./../controller/article')


// reast api
router.get('/index', home.index)
router.get('/articles/:id', articles.find)


module.exports = router.routes()
