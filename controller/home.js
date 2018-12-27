/**
 * home 模块
 * 处理首页相关的请求
 */
const articlesModel = require('./../model/model').getModel('articles')

const HomeController = {

  // 首页参数的请求
  async index(ctx, next) {
    // 检查参数
    if (ctx.query.time < 0 || ctx.query.page < 0) {
      ctx.throw(400, 'parameters are not allowed')
    } else {
      // 检索数据库
      let index_data = await articlesModel.find({
        is_delete: 'NO',
        article_release_time: {$lte: ctx.query.time}
      }, {
        _id: 1,
        article_title: 1,
        article_description: 1,
        article_img: 1,
        article_type: 1,
        article_release_time: 1,
        article_last_updata_tiem: 1,
        article_author_id: 1,
        article_author: 1,
      }).sort({article_release_time: -1}).limit(6).skip(6*ctx.query.page)
      
      // 返回数据
      ctx.body = {
        code: 0,
        status: 200,
        message: 'complete',
        data_items: index_data
      }
    }
  }

}


module.exports = HomeController
