/**
 * 日志模块
 * 打印每个请求的
 *   -ip地址
 *   -请求方式
 *   -请求url
 *   -响应耗时
 *   -UA标识
 */
class logHander {
  static async log(ctx, next) {
    const start_time = new Date().getTime()
    await next()
    const time = new Date().getTime() - start_time
    console.log(`  ${ctx.ip}  ${ctx.method}  ${ctx.url}  ${time}ms --- ${ctx.header['user-agent']}`)
  }
}

module.exports = logHander.log
