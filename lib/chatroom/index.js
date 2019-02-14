const fs = require('fs')
// 应用了缓存策略的资源查找模块
const findResource = require('../../tools/findResource')
// jsonwebtoken库
const jwt = require('jsonwebtoken')
// user model
const user = require('../../model/model').getModel('user')
// redis client
const redis_client = require('../../tools/redis')
// 实例化socket.io，监听3000端口
const io = require('socket.io')(3000)
// 用于token加解密的密匙
const PRIVATE_KEY = require('../../config').TOKEN_KEY.PRIVATE_KEY

// 返回错误提示信息
async function request_error(message) {
  return new Promise(reslove => {
    reslove({
      code: 1,
      message: message
    })
  })
}

// 解析token
async function parse_token(token) {
  if (token === '') {
    // 没有token
    return request_error('no token')
  }
  try {
    let jwt_user_status = await jwt.verify(token, PRIVATE_KEY)
    jwt_user_status = jwt_user_status.data
    let result = await findResource(user, redis_client, jwt_user_status.id, 'user')
    if (result === null) {
      return request_error('user is not exist')
    }
    let db_user_status = result.data
    if (db_user_status === {} || db_user_status.update_at !== jwt_user_status.update_at) {
      // 用户信息已修改过，token无效
      return request_error('Invalid token')
    } else {
      // token有效
      return new Promise(reslove => {
        reslove({
          code: 0,
          user_status: db_user_status
        })
      })
    }
  } catch(error) {
    return request_error('token parse error')
  }
}

// 客户端连接
io.on('connection', socket => {
  socket.on('chat message',async ({token, message}) => {
    let user_message = message || ''
    user_message = user_message.trim()
    if (user_message.length === 0) {
      socket.emit('chat message', {
        code: 1,
        message: 'Message cannot be empty'
      })
    } else {
      // 解析token，确认用户信息
      let result = await parse_token(token)
      if (result.code !== 0) {
        // token解析失败
        // 向当前客户端发送错误提示信息
        socket.emit('chat message', result)
      } else {
        // token解析成功
        // 想所有客户端广播信息
        io.emit('chat message', {
          code: 0,
          message: user_message,
          user: result.user_status.username,
          user_id: result.user_status._id,
          create_at: new Date().getTime()
        })
      }
    }
  })
})
