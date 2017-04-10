/**
 * Created by Jeff on 2016/11/22.
 */
'use strict';

import Base from './base.js';
import fs from 'fs';
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[admin.editart]");
let actModule = think.config('actModule');
let fileModule = think.config('fileModule');
let token;
let avatarUrl;
let photosUrl = [];
let videosUrl = [];
let artist_id;
export default class extends Base {
    async __before() {
        token = await this.session('token');
    }
    async indexAction() {
        this.assign({
            "exhibition": true
        });
        //获取大咖详情
        let artist_id = this.param("artist_id");
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/artist/detail",
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

    //修改大咖信息
    async editAction() {
        let artist_id = this.post("artist_id");
        let name = this.post('name');
        let avatar = this.post('avatar');
        let pictures = this.post('pictures');
        let act_ids = this.post('act_ids');
        let intro = this.post('intro');

        let param = {
            url:actModule.host + ":" + actModule.port + actModule.path + "admin/artist/edit",
            form:{
                artist_id: artist_id,
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
