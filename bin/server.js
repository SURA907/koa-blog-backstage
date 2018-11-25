/**
 * server配置
 * 此处创建http和https server
 * 接收外部web框架模块处理用户请求
 * 
 * ps：使用http2创建https server
 */
// 引入内置模块
const http = require('http')
const https = require('http2')
const fs = require('fs')

// 引入外部自定义模块
const app = require('./../app')
const HTTP_PORT = require('./../config').HTTP_PORT
const HTTPS_PORT = require('./../config').HTTPS_PORT
const CA_CERT = require('./../config').CA_CERT

// 创建 http server
const httpServer = http.createServer(app)

// https server 配置（CA证书）
// const httpsOption = {
//   key: fs.readFileSync(CA_CERT.KEY),
//   cert: fs.readFileSync(CA_CERT.CERT)
// }

// 创建 https server
// const httpsServer = https.createSecureServer(httpsOption, app)

httpServer.listen(HTTP_PORT)
// httpsServer.listen(HTTPS_PORT)
