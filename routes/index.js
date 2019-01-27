/**
 * 路由模块
 *  切割请求
 */
const router = require('koa-router')()

// 引入controller
const articles = require('./../controller/article')
const users = require('./../controller/users')
const mail = require('./../controller/mail')

// 鉴权中间件
const accessPermission = require('./../tools/accessPermission')

/**
 * reast api
 *  */
// public api
// 首页信息
router.get('/articles', articles.get_index)
// 根据文章唯一标识符获取文章
router.get('/articles/:id', articles.find)
// 用户登录
router.post('/users/signin', users.signin)
// 用户注册
router.post('/users', users.signup)
// 发送用户注册邮件
router.post('/mail/signup', mail.signup)

// need login
router.all('*', accessPermission.isSignin)

// 获取当前用户创建的所有文章数据，不包含文章主体
router.get('/articles/users/own', articles.own_articles)
// 新建文章
router.post('/articles', articles.create_article)
// 修改文章
router.put('/articles/:id', articles.update_article)
// 删除文章
router.delete('/articles/:id', articles.delete_article)
// 根据token获取当前用户公开信息（用户名、头像等）
router.get('/users/public', users.public)
// 修改密码
router.put('/users', users.change_password)

module.exports = router.routes()
