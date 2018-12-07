/**
 * articles控制器
 *  处理articles相关请求
 */
const findArticle = require('./../tools/findArticle')
const articles = {
  // 根据文章id返回文章数据
  async find (ctx, next) {
    let id = ctx.params.id
    // 检查参数
    if (id.length && id.length === 24) {
      // 参数合法
      await findArticle(ctx, next)
    } else {
      ctx.throw(400, 'bad request, check args please')
    }
  }
  
}

module.exports = articles
