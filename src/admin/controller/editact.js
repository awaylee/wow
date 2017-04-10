/**
 * Created by Jeff on 2016/11/23.
 */
'use strict';

import Base from './base.js';
import request from "request";
import fs from 'fs';
let token = ""
let actModule = think.config('actModule');
let labelModule = think.config('labelModule');
let artistModule = think.config('artistModule');
let areaModule = think.config('areaModule');
let workModule = think.config('workModule');
let fileModule = think.config('fileModule');
let videosUrl = [];
let big_photosUrl = [];
let act_id;
export default class extends Base {
    async __before() {
        token = await this.session('token');
    }
    async indexAction() {
        act_id = this.param('act_id');
        let getAct = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: actModule.host +":"+actModule.port+actModule.path+"admin/getone",
                form: {token: token, act_id: act_id}
            });
        }
        let act = await getAct();
        act = JSON.parse(act.body).result;
        //获取有效的标签
        let getLabel = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: labelModule.host +":"+labelModule.port+labelModule.path+"admin/enablename",
                form: {token: token}
            });
        }
        let label = await getLabel();
        label = JSON.parse(label.body).result;
        //获取有效的艺术家
        let getArt = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: artistModule.host +":"+artistModule.port+artistModule.path+"admin/enablename",
                form: {token: token}
            });
        }
        let art = await getArt();
        art = JSON.parse(art.body).result;
        //获取有效的场地
        let getArea = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: areaModule.host +":"+areaModule.port+areaModule.path+"admin/enablename",
                form: {token: token}
            });
        }
        let area = await getArea();
        area = JSON.parse(area.body).result;
        //获取有效的作品
        let getWork = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModule.host +":"+workModule.port+workModule.path+"admin/enablename",
                form: {token: token}
            });
        }
        let work = await getWork();
        work = JSON.parse(work.body).result;
        big_photosUrl = act.photos;
        videosUrl = act.videos;
        this.assign({
            'act':act,
            'labels':label,
            'arts':art,
            'areas':area,
            'works':work
        })
        return this.display();
    }
    async addAction() {
        let name = this.post('name');
        let status = this.post('status');
        let start_time = this.post('start_time');
        let end_time = this.post('end_time');
        let init_likes = this.post('init_likes');
        let init_views = this.post('init_views');
        let price = this.post('price');
        let label_ids = JSON.stringify(this.post('label_ids'));
        let artist_ids = JSON.stringify(this.post('artist_ids'));
        let area_id = this.post('area_id');
        let work_ids = JSON.stringify(this.post('work_ids'));
        let detail = this.post('detail');
        let videos = JSON.stringify(videosUrl);
        let photos = JSON.stringify(big_photosUrl);
        let addAct = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: actModule.host +":"+actModule.port+actModule.path+"admin/edit",
                form:{token: token, act_id: act_id, name: name, status: status, start_time:start_time,
                    end_time: end_time, init_likes:init_likes, init_views: init_views, price: price, label_ids:label_ids,
                    artist_ids:artist_ids,area_id:area_id,photos:photos,videos:videos,work_ids:work_ids,detail:detail}
            });
        }
        let res = await addAct();
        res = JSON.parse(res.body);
        if(res.status.return_code == '0'){
            this.success();
        }
        else{
            this.fail();
        }
    }
    async uploadAction(){
        let item;
        if(this.file().video != undefined){
            item = 'video';
        }
        else if(this.file().big_photos != undefined ){
            item = 'big_photos';
        }
        let formData = {
            file: fs.createReadStream(this.file(item).path)
        };
        console.log(this.file(item).path);
        let upload = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: fileModule.host +":"+fileModule.port+fileModule.path,
                formData: formData
            });
        };
        let res = await upload();
        console.log(res.body);
        res = JSON.parse(res.body);
        switch (item){
            case 'big_photos':
                big_photosUrl.push(res.result.url);
                break;
            case 'video':
                videosUrl.push(res.result.url);
                break;
        }
        try{
            if(res.status.return_code == '0'){
                this.success('请求成功');
            }
        }
        catch(e){
            console.log(e);
            this.fail()
        }
    }
    async deleteimgAction() {
        let index = this.post('index');
        let name = this.post('name');
        switch (name) {
            case 'big_photos':
                big_photosUrl.splice(index, 1);
                break;
            case 'video':
                videosUrl.splice(index, 1);
                break;
        }
    }
}
