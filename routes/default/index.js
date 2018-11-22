/**
 * index子路由模块
 * 处理 url === '/' 的用户请求
 */
const router = require('koa-router')()

// test
router.get('/', (ctx) => {
  ctx.response.body = 'index test'
})

module.exports = router.routes()
