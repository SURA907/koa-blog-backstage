/**
 * 用户相关controller
 */
const fs = require('fs')
const jwt = require('jsonwebtoken')
const user = require('./../model/model').getModel('user')
const hash = require('./../tools/hash')
const redis_client = require('./../tools/redis')


const PUBLIC_KEY_PATH = require('./../config').TOKEN_KEY.PUBLIC_KEY

const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH)

const user_controller = {
  
  // 登录
  async signin (ctx, next) {
    let username = ctx.request.body.username || ''
    let password = ctx.request.body.password || ''
    username = username.trim()
    password = password.trim()
    // 检查参数
    if (username === '' || password === '') {
      // 必要参数不完整，抛出400
      ctx.throw(400, 'bad request, check args')
    }
    let result = await user.find({
      username: username,
      is_delete: 'NO'
    })
    if (result.length === 0) {
      // 没有相关用户
      ctx.throw(404, 'this user is not exist')
    }
    password = hash(password)
    if (result[0].password !== password) {
      // 密码错误, 抛出401
      ctx.throw(401, 'username and password is not match')
    } else {
      // 密码正确，签发token
      ctx.status = 200
      ctx.body = {
        code: 0,
        status: 200,
        message: 'complete',
        token: jwt.sign({
          data: {
            id: result[0]._id,
            username: result[0].username,
            mail: result[0].mail,
            avatar: result[0].avatar,
            create_at: result[0].create_at,
            update_at: result[0].update_at,
            type: result[0].type,
          },
          // 过期时间，一小时（注意此处时间单位是秒）
          exp: Math.floor(Date.now() / 1000) + 60*60
        }, PUBLIC_KEY, {algorithm: 'RS256'})
      }
    }
  },

  // 用户登出
  async signout (ctx, next) {
    // 签发立即过期的token
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete',
      token: jwt.sign({
        data: null,
        exp: 0
      }, PUBLIC_KEY, {algorithm: 'RS256'})
    }
  },

  // 用户注册
  async signup (ctx, next) {
    // 接收并格式化参数
    let username = ctx.request.body.username || ''
    let password = ctx.request.body.password || ''
    let mail = ctx.request.body.mail || ''
    let verification_code = ctx.request.body.verification_code || ''
    username = username.trim()
    password = password.trim()
    mail = mail.trim()
    verification_code = verification_code.trim()
    let mail_reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    if (username === '' || password.length < 6 || mail_reg.test(mail) !== true || verification_code === '') {
      // 参数不合法
      ctx.throw(400, 'bad request, check args')
    }
    // 检索redis，获取验证码
    let key = 'mail-signup-'+mail
    let result_reids = await redis_client.getAsync(key)
    if (result_reids !== verification_code) {
      // 验证码不正确
      ctx.throw(403, 'Incorrect verification code')
    }
    let result_mongo = await user.find({
      username: username
    })
    if (result_mongo.length !== 0) {
      // 用户名已存在
      ctx.throw(401, 'username is exist')
    }
    password = hash(password)
    let time = new Date().getTime()
    user.insertMany({
      username: username,
      password: password,
      mail: mail,
      avatar: null,
      type: 'general',
      is_delete: 'NO',
      create_at: time,
      update_at: time
    })
    // 删除redis中的验证码
    redis_client.delAsync(key)
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete'
    }
  },

  // 根据用户id获取用户公开信息（用户名，头像等）
  async public (ctx, next) {
    ctx.body = {
      code: 0,
      status: 200,
      data: {
        username: ctx.user_status.username,
        avatar: ctx.user_status.avatar
      }
    }
  },

  // 修改密码
  async change_password (ctx, next) {

  }
}


module.exports = user_controller
