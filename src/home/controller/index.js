'use strict';

import Base from './base.js';
import request from "request";
import auth from "../tools/jssdkauth.js";
import config from "../config/config.js";
import log4js from "log4js";

let logger = log4js.getLogger("[home][index]");
let userModule = think.config('mobileUserModule');
export default class extends Base {
    async indexAction() {
        /* 微信网页授权 */
        let CODE = config.DEBUG ? config.DEFAULT_CODE : this.param('code');
        let APPID = config.APPID;
        //缓存APPID,签名用
        await this.session('APPID', config.APPID);
        let SECRET = config.SECRET;
        this.assign({
            'error': false
        });
        if (CODE == '') {//if code is null, toLogin
            logger.error('[index] - CODE:' + CODE);
            logger.error('[index] - Current Url: ' + this.http.url);
            CODE = this.param('code');//再次拉取CODE
            if (CODE == '') {
                this.assign({
                    'error': true
                });
                return this.display();
            }
        }
        logger.debug('[index] - CODE:' + CODE);
        // let accessTokenUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + APPID + '&secret=' + SECRET + '&code=' + CODE + '&grant_type=authorization_code';
        let accessTokenUrl = config.ACCESS_TOKEN_URL.format({
            APPID: APPID,
            SECRET: SECRET,
            CODE: CODE
        });
        //获取accessToken
        let accessToken = await (() => {
            let fn = think.promisify(request.get);
            return fn({
                url: accessTokenUrl
            });
        })();
        accessToken = JSON.parse(accessToken.body);
        let OPENID = accessToken.openid;
        let ACCESS_TOKEN = accessToken.access_token;
        //检验access_token是否有效
        // let checkAcessTokenUrl = 'https://api.weixin.qq.com/sns/auth?access_token=' + ACCESS_TOKEN + '&openid=' + OPENID;
        let checkAcessTokenUrl = config.ACCESS_TOKEN_URL.format({
            ACCESS_TOKEN: ACCESS_TOKEN,
            OPENID: OPENID,
        });
        let checkAcessToken = await (() => {
            let fn = think.promisify(request.get);
            return fn({
                url: checkAcessTokenUrl
            });
        })();
        checkAcessToken = JSON.parse(checkAcessToken.body);
        if (checkAcessToken.errcode !== 0) {
            logger.error('[index] - ACCESS_TOKEN IS INVALID');
        }
        else {
            logger.debug('[index] - ACCESS_TOKEN IS RIGHT')
        }
        /*
         * 微信JSSDK授权
         * 过期时间7200s
         * 请求限制两千次
         * */
        await this.cache("signAcess", async() => {
            let signAcess = await auth(APPID, SECRET);
            logger.info('[index] - 缓存为空重新设置缓存');
            return signAcess;
        }).then(async(data) => {
            //获取当前时间戳
            let createTimestamp = () => {
                return parseInt(new Date().getTime() / 1000) + '';
            };
            let time = createTimestamp();
            if (time - data.timestamp > 7000 || data.jsapi_ticket == undefined) {
                logger.info('[index] - 缓存过期再次发起验证');
                //首先要清空缓存
                await this.cache('signAcess', null).then(async() => {
                    let signAcess = await auth(APPID, SECRET);//再次发起验证
                    await this.cache("signAcess", signAcess);//设置新缓存
                });
            }
        });

        //设置session
        await this.session('openid', OPENID);
        //拉取用户信息
        // let userinfoUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + ACCESS_TOKEN + '&openid=' + OPENID + '&lang=zh_CN';
        let userinfoUrl = config.USER_INFO_URL.format({
            ACCESS_TOKEN: ACCESS_TOKEN,
            OPENID: OPENID
        });
        let userInfo = await (() => {
            let fn = think.promisify(request.get);
            return fn({
                url: userinfoUrl
            });
        })();
        logger.debug("[index] - userInfo requiest url: " + userinfoUrl);
        logger.debug("[index] - userInfo: " + JSON.stringify(userInfo.body));
        userInfo = JSON.parse(userInfo.body);
        await this.session('userinfo', userInfo);
        //获取token
        let token = await (() => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ':' + userModule.port + userModule.path + 'login',
                form: {
                    user_id: OPENID,
                    name: userInfo.nickname,
                    source: 'wechat',
                    city: userInfo.city,
                    avatar: userInfo.headimgurl == null || userInfo.headimgurl < 4 ? "/static/images/avatar.png" : userInfo.headimgurl
                }
            });
        })();
        logger.debug("[index] - token: " + JSON.stringify(token.body));
        token = JSON.parse(token.body).result.token;
        //设置token到session
        await this.session('token', token);
        return this.display();
    }
}
