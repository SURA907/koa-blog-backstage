const http = require('http')
const https = require('http2')
const fs = require('fs')

const app = require('./../app')

// 创建 http server
const httpServer = http.createServer(app)

// https server 配置
// const httpsOption = {
//   key: fs.readFileSync(''),
//   cert: fs.readFileSync('')
// }

// 创建 https server
// const httpsServer = https.createSecureServer(httpsOption, app)

httpServer.listen(8080)
// httpsServer.listen(443)
