'use strict';

import Base from './base.js';
import request from 'request';

let userModule = think.config('mobileUserModule');
let token ;
let userinfo;
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
        let getSelfinfo = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + 'me/allinfo', //线上地址
                form: {token: token}
            });
        };
        let me = await getSelfinfo();
        try {
            me = JSON.parse(me.body).result;
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

    async editAction() {
        let userinfo = await this.session('userinfo');
        let token = await this.session('token');
        let localIds = this.post('localIds');
        let getData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ':' + userModule.port + userModule.path + 'editself',
                form: {token: token, name:userinfo.name, city:userinfo.city, avatar:localIds[0]}
            });
        };
        let editSelf = await getData();
        try {
            editSelf = JSON.parse(editSelf.body).result;
        }
        catch (e){
            console.log(e);
        }
        this.assign({
            'editSelf':editSelf
        });
    }
}
