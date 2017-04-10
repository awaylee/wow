'use strict';
/**
 * config
 */
export default {
    debug: (process.env.NODE_ENV || process.argv.splice(2)) == "debug",
    // 配置前缀地址
    server: {
        host: "http://www.nature.com",
        port: 80,
        path: "/",
        log: __dirname
    },
    // 配置其他请求地址
    service: {
        check_token: "check",
        user_online: "user/online",
        user_remain: "user/remain",
    }
};
