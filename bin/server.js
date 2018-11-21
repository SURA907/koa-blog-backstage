const http = require('http')
const https = require('http2')
const fs = require('fs')

const app = require('./../app')

// http server
const httpServer = http.createServer(app)

// https server option
// const httpsOption = {
//   key: fs.readFileSync(''),
//   cert: fs.readFileSync('')
// }

// https server
// const httpsServer = https.createSecureServer(httpsOption, app)

httpServer.listen(8080)
// httpsServer.listen(443)
