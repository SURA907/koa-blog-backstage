const Koa = require('koa')

const app = new Koa()

app.use( async (ctx, next) => {
    ctx.body = 'hello, world'
})

// 端口监听
app.listen(8080)
