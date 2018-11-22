/**
 * model模块
 *  暴露数据库model
 */
// 引入mongoose库
const mongoose = require('mongoose')

// 引入mongodb配置
const DB_CONFIG = require('./../config').DB


// mongodb配置
mongoose.connect(DB_CONFIG)

// 建立数据库连接
const conn = mongoose.connection

// 确认连接建立
conn.on('connected', () => {
  console.log('database connection succeeded')
})

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


// 定义Schema: articleSchema
const articleSchema = new mongoose.Schema({
  article_title: {type: String},
  article_content: {type: String},
  article_release_time: {type: Number},
  article_last_updata_tiem: {type: Number},
  article_author: {type: String},
  article_author_id: {type: String},
  is_delete: {type: String, march: /(^YES$|^NO$)/, default: 'NO'}
})
const articleModel = mongoose.model('articles', articleSchema)

// 向外暴露model
module.exports = {
  getModel(name) {
    return mongoose.model(name)
  }
}
