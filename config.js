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
    PUBLIC_KEY: './RSA/TOKEN/server.key',
    PRIVATE_KEY: './RSA/TOKEN/server.pem'
  },
  MAIL: {
    host: 'smtp.163.com',
    secureConnection: true, // use SSL
    port: 465,
    secure: true,
    auth: {
      user: 'sura907@163.com', // 发件邮箱
      pass: 'email8806'  // 注意此处为授权码，并非网易账户登陆密码
    }
  }
}
module.exports = configs
