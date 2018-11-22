const Koa = require('koa')
const app = new Koa()

// test
app.use( async (ctx) => {
  ctx.body = 'hello, world'
})

// 暴露Koa实例
module.exports = app.callback()
