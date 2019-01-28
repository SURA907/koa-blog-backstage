- ## 论坛系统的后端部分
> 毕业设计打算做一个前后端分离的论坛</br>
> 这个仓库放后端部分</br>
> readme暂时占坑，日后追加内容</br>
> 实际入口文件为：bin/server.js
---

- ## push日志
记录一下开发过程
> - ### 2019-01-28
>> 修复了缓存策略中用于解锁并刷新资源的lua脚本</br>
>> 之前的版本使用模板字符串生成脚本，特殊符号会导致程序异常</br>
>> note: emmm(╯‵□′)╯︵┻━┻

> - ### 2019-01-27
>> 减少放入token中的信息，缩减token体积</br>
>> note: 没什么需要记录的

> - ### 2019-01-23
>> 之前在本地测试的时候，向一篇文章同时发起3000次请求</br>
>> 发现极少部分请求越过了缓存和分布式锁，直接去查询了数据库</br>
>> 分析之后发现问题出在解锁并刷新缓存的lua脚本上</br>
>> 这个lua脚本中先正常解锁，然后刷新缓存数据</br>
>> 解锁完成到数据刷新完成的这一段时间内，请求可以直接上锁之后访问数据库</br>
>> 总体来说锁应该在缓存刷新完成之后解除</br>
>> 略微修改lua脚本</br>
>> note: 酸爽(╯‵□′)╯︵┻━┻

> - ### 2019-01-20
>> 处理了邮箱地址大小写不敏感的问题</br>
>> note: 将邮箱地址全部转换为小写，防止同一邮箱被重复注册；前后端整合过程中确实能发现许多问题

> - ### 2019-01-18
>> 处理因为model字段重命名导致的一些小问题</br>
>> note: 今日没什么需要记录的

> - ### 2019-01-17
>> 稍微修改一下model的命名(之前的命名实在惨不忍睹)</br>
>> 关于 '错误捕获' 模块的修改(/tools/errHandle.js)
>>> 之前操作未成功会返回相关错误的http状态码</br>
>>> 这种方式会导致前端无法顺利获取错误提示信息</br>
>>> 故先修改为即使出错依旧返回200，前端通过返回信息中的code和status判断操作是否成功</br>
>>
>> 略微修改跨域处理模块(/tools/resourceSharing.js)
>>> 之前对OPTIONS请求的处理有失妥当，OPTIONS请求会导致koa-jsonwebtoken模块抛出401</br>
>>> 修改为检测到OPTIONS请求直接设置相应响应头，并返回200
>>
>> note: 还好关于'错误处理'和'跨域支持'在早期就完全抽出来了，修改起来比较省力o(*￣▽￣*)ブ


> - ### 2019-01-05
>> 缓存策略定型</br>
>> note: 以后如果没有出现致命错误就不再修改了，当前版本对于毕设来说足够了

> - ### 2019-01-01
>> 2019年的第一天，依旧在折腾缓存策略</br>
>> note: 这种挖东墙补西墙的感觉真的是酸爽::>_<::

> - ### 2018-12-31
>> 配置jsonwebtoken，完成用户登录</br>
>> 又又又又修改redis缓存策略，这次主要针对资源更新部分</br>
>> note: 看来缓存策略这一部分真的是比较难啃，感觉这个版本依旧有问题，任重道远(╯‵□′)╯︵┻━┻

> - ### 2018-12-29
>> 完成用户注册功能</br>
>> note: 今日没什么需要记录的

> - ### 2018-12-28
>> 配置邮件发送服务</br>
>>> 用网易免费邮箱发的邮件几乎都直接被扔进垃圾箱了(╯‵□′)╯︵┻━┻
>>
>> note: 用户相关功能正在推进</br>

> - ### 2018-12-27
>> 又又又一次修改redis缓存策略</br>
>>> 经过此次修改，提高redis缓存策略泛用性</br>
>>> 之前的redis缓存策略与controller耦合较高，且仅针对文章</br>
>>> 鉴于使用token机制需要频繁检测用户信息，故决定之后对用户信息也进行缓存</br>
>>
>> 用户相关功能也可以起步了o(*￣▽￣*)ブ</br>
>> note: 目前毕设开发进度正常，阿门

> - ### 2018-12-09
>> 再次对redis锁及缓存策略做出修改::>_<::</br>
>> 将锁的解除和资源数据的刷新用lua脚本封装到一起</br>
>> 防止在解锁成功后由于 GC pause 等原因造成线程阻塞后 再去刷新数据造成缓存和mongo数据不一致</br>
>> note: emmmmmm，说什么好呢，这次的锁和缓存策略把我 '管脑袋不管屁股' 的一面给彻底暴露出来了（明明之前藏的那么辛苦）(╯‵□′)╯︵┻━┻

> - ### 2018-12-07
>> 昨天写的哪个缓存策略果然不能用/(ㄒoㄒ)/~~</br>
>> 锁的实现有一些问题</br>
>> 今天可算是把缓存策略完善了</br>
>> note: 之后会总结一下的

> - ### 2018-12-06
>> 终于整好文章的redis缓存策略了</br>
>> 得找个时间压力测试一下，验证redis锁是不是在正常干活</br>
>> note: 我这种'管脑袋不管屁股'的写缓存策略实在是煎熬，功能勉强实现，但代码烂的出奇(╯‵□′)╯︵┻━┻

> - ### 2018-12-05
>> 增加跨域支持</br>
>> 前后端开始整合，该'双线作战'了

> - ### 2018-12-01
>> 规范数据库配置(/config.js)</br>
>> 略微修改http错误处理模块</br>
>> 增加access日志模块</br>
>> note: 后端骨架差不多成型，该开始写前端了

> - ### 2018-11-29
>> 分离router和controller</br>
>> note: 之前都是把业务逻辑写在router中的，这次把它分离开来；就目前看来，我写的果然还是'玩具代码'

> - ### 2018-11-28
>> 嗯，明天开始写
---

- ### 以上，合掌
