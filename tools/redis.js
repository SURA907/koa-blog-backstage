// 引入redis相关
const redis = require('redis')
const bluebird = require('bluebird')
const REDIS_CONF = require('./../config').REDIS

// 使用bluebird使redis操作转为Promises
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

// 创建redis客户端
const redis_client = redis.createClient(REDIS_CONF)

module.exports = redis_client
