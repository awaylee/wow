'use strict';

import Base from './base.js';
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.artist]");
let token = '';
let artist_id;
let artistModule = think.config('artistModule');
let actModule = think.config('actModule');
let addr_lo;
let addr_la;
export default class extends Base {
    async __before() {
        token = await this.session('token');
        addr_lo = await this.session('addr_lo');
        addr_la = await this.session('addr_la');
    }

    async indexAction() {
        /*
         获取大咖详情
         请求方式:post
         请求数据:token，artist_id
         */
        let artist_id = this.param("artist_id");
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "mobile/artist/detail",
            form: {token: token, artist_id:artist_id}
        };
        logger.debug("[index] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[index] res:",JSON.stringify(res));
        let artist = res.result;
        if(res.status.return_code == 0){
            this.assign({
                "artist":artist
            })
        } else {
            this.success('获取大咖详情失败',res.status.reason)
        }

        //获取大咖参与的展览列表
        if(addr_lo == undefined || addr_la == undefined){
            addr_la = '40.2';
            addr_lo = '103.8';
        }
        let params ={
            url: actModule.host + ":" + actModule.port + actModule.path + 'mobile/act/byartist',
            form: {token: token, addr_lo:addr_lo, addr_la:addr_la, artist_id:artist_id}
        };
        logger.debug("[index] param:", JSON.stringify(params));
        let result = await (() => {
            return think.promisify(request.post) (params);
        })();
        result = JSON.parse(result.body);
        logger.debug("[index] result:" + JSON.stringify(result));
        let acts = result.result.acts;
        try {
            this.assign({
                'acts': acts,
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
        if (text == "+关注") {
            //加关注
            let concern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ':' + userModule.port + userModule.path + 'followartist/add',
                    form: {token: token, artist_id: artist_id}
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
                    url: userModule.host + ':' + userModule.port + userModule.path + 'followartist/delete',
                    form: {token: token, artist_id: artist_id}
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
