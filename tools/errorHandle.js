/**
 * 统一捕获和处理http错误
 *  401: 没有权限
 *  404: 请求资源不存在
 *  500: 服务器错误
 */
function errorHandle(ctx, next) {
  return next().catch(error => {
    switch (error.status) {
      case 401: {
        ctx.status = 401
        ctx.body = {
          code: 1,
          status: 401,
          message: 'you do not have access'
        }
      } break
      case 404: {
        ctx.status = 404
        ctx.body = {
          code: 1,
          status: 404,
          message: 'not found'
        }
      } break
      case 500: {
        ctx.status = 500
        ctx.body = {
          code: 1,
          status: 500,
          message: 'server error'
        }
      } break
    }
  })
}

module.exports = errorHandle
