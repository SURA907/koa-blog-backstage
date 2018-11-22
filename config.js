/**
 * 集中管理一些配置
 *  DB: mongodb数据库
 *  HTTP_PORT: http端口
 *  HTTPS_PORT: https端口
 */
const config = {
  HTTP_PORT: 8080,
  HTTPS_PORT: 443,
  DB: 'mongodb://localhost/test',
}

module.exports = config
