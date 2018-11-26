/**
 * index子路由模块
 * 处理 url === '/' 的用户请求
 */
const router = require('koa-router')()

// 引入articles model
const articles = require('./../../model/model').getModel('articles')

// 接收并检查参数
router.get('/', async (ctx, next) => {
  let getTime = ctx.query.time
  let getPage = ctx.query.page
  if (getTime >= 0 && getPage >= 0) {
    ctx.getTime = getTime
    ctx.getPage = getPage
    await next()
  } else {
    ctx.throw(400)
  }
})

// 查询数据库
router.get('/', async (ctx) => {
  /**
   * 查询条件
   *  早于用户提交查询的时间
   * 一次返回6条数据
   * 根据page分页（从page=0开始）
   */
  let index_data = await articles.find({
    is_delete: 'NO',
    article_release_time: {$lte: ctx.getTime}
  }, {
    _id: 1,
    article_title: 1,
    article_description: 1,
    article_release_time: 1,
    article_last_updata_tiem: 1,
    article_author_id: 1,
    article_author: 1,
  }).sort({article_release_time: -1}).limit(6).skip(6*ctx.getPage)

  ctx.body = {
    code: 0,
    status: 200,
    message: 'completed',
    data: index_data
  }
})

module.exports = router.routes()
