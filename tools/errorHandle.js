/**
 * 捕获和处理http401错误
 */
function errorHandle(ctx, next) {
  return next().catch(error => {
    if (error.status === 401) {
      ctx.status = 401
      ctx.body = {
        code: 1,
        status: 401,
        message: 'sorry, you do not have access'
      }
    } else {
      throw error
    }
  })
}

module.exports = errorHandle
