/**
 * index子路由模块
 * 处理 url === '/' 的用户请求
 */
const router = require('koa-router')()

// 引入user model
const articles = require('./../../model/model').getModel('articles')

// test
router.get('/', async (ctx) => {
  let index_data = await articles.find({is_delete:'NO'})
  ctx.body = {
    code: 0,
    status: 200,
    message: null,
    data: index_data
  }
})

module.exports = router.routes()
