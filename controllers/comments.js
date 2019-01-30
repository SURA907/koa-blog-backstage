/**
 * 评论相关controller
 */
// model
const comments = require('../model/model').getModel('comments')
const articles = require('../model/model').getModel('articles')
const ObjectId = require('mongoose').Types.ObjectId
// 资源查找
const findResource = require('../tools/findResource')
// redis
const redis_client = require('../tools/redis')

const commentsController = {
  // 根据动态路由id获取对应文章的评论
  async get_comments_by_article_id (ctx, next) {
    let article_id = ctx.params.id || ''
    article_id = article_id.trim()
    // 参数不合法
    if (article_id.length !== 24) {
      ctx.throw(400, 'bad request, check args')
    }
    // 检查相关文章是否存在
    let result_article = await findResource(articles, redis_client, article_id, 'article')
    if (result === null) {
      ctx.throw(404, 'the article is not exist, so can not get comments')
    }
    // 查找文章评论
    let result_comments = comments.find({
      article_id: article_id,
      is_delete: 'NO'
    })
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete',
      data: result_comments
    }
  },
  
  // 插入评论
  async create (ctx, next) {
    // 接受并校验参数
    let article_id = ctx.params.id || ''
    let content = ctx.request.body.content || ''
    let parents = ctx.request.body.parents || ''
    article_id = article_id.trim()
    content = content.trim()
    parents = parents.trim()
    if (article_id.length !== 24 || content.length === 0 || parents.length === 0) {
      ctx.throw(400, 'bad request, check args')
    }
    let time = new Date().getTime()
    // 检查文章是否存在
    let result_article = await findResource(articles, redis_client, article_id, 'article')
    if (result === null) {
      ctx.throw(404, 'the article is not exist, so can not create comments')
    }
    // 插入评论
    let result_comment = await comments.insertMany({
      article_id: article_id,
      content: content,
      parents: parents,
      create_at: time,
      update_at: time,
      user: ctx.user_status.username,
      user_id: ctx.user_status._id,
      is_delete: 'NO'
    })
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete',
      data: {
        _id: result_comment[0]._id,
        create_at: result_comment[0].create_at,
      }
    }
  },

  // 删除文章
  async delete (ctx, next) {
    // 获取并格式化参数
    let comment_id = ctx.params.id || ''
    comment_id = comment_id.trim()
    if (comment_id.length !== 24) {
      ctx.throw(400, 'bad request, check args')
    }
    // 检查评论是否存在、验证当前用户是否是评论发布者
    let result_comment = await comments.find({
      _id: ObjectId(comment_id),
      is_delete: 'NO'
    })
    if (result_comment.length === 0) {
      // 评论不存在
      ctx.throw(404, 'this comment is not exist')
    } else if (result_comment[0].user_id !== ctx.user_status._id) {
      // 当前用户不是评论创建者
      ctx.throw(401, 'you is not the creater of this comment')
    }
    // 将is_delete字段设置为'YES'
    await comments.updateOne({
      _id: ObjectId(comment_id)
    }, {$set: {
      is_delete: 'YES'
    }})
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete',
    }
  }
}

module.exports = commentsController
