/**
 * articles控制器
 *  处理articles相关请求
 */
const findArticle = require('./../tools/findArticle')
class articles {
  // 根据文章id返回文章数据
  static async find (ctx, next) {
    await findArticle.main(ctx, next)
  }
}

module.exports = articles
