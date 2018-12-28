/**
 * 邮件发送相关controller
 *  负责发送用户注册验证码 以及 用户修改密码的验证码
 */
const mail_option = require('./../tools/createMailOption')
const send_mail = require('./../tools/sendMail')
const redis_client = require('./../tools/redis')


const mailController = {
  // 验证码邮件：用户注册
  async signup (ctx, next) {
    let mail = ctx.request.body.mail || ''
    // 确认邮箱格式的正则表达式
    let mail_reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    mail = mail.trim()
    // 检查参数
    if (mail === '' || mail_reg.test(mail) !== true) {
      // 参数不正确，抛出400
      ctx.throw(400, 'bad request, check args')
    }
    // 生成验证码
    let verification_code = Math.floor((Math.random()*900000)+100000)
    // 发送邮件
    let mailOptions = mail_option.signup(mail, verification_code)
    let result = await send_mail(mailOptions)
    if (result === 'frequent') {
      // 邮件发送频率过高
      ctx.throw(403, 'your operation is too frequent')
    }
    // 将验证码写入redis，过期时间5分钟
    let key = 'mail-signup-'+mail
    await redis_client.setAsync(key, verification_code, 'PX', 5*60*1000)
    // 返回信息
    ctx.body = {
      code: 0,
      status: 200,
      message: 'complete'
    }
  },

  // 验证码邮件：修改密码
  async change_password (ctx, next) {
    // 格式化并校验参数
    let mail = ctx.request.body.mail || ''
    let mail_reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    mail = mail.trim()
    if (mail === '' || mail_reg.test(mail)) {
      // 参数不合法
      ctx.throw(400, 'bad request, ')
    }
  }
}

module.exports = mailController
