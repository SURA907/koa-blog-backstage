/**
 * 设置允许跨域
 */
const resourseSharing = {
  
  async sharing (ctx, next) {
    // console.log(ctx.request.headers)

    // 允许跨域访问的域名
    let origin = ctx.request.headers['origin']
    if (origin) {
      ctx.set('Access-Control-Allow-Origin', origin)
    }
    
    // 允许跨域访问的方法
    ctx.set('Access-Control-Allow-Methods', '*')
    
    // 是否允许携带cookie
    ctx.set('Access-Control-Allow-Credentials', 'true')
    
    // OPTIONS校验允许缓存的时间
    ctx.set('Access-Control-Max-Age', 3600)
    
    let headers = ctx.request.headers['access-control-request-headers']
    if (headers) {
      // 允许使用的自定义请求头
      ctx.set('Access-Control-Allow-Headers', headers)
    }

    await next()
  }

}

module.exports = resourseSharing.sharing
