/**
 * server配置
 * 此处创建http和https server
 * 接收外部web框架模块处理用户请求
 * 
 * ps：使用http2创建https server
 */
// 引入内置模块和库
const http = require('http')
const https = require('https')

// 引入外部自定义模块
const app = require('./../app')
const HTTP_PORT = require('./../config').HTTP_PORT
const HTTPS_PORT = require('./../config').HTTPS_PORT
const CA_CERT = require('./../config').CA_CERT
const websocket = require('../lib/chatroom/index')

// 创建 http server
const httpServer = http.createServer(app)

// https server 配置（CA证书）
// const httpsOption = {
//   key: CA_CERT.KEY,
//   cert: CA_CERT.CERT
// }

// 创建 https server
// const httpsServer = https.createServer(httpsOption, app)

// 实例化socket.io，监听https server实例
const io = require('socket.io').listen(httpServer)

// 客户端连接
io.on('connection', socket => {
  // 客户端发送信息
  socket.on('send message', async ({token, message}) => {
    // 统一处理客户端触发的 send message 事件
    await websocket(io, socket, message, token)
  })
})

// 开启端口监听
httpServer.listen(HTTP_PORT)
// httpsServer.listen(HTTPS_PORT)
