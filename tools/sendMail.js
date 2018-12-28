/**
 * 邮件发送模块
 *  
 */
const mailer = require('nodemailer')
const MAIL_CONF = require('./../config').MAIL
const redis_client = require('./redis')

// 开启一个 SMTP 连接池
const transporter = mailer.createTransport(MAIL_CONF)

// 入口
async function main (options) {
  // redis上锁，过期时间45秒，限制邮件发送频率（以邮箱作为标志）
  let key = 'mail-'+options.to
  let result = await redis_client.setAsync(key, 'complete', 'NX', 'PX', 45*1000)
  if (result !== 'OK') {
    return new Promise(reslove => {
      reslove('frequent')
    })
  }
  // 发送邮件
  transporter.sendMail(options)
  return new Promise(reslove => {
    reslove('OK')
  })
}

module.exports = main
