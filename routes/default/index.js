/**
 * index子路由模块
 * 处理 url === '/' 的用户请求
 */
const router = require('koa-router')()

router.get('/', (ctx) => {
  ctx.body = 'index test'
})

module.exports = router.routes()
