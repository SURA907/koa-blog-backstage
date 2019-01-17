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
  create_at: {type: String},
  update_at: {type: String},
  type: {type: String},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
// 装载model: users
const userModel = mongoose.model('user', userSchema)

/**
 * title:             文章标题
 * description:       文章描述
 * img:               文章首页图片
 * type:              文章类型(markdown等)
 * content:           文章原文
 * create_at:      文章发布时间
 * update_at:  文章最后修改时间
 * user_id:         文章作者id
 * user:            文章作者用户名
 * is_delete:                 文章是否被删除
 */
// 定义Schema: articles
const articleSchema = new mongoose.Schema({
  title: {type: String, indexes: true},
  description: {type: String},
  img: {type: String, default: null},
  theme: {type: String},
  type: {type: String},
  content: {type: String},
  create_at: {type: Number, indexes: true},
  update_at: {type: Number},
  user_id: {type: String, indexes: true},
  user: {type: String},
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
  article_id: {type: String, indexes: true},
  content: {type: String},
  parents: {type: String},
  create_at: {type: String},
  update_at: {type: String},
  user: {type: String},
  user_id: {type: String, indexes: true},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
const commentModel = mongoose.model('comments', commentSchema)

// 向外暴露model
module.exports = {
  getModel(name) {
    return mongoose.model(name)
  }
}
