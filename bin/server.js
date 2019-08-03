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
const USE_HTTPS = require('./../config').USE_HTTPS
const HTTP_PORT = require('./../config').HTTP_PORT
const HTTPS_PORT = require('./../config').HTTPS_PORT
const CA_CERT = require('./../config').CA_CERT
const websocket = require('../lib/chatroom/index')

function execute() {
  const http_server = init_http_server()
  if (USE_HTTPS) {
    const https_server = init_https_server()
    return init_websocket_server(https_server)
  }
  init_websocket_server(http_server)
}

function init_http_server() {
  // 创建 http server
  const server = http.createServer(app)
  server.listen(HTTP_PORT)
  return server
}

function init_https_server() {
  // https server 配置（CA证书）
  const httpsOption = {
    key: CA_CERT.KEY,
    cert: CA_CERT.CERT
  }
  // 创建 https server
  const server = https.createServer(httpsOption, app)
  server.listen(HTTPS_PORT)
  return server
}

function init_websocket_server(server) {
  // 实例化socket.io，监听server实例
  const io = require('socket.io').listen(server)
  // 客户端连接
  io.on('connection', socket => {
    // 客户端发送信息
    socket.on('send message', async ({token, message}) => {
      // 统一处理客户端触发的 send message 事件
      await websocket(io, socket, message, token)
    })
  })
}

// 执行初始化流程
execute()
