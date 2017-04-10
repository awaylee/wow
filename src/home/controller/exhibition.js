'use strict';

import Base from './base.js';
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.exhibition]");
let token = "";
let act_id;
let addr_lo;
let addr_la;
let userModule = think.config('mobileUserModule');
let areaModule = think.config('areaModule');
let actModule = think.config('actModule');
export default class extends Base {
    //获取用户token
    async __before() {
        token = await this.session('token');
        addr_lo = await this.session('addr_lo');
        addr_la = await this.session('addr_la');
    }

    //获取所有场地
    async indexAction() {
        let isAndroid = await this.session('isAndroid');
        if(addr_lo == undefined || addr_la == undefined){
            addr_la = '40.2';
            addr_lo = '103.8';
        }
        let param ={
            url: actModule.host + ":" + actModule.port + actModule.path + 'mobile/act/getlist',
            form: {token: token, addr_lo:addr_lo, addr_la:addr_la}
        };
        logger.debug("[index] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[index] res:" + JSON.stringify(res));
        let acts = res.result.acts;
        try {
            this.assign({
                'acts': acts,
                'isAndroid':isAndroid
            });
        }
        catch (e){
            console.log(e);
        }
        return this.display();
    }

    //关注的添加与删除
    async concernAction() {
        let text = this.post('text');
        if (text == "0") {
            //加关注
            let concern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ':' + userModule.port + userModule.path + 'likeact/add',
                    form: {token: token, act_id: act_id}
                });
            };
            let res = await concern();
            try {
                res = JSON.parse(res.body);
            }
            catch (e){
                console.log(e);
            }
            if (res.status.return_code == "0") {
                this.success('添加关注成功');
            }
            else {
                this.fail('添加关注失败');
            }
        }
        else {
            let concern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ':' + userModule.port + userModule.path + 'likeact/delete',
                    form: {token: token, act_id: act_id}
                });
            };
            let res = await concern();
            try {
                res = JSON.parse(res.body);
            }
            catch (e){
                console.log(e);
            }
            if (res.status.return_code == "0") {
                this.success('取消关注成功');
            }
            else {
                this.fail('取消关注失败');
            }
        }
    }
}
