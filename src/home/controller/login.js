/**
 * Created by liwei on 2016/11/28.
 */
'use strict';

import Base from './base.js';
import request from 'request';

let userModule = think.config('mobileUserModule');
let token ;
let userinfo;
let loginUrl = userModule.host +":"+userModule.port+userModule.path;
export default class extends Base {
    async __before() {
        token = await this.session('token');
        userinfo = await this.session('userinfo');
    }

    async indexAction() {
        /*
         获取会员个人信息
         请求方式:post
         请求数据:token
         */
        let getMe = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + 'me/allinfo', //线上地址
                form: {token: token}
            });
        };
        let me;
        let meinfo  = await getMe();
        try {
            me = JSON.parse(meinfo.body).result;
        }
        catch (e){
            console.log(e);
        }
        this.assign({
            'me': me,
            'userinfo':userinfo
        });
        return this.display();//显示
    }
    async verifiAction() {
        //let user_id = this.post('user_id');
        let username = this.post('name');
        //let source = this.post('source');
        //let city = this.post('city');
        //let avatar = this.post('avatar');
        let password = this.post('passwd');
        let toLogin = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host +":"+userModule.port+userModule.path + './login',
                form:{user_id: user_id, name: username, source: source, city:city,
                    passwd: password, avatar:avatar}
            });
        };
        let res = await toLogin();
        console.log(res.body);
        res = JSON.parse(res.body);
        let token = res.result.token;
        await this.session('token', token);
    }
}
