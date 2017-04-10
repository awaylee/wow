'use strict';

import Base from './base.js';
import fs from 'fs';
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[admin.addart]");
let actModule = think.config('actModule');
let fileModule = think.config('fileModule');
let token;
let exhibitionUrl;
let actUrl;
let photosUrl = [];
export default class extends Base {
    async __before() {
        token = await this.session('token');
    }
    async indexAction() {
        this.assign({
            "exhibition": true
        });
        //获取场地列表
        let params = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/act/getlist",
            form: {token: token}
        };
        logger.debug("[index] param:",JSON.stringify(params));
        let result = await (() =>{
            return think.promisify(request.post) (params)
        })();
        result = JSON.parse(result.body);
        logger.debug("[index] result:",JSON.stringify(result));
        let acts = result.result.acts;
        if(result.status.return_code == 0){
            this.assign({
                "acts":acts
            })
        } else {
            this.success('获取场地列表失败',result.status.reason)
        }

        return this.display();
    }

    async addAction() {
        let name = this.post('name');
        let avatar = this.post('avatar');
        let pictures = this.post('pictures')
        let act_ids = this.post('act_ids');
        let intro = this.post('intro');

        let param = {
            url:actModule.host + ":" + actModule.port + actModule.path + "admin/artist/add",
            form:{
                token: token,
                name: name,
                avatar: avatar,
                pictures: pictures,
                act_ids: act_ids,
                intro: intro
            }
        };
        logger.debug("[add] param:",JSON.stringify(param));

        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[add] res:",JSON.stringify(res));
        if(res.status.return_code == '0'){
            this.success("添加成功");
        }
        else{
            this.fail("添加失败",res.status.reason);
        }
    }

}
