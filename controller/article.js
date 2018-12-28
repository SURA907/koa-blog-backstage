/**
 * articles控制器
 *  处理articles相关请求
 */
// 引入资源查找模块
const findResource = require('./../tools/findResource')
// 一如资源更新模块
const updateResource = require('./../tools/updateResource')
// 引入model
const articles = require('./../model/model').getModel('articles')
// 引入redis
const redis_client = require('./../tools/redis')

const articlesController = {

  // 根据时间戳和页数返回文章列表
  async get_index (ctx, next) {
    let time = ctx.query.time || ''
    let page = ctx.query.page || ''
    time = time.trim()
    page = page.trim()
    if (time < 0 || page < 0) {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    let index_data = await articles.find({
      is_delete: 'NO',
      article_release_time: {$lte: time}
    }, {
      _id: 1,
      article_title: 1,
      article_description: 1,
      article_img: 1,
      article_type: 1,
      article_theme: 1,
      article_release_time: 1,
      article_last_updata_tiem: 1,
      article_author_id: 1,
      article_author: 1,
    }).sort({article_release_time: -1}).limit(6).skip(6*page)
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete',
      data: index_data
    }
  },

  // 根据文章id返回文章数据
  async find (ctx, next) {
    let id = ctx.params.id || ''
    id = id.trim()
    if (id.length !== 24) {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    let result = await findResource(articles, redis_client, id, 'article')
    if (result === null) {
      // 资源不存在
      ctx.throw(404, 'resource is not exist')
    } else {
      ctx.body = {
        code: 0,
        status: 200,
        message: 'complete',
        from: result.from,
        data: result.data
      }
    }
  },

  // 添加文章
  async create_article (ctx, next) {
    // 接收并检查参数
    let article_title = ctx.request.body.article_title || ''
    let article_description = ctx.request.body.article_description || ''
    let article_type = ctx.request.body.article_type || ''
    let article_theme = ctx.request.body.article_content || ''
    let article_content = ctx.request.body.article_content || ''
    let article_img = ctx.request.body.article_img || ''
    article_title = article_title.trim()
    article_description = article_description.trim()
    article_type = article_type.trim()
    article_theme = article_theme.trim()
    article_content = article_content.trim()
    article_img = article_img.trim()
    if (article_title === '' || article_description === '' || article_type === '' || article_content === '' || article_theme === '') {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    let time = new Date().getTime()
    // 插入数据
    await articles.insertMany({
      article_title: article_title,
      article_description: article_description,
      article_type: article_type,
      article_theme: article_theme,
      article_content: article_content,
      article_img: article_img,
      article_release_time: time,
      article_last_update_time: time,
      article_author: ctx.user_status.username,
      article_author_id: ctx.user_status.id,
      is_delete: 'NO'
    })
    // 响应信息
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete'
    }
  },

  // 更新文章
  async update_article (ctx, next) {
    // 接收并检查参数
    let article_id = ctx.params.id || ''
    let article_title = ctx.request.body.article_title || ''
    let article_description = ctx.request.body.article_description || ''
    let article_type = ctx.request.body.article_type || ''
    let article_theme = ctx.request.body.article_content || ''
    let article_content = ctx.request.body.article_content || ''
    let article_img = ctx.request.body.article_img || ''
    article_id = article_id.trim()
    article_title = article_title.trim()
    article_description = article_description.trim()
    article_type = article_type.trim()
    article_theme = article_theme.trim()
    article_content = article_content.trim()
    article_img = article_img.trim()
    if (article_id === '' || article_title === '' || article_description === '' || article_type === '' || article_content === '' || article_theme === '') {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    // 寻找资源
    let result = await findResource(articles, redis_client, article_id, 'article')
    if (result === null) {
      // 资源不存在
      ctx.throw(404, 'resource is not exist')
    }
    if (result.data.article_author_id !== ctx.user_status.id) {
      // 此用户不是文章的发布者
      ctx.throw(401, 'you do not have the access permission')
    } else {
      await updateResource(articles, redis_client, article_id, 'article', {
        article_title: article_title,
        article_description: article_description,
        article_type: article_type,
        article_img: article_img,
        article_theme: article_theme,
        article_content: article_content
      })
      ctx.body = {
        code: 0,
        status: 200,
        message: 'complete'
      }
    }
  },

  // 删除文章
  async delete_article (ctx, next) {
    // 接收并检查参数
    let article_id = ctx.params.id || ''
    article_id = article_id.trim()
    if (article_id === '') {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    let result = await findResource(articles, redis_client, article_id, 'article')
    if (result === null) {
      // 资源不存在
      ctx.throw(404, 'resource is not exist')
    }
    if (result.data.article_author_id !== ctx.user_status.id) {
      // 此用户不是文章的发布者
      ctx.throw(401, 'you do not have the access permission')
    } else {
      await updateResource(articles, redis_client, article_id, 'article', {
        is_delete: 'YES'
      })
      ctx.body = {
        code: 0,
        status: 200,
        message: 'complete'
      }
    }
  },
}

module.exports = articlesController
