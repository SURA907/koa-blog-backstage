/**
 * model模块
 *  暴露数据库model
 */
// 引入mongoose库
const mongoose = require('mongoose')

// 引入mongodb配置
const DB_CONFIG = require('./../config').DB

// 初始化mongodb连接url
let CONFIG_URL = ''
if (DB_CONFIG.connection.username) {
  CONFIG_URL = `${DB_CONFIG.client}://${DB_CONFIG.connection.username}:${DB_CONFIG.connection.password}@${DB_CONFIG.connection.host}:${DB_CONFIG.connection.port}/${DB_CONFIG.connection.name}`
} else {
  CONFIG_URL = `${DB_CONFIG.client}://${DB_CONFIG.connection.host}:${DB_CONFIG.connection.port}/${DB_CONFIG.connection.name}`
}

// mongodb配置
mongoose.connect(CONFIG_URL, {useNewUrlParser: true})

// 建立数据库连接
const conn = mongoose.connection

// 确认连接建立
conn.on('connected', () => {
  console.log('mongodb ready')
})

/**
 * username:    用户名
 * password:    密码
 * avatar:      头像
 * mail:        邮件地址
 * user_type:   用户类型
 * is_delete:   用户是否删除
 */
// 定义Schema: userSchema
const userSchema = new mongoose.Schema({
  username: {type: String, indexes: true},
  password: {type: String},
  avatar: {type: String, default: 'null'},
  mail: {type: String, indexes: true},
  create_time: {type: String},
  update_time: {type: String},
  user_type: {type: String},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
// 装载model: users
const userModel = mongoose.model('user', userSchema)

/**
 * article_title:             文章标题
 * article_description:       文章描述
 * article_img:               文章首页图片
 * article_type:              文章类型(markdown等)
 * article_content:           文章原文
 * article_release_time:      文章发布时间
 * article_last_update_time:  文章最后修改时间
 * article_author_id:         文章作者id
 * article_author:            文章作者用户名
 * is_delete:                 文章是否被删除
 */
// 定义Schema: articles
const articleSchema = new mongoose.Schema({
  article_title: {type: String, indexes: true},
  article_description: {type: String},
  article_img: {type: String, default: null},
  article_theme: {type: String},
  article_type: {type: String},
  article_content: {type: String},
  article_release_time: {type: Number, indexes: true},
  article_last_update_time: {type: Number},
  article_author_id: {type: String, indexes: true},
  article_author: {type: String},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
const articleModel = mongoose.model('articles', articleSchema)

/**
 * comment_content: 评论主体
 * comment_parents: 若此评论为追评，此字段为主楼评论的id
 * comment_release_time: 评论发布时间
 * comment_author: 评论发布者用户名
 * comment_author_id: 评论发布者唯一标识符
 * is_delete: 评论是否已删除
 */
// 定义Schema: comments
const commentSchema = new mongoose.Schema({
  content_article_id: {type: String, indexes: true},
  comment_content: {type: String},
  comment_parents: {type: String},
  comment_release_time: {type: String},
  comment_author: {type: String},
  comment_author_id: {type: String, indexes: true},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
const commentModel = mongoose.model('comments', commentSchema)

// 向外暴露model
module.exports = {
  getModel(name) {
    return mongoose.model(name)
  }
}
