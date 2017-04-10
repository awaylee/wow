'use strict';

import Base from './base.js';
import request from "request";
import fs from 'fs';

let iconUrl;
let big_photosUrl = [];
let photosUrl = [];
let videosUrl = [];
let areaModule = think.config('areaModule');
let token = ''
let fileModule = think.config('fileModule');
export default class extends Base {
    async __before() {
        token = await this.session('token');
    }
    async indexAction() {
        return this.display();
    }
    async addAction() {
        let name = this.post('name');
        let init_fans = this.post('init_fans');
        let tel = this.post('tel');
        let status = this.post('status');
        let addr = this.post('addr');
        let detail = this.post('detail');
        let big_photos = JSON.stringify(big_photosUrl);
        let photos = JSON.stringify(photosUrl);
        let videos = JSON.stringify(videosUrl);
        let addr_ll = JSON.stringify(this.post('addr_ll'));
        let addArea = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: areaModule.host +":"+areaModule.port+areaModule.path+"admin/add",
            form:{token: token, name: name, init_fans: init_fans, tel:tel, status: status,addr:addr, icon:iconUrl, big_photos:big_photos, photos: photos, videos: videos, detail: detail, addr_ll:addr_ll}
          });
        }
        let res = await addArea();
        console.log(res.body);
        res = JSON.parse(res.body);
        if(res.status.reason == "success"){
            this.success()
        }
        else{
            this.fail(res.body.status.reason);
        }
    }
    async uploadAction(){
        let item;
        if(this.file().icon != undefined){
            item = 'icon';
        }
        else if(this.file().big_photos != undefined ){
            item = 'big_photos';
        }
        else if(this.file().photos != undefined ){
            item = 'photos';
        }
        else if(this.file().video != undefined){
            item = 'video';
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
        console.log(res.body);
        res = JSON.parse(res.body);
        switch (item){
            case 'icon':
                iconUrl = res.result.url;
                break;
            case 'photos':
                photosUrl.push(res.result.url);
                break;
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
            case 'photos':
                photosUrl.splice(index, 1);
                break;
            case 'big_photos':
                big_photosUrl.splice(index, 1);
                break;
            case 'video':
                videosUrl.splice(index, 1);
                break;
        }
    }
}
