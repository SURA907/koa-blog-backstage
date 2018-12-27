/**
 * 用户相关controller
 */
const fs = require('fs')
const jwt = require('jsonwebtoken')
const user = require('./../model/model').getModel('user')
const hash = require('./../tools/hash')

const PUBLIC_KEY_PATH = require('./../config').TOKEN_KEY.PUBLIC_KEY


const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH)

const user_controller = {
  
  // 登录
  async signin (ctx, next) {
    let username = ctx.body.username || ''
    let password = ctx.body.password || ''
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
            create_time: result[0].create_time,
            update_time: result[0].update_time,
            user_type: result[0].user_type,
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

  },

  // 根据用户id获取用户公开信息（用户名，头像等）
  async public (ctx, next) {
    
  },

  // 修改密码
  async change_password (ctx, next) {

  }
}


module.exports = user_controller
