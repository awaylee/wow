'use strict';

import Base from './base.js';
import request from "request";
import fs from "fs";

let workModule = think.config('workModule');
let token;
let photosUrl = [];
let fileModule = think.config('fileModule');
let artModule = think.config('artistModule');
let areaModule = think.config('areaModule');
export default class extends Base {
    async __before() {
        token = await this.session('token');
    }
    async indexAction() {
        let getArt = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: artModule.host +":"+artModule.port+artModule.path+"admin/enablename",
            form:{token: token}
          });
        }
        let art = await getArt();
        art = JSON.parse(art.body).result;
        let getArea = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: areaModule.host +":"+areaModule.port+areaModule.path+"admin/enablename",
            form:{token: token}
          });
        }
        let area = await getArea();
        area = JSON.parse(area.body).result;
        this.assign({
            'arts':art,
            'areas':area
        })
        return this.display();
    }
    async addAction() {
        let name = this.post('name');
        let status = this.post('status');
        let init_likes = this.post('init_likes')
        let is_sale = this.post('is_sale');
        let price = this.post('price');
        let artist_id = this.post('artist_id');
        let area_id = this.post('area_id');
        let photos = JSON.stringify(photosUrl);
        let attribute = this.post('attribute');
        let description = this.post('description');
        console.log(this.post());
        let addWork = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: workModule.host +":"+workModule.port+workModule.path+"admin/add",
            form:{token: token, name: name, status: status, init_likes:init_likes,
                 is_sale: is_sale, price:price, artist_id: artist_id, area_id:area_id,
                 photos:photos, attribute: attribute, description: description}
          });
        }
        let res = await addWork();
        console.log(res.body);
        try{
            res = JSON.parse(res.body);
            if(res.status.return_code == "0"){
                this.success();
            }
            else{
                this.fail();
            }
        }
        catch(e){
            console.log(e);
            this.fail();
        }
    }
    async uploadAction(){
        let item;
        if(this.file().photos != undefined){
            item = 'photos';
        }
        else{
            this.fail('文件为空');
            return;
        }
        let formData = {
            file: fs.createReadStream(this.file(item).path)
        };
        let upload = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: fileModule.host +":"+fileModule.port+fileModule.path,
            formData: formData
          });
        };
        let res = await upload();
        res = JSON.parse(res.body);
        photosUrl.push(res.result.url);
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
    //从图片数组中删除图片
    async deleteimgAction() {
        let index = this.post('index');
        photoUrl.splice(index,1);
    }
}
