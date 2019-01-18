/**
 * 统一捕获和处理http错误
 *  401: 权限不足
 *  403: 服务器正确的理解了请求，但拒绝执行（操作过于频繁）
 *  404: 请求资源不存在
 *  400: 请求参数错误
 *  500: 服务器错误
 * 
 * ps: 目前看来，使用这种方式只能捕获主动抛出的http error (如: ctx.throw(400))
 *  错误处理还需要之后进一步研究
 */
async function errorHander (ctx, next) {
  try {
    await next()
  } catch(error) {
    switch (error.status) {

      case 400: {
        ctx.status = 200
        ctx.body = {
          code: 1,
          status: 400,
          message: error.message || 'bad request, check args please'
        }
      } break

      case 401: {
        ctx.status = 200
        ctx.body = {
          code: 1,
          status: 401,
          message: error.message || 'you do not have the access permission'
        }
      } break

      case 403: {
        ctx.status = 200,
        ctx.body = {
          code: 1,
          status: 403,
          message: error.message || 'refuse request'
        }
      } break

      case 404: {
        ctx.status = 200
        ctx.body = {
          code: 1,
          status: 404,
          message: error.message || 'not found'
        }
      } break

      case 500: {
        ctx.status = 200
        ctx.body = {
          code: 1,
          status: 500,
          message: error.message || 'server error'
        }
      } break

      default: {
        throw error
      } break
      
    }
  }
}

module.exports = errorHander
