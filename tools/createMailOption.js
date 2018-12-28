/**
 * 生成用户发送邮件的mail option
 */

const options = {
  // 用户注册邮件格式
  signup(to, verification_code) {
    return  {
      from: '"SURA论坛邮件" <sura907@163.com>', // 发件人
      to: to, // 收件人
      subject: 'SURA论坛-用户注册系统', // 主题
      text: `您好，欢迎成为SURA论坛用户。您的验证码为：${verification_code}，
      验证码有效期5分钟，请不要向任何人泄露您的验证码.
      若您未进行相关操作，请忽略本邮件.`
    }
  },
  // 用户修改密码邮件格式
  change_password(to, verification_code) {
    return {
      from: '"SURA论坛邮件" <sura907@163.com>',
      to: to,
      subject: 'SURA论坛-密码修改系统',
      text: `您好，您正在修改用户密码。验证码为：${verification_code}，
      验证码有效期5分钟，请不要向任何人泄露您的验证码.
      若您未进行相关操作，请忽略本邮件`
    }
  }
}

module.exports = options