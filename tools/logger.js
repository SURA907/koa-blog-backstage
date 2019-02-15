const path = require('path')
const log4js = require('koa-log4')

// 日志配置
log4js.configure({
  appenders: {
    access: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //生成文件的规则
      filename: path.join('logs/', 'access.log') //生成文件名
    },
    out: {
      type: 'console'
    }
  },
  categories: {
    default: { appenders: [ 'out' ], level: 'info' },
    access: { appenders: [ 'access' ], level: 'info' },
  }
})

module.exports = () => log4js.koaLogger(log4js.getLogger('access'))
