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
  console.log('database connection succeeded')
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
  username: {type: String},
  password: {type: String},
  avatar: {type: String, default: 'null'},
  mail: {type: String},
  user_type: {type: String},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
// 装载model: users
const userModel = mongoose.model('users', userSchema)

/**
 * article_title:             文章标题
 * article_description:       文章描述
 * article_content:           文章原文
 * article_release_time:      文章发布时间
 * article_last_updata_tiem:  文章最后修改时间
 * article_author_id:         文章作者id
 * article_author:            文章作者用户名
 * is_delete:                 文章是否被删除
 */
// 定义Schema: articles
const articleSchema = new mongoose.Schema({
  article_title: {type: String},
  article_description: {type: String},
  article_content: {type: String},
  article_release_time: {type: Number},
  article_last_updata_tiem: {type: Number},
  article_author_id: {type: String},
  article_author: {type: String},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
const articleModel = mongoose.model('articles', articleSchema)

// 向外暴露model
module.exports = {
  getModel(name) {
    return mongoose.model(name)
  }
}
