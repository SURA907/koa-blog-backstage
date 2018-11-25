/**
 * 集中管理一些配置
 *  DB: mongodb数据库
 *  HTTP_PORT: http端口
 *  HTTPS_PORT: https端口
 *  CA_CERT: https使用的ca证书
 */
const configs = {
  DB: 'mongodb://localhost/test',
  HTTP_PORT: 8080,
  HTTPS_PORT: 443,
  CA_CERT: {
    KEY: '',
    CERT: ''
  }
}

module.exports = configs
