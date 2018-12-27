/**
 * 对密码进行hash操作
 */
const encrypt = require('crypto')


function crypt(str) {
  let suffix = 'ajsdioasjdiosidsjiojasiodjsai'
  let hashObj = encrypt.createHash('sha256')
  let result = hashObj.update(str+suffix).digest('hex')
  return result
}

module.exports = crypt