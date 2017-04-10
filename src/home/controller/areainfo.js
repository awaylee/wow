'use strict';

import Base from './base.js';
import request from "request";

let token;
let area_id;
let areaModule = think.config('areaModule');
let userModule = think.config('mobileUserModule');
export default class extends Base {
    //获取用户token
    async __before() {
        token = await this.session('token');
    }

    //探源=》场地详情
    async indexAction() {
        /*
         获取场地详情
         请求方式: post
         请求数据：token, area_id
         */
        area_id = this.param('area_id');
        let isAndroid = await this.session('isAndroid');
        let getAreasData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: areaModule.host + ":" + areaModule.port + areaModule.path + "mobile/getoneinfo",
                form: {token: token, area_id: area_id}
            });
        };
        let areaDetail = await getAreasData();
        try{
            areaDetail = JSON.parse(areaDetail.body).result;
        }
        catch (e){
            console.log(e);
        }
        if(areaDetail == null){
            this.http.redirect('/home/home')
        }
        this.assign({
            'areaDetail': areaDetail,
            'isAndroid': isAndroid
        });
        return this.display();
    }

    //关注的添加与删除
    async concernAction() {
        let text = this.post('text');
        if (text == "+关注") {
            //加关注
            let concern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ':' + userModule.port + userModule.path + 'followarea/add',
                    form: {token: token, area_id: area_id}
                });
            }
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
                    url: userModule.host + ':' + userModule.port + userModule.path + 'followarea/delete',
                    form: {token: token, area_id: area_id}
                });
            }
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
