/**
 * 路由模块
 * 切割请求
 * reast api
 */
const router = require('koa-router')()

// 引入controller
const articles = require('../controllers/articles')
const users = require('../controllers/users')
const mails = require('../controllers/mails')
const comments = require('../controllers/comments')

// 用户登录
router.post('/users/signin', users.signin)
// 用户注册
router.post('/users', users.signup)
// 根据token获取当前用户公开信息（用户名、头像等）
router.get('/users/public', users.public)
// 修改密码
router.put('/users', users.change_password)

// 发送用户注册邮件
router.post('/mail/signup', mails.signup)

// 首页信息
router.get('/articles', articles.get_index)
// 根据文章唯一标识符获取文章
router.get('/articles/:id', articles.find)
// 获取当前用户创建的所有文章数据，不包含文章主体
router.get('/articles/users/own', articles.own_articles)
// 新建文章
router.post('/articles', articles.create_article)
// 修改文章
router.put('/articles/:id', articles.update_article)
// 删除文章
router.delete('/articles/:id', articles.delete_article)

// 根据获取文章id获取文章对应所有评论
router.get('/comments', comments.get_comments_by_article_id)
// 增加评论
router.post('/comments', comments.create)
// 删除评论
router.delete('/comments/:id', comments.delete)

module.exports = router.routes()
