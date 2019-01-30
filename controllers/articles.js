/**
 * articles控制器
 *  处理articles相关请求
 */
// 引入资源查找模块
const findResource = require('./../tools/findResource')
// 引入资源更新模块
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
      create_at: {$lte: time}
    }, {
      _id: 1,
      title: 1,
      description: 1,
      img: 1,
      type: 1,
      theme: 1,
      create_at: 1,
      update_at: 1,
      user: 1,
      user_id: 1,
    }).sort({create_at: -1}).limit(6).skip(6*page)
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

  // 返回当前用户创建的所有文章
  async own_articles (ctx, next) {
    let result = await articles.find({
      user_id: ctx.user_status._id,
      is_delete: 'NO'
    }, {
      _id: 1,
      title: 1,
      description: 1,
      img: 1,
      type: 1,
      theme: 1,
      user: 1,
      create_at: 1,
      update_at: 1,
    }).sort({create_at: -1})
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete',
      data: result
    }
  },

  // 添加文章
  async create_article (ctx, next) {
    // 接收并检查参数
    let title = ctx.request.body.title || ''
    let description = ctx.request.body.description || ''
    let type = ctx.request.body.type || ''
    let theme = ctx.request.body.theme || ''
    let content = ctx.request.body.content || ''
    let img = ctx.request.body.img || ''
    title = title.trim()
    description = description.trim()
    type = type.trim()
    theme = theme.trim()
    content = content.trim()
    img = img.trim()
    if (title === '' || description === '' || type === '' || theme === '' || content === '') {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    let time = new Date().getTime()
    // 插入数据
    let result = await articles.insertMany({
      title: title,
      description: description,
      type: type,
      theme: theme,
      content: content,
      img: img,
      create_at: time,
      update_at: time,
      user: ctx.user_status.username,
      user_id: ctx.user_status._id,
      is_delete: 'NO'
    })
    // 响应信息
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete',
      data: {
        _id: result[0]._id
      }
    }
  },

  // 更新文章
  async update_article (ctx, next) {
    // 接收并检查参数
    let id = ctx.params.id || ''
    let title = ctx.request.body.title || ''
    let description = ctx.request.body.description || ''
    let type = ctx.request.body.type || ''
    let theme = ctx.request.body.theme || ''
    let content = ctx.request.body.content || ''
    let img = ctx.request.body.img || ''
    id = id.trim()
    title = title.trim()
    description = description.trim()
    type = type.trim()
    theme = theme.trim()
    content = content.trim()
    img = img.trim()
    if (id === '' || title === '' || description === '' || type === '' || theme === '' || content === '') {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    // 寻找资源
    let result = await findResource(articles, redis_client, id, 'article')
    if (result === null) {
      // 资源不存在
      ctx.throw(404, 'resource is not exist')
    }
    if (result.data.user_id !== ctx.user_status._id) {
      // 此用户不是文章的发布者
      ctx.throw(401, 'you do not have the access permission')
    } else {
      await updateResource(articles, redis_client, id, 'article', {
        title: title,
        description: description,
        type: type,
        img: img,
        theme: theme,
        content: content,
        update_at: new Date().getTime()
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
    let id = ctx.params.id || ''
    id = id.trim()
    if (id === '') {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    let result = await findResource(articles, redis_client, id, 'article')
    if (result === null) {
      // 资源不存在
      ctx.throw(404, 'resource is not exist')
    }
    if (result.data.user_id !== ctx.user_status._id && ctx.user_status.type !== 'admin') {
      // 此用户不是管理员，且不是文章的发布者
      ctx.throw(401, 'you do not have the access permission')
    } else {
      await updateResource(articles, redis_client, id, 'article', {
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
