/**
 * 集中管理一些配置
 *  DB: mongodb数据库
 *  REDIS: redis数据库
 *  HTTP_PORT: http端口
 *  HTTPS_PORT: https端口
 *  CA_CERT: https使用的ca证书位置
 *  TOKEN_KEY: token加解密用到的RSA密匙位置
 */
const configs = {
  DB: {
    client: 'mongodb',
    connection: {
      host: 'localhost',
      port: '27017',
      name: 'test',
      username: '',
      password: '',
    }
  },
  REDIS: {
    host: 'localhost',
    port: '6379',
    db: 0,
    // password: ''
  },
  HTTP_PORT: 8081,
  HTTPS_PORT: 443,
  CA_CERT: {
    KEY: '',
    CERT: ''
  },
  TOKEN_KEY: {
    PUBLIC_KEY: './RSA/TOKEN/server.pem',
    PRIVATE_KEY: './RSA/TOKEN/server.key'
  }
}

module.exports = configs
