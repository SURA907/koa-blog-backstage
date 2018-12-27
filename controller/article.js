/**
 * articles控制器
 *  处理articles相关请求
 */
// 引入资源查找模块
const findResource = require('./../tools/findResource')
// 引入model
const articles = require('./../model/model').getModel('articles')
// 引入redis
const redis_client = require('./../tools/redis')

const articlesController = {
  // 根据文章id返回文章数据
  async find (ctx, next) {
    let id = ctx.params.id || ''
    id = id.trim()
    if (id.length !== 24) {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    let result = await findResource(articles, redis_client, id, 'article')
    ctx.body = result
  },

  // 添加文章
  async create_article (ctx, next) {

  },

  // 修改文章
  async update_article (ctx, next) {

  },

  // 删除文章
  async delete_article (ctx, next) {

  },
}

module.exports = articlesController
