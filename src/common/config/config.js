'use strict';
/**
 * config
 */
export default {
    encoding: "utf-8",
    timeout: 120,
    resource_on: true, //是否开启静态资源解析功能
    resource_reg: /^(static\/|[^\/]+\.(?!js|html)\w+$)/, //判断为静态资源请求的正则
    log_error: true, //是否打印错误日志
    log_request: false, //是否打印请求的日志
    // 配置前缀地址
    server: {
        host: "http://www.nature.com",
        port: 80,
        path: "/",
        log: __dirname
    },
    // 配置其他请求地址
    //广告模块 adModule

    adModule: {
        host:'http://59.110.42.123',
        port: 24071,
        path:"/",
        log:__dirname
    },
    //场地模块 areaModule
    areaModule:{
        host:'http://59.110.42.123',
        port: 24072,
        path:"/",
        log:__dirname
    },
    //作品模块 workModule
    workModule:{
        host:'http://59.110.42.123',
        port: 24074,
        path:"/",
        log:__dirname
    },
    //展览模块 actModule
    actModule:{
        host:'http://59.110.42.123',
        port: 24075,
        path:"/",
        log:__dirname
    },
    //搜索模块 searchModule
    searchModule:{
        host:'http://59.110.42.123',
        port:24076,
        path:"/",
        log:__dirname
    },
    //心情模块  moodModule
    moodModule:{
        host:'http://59.110.42.123',
        port:24077,
        path:"/",
        log:__dirname
    },
    //文章模块  articleModule
    articleModule:{
        host:'http://59.110.42.123',
        port: 24078,
        path:"/",
        log:__dirname
    },
    //评论模块  commentModule
    commentModule:{
        host:'http://59.110.42.123',
        port:24079,
        path:"/",
        log:__dirname
    },
    //通知模块  noticeModule
    noticeModule:{
        host:'http://59.110.42.123',
        port:24080,
        path:"/",
        log:__dirname
    },
    //交易模块 orderModule
    orderModule:{
        host:'http://59.110.42.123',
        port:24081,
        path:"/",
        log:__dirname
    },
    //手机用户模块 mobileUserModule
    mobileUserModule:{
        host:'http://59.110.42.123',
        port: 9999,
        path:"/",
        log:__dirname
    },
    //管理员模块 adminModule
    adminModule:{
        host:'http://59.110.42.123',
        port: 9998,
        path:"/",
        log:__dirname
    },
    //文件服务模块
    fileModule:{
        host:'http://59.110.42.123',
        port: 7777,
        path:"/",
        log:__dirname
    }
};
