/**
 * Created by Jeff on 2016/11/21.
 */
'use strict';

import Base from './base.js';
import request from "request";
import fs from "fs";

let token = '';
let adModule = think.config('adModule');
let fileModule = think.config('fileModule');
let photoUrl = [];
let ad_id;
//编辑广告页，事先放入当前photourl
export default class extends Base {
    async __before() {
        token = await this.session('token');
    }

    async indexAction() {
        ad_id = this.param('ad_id');
        let getAd = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: adModule.host+':'+adModule.port+adModule.path+'admin/getone',
                form:{token: token, ad_id: ad_id}
            });
        }
        let adinfo = await getAd();
        console.log(adinfo.body);
        adinfo = JSON.parse(adinfo.body).result;
        photoUrl = adinfo.photos;
        this.assign({
            "ad": adinfo
        })
        return this.display();
    }
    //添加广告
    async addAction() {
        let name = this.post('name');
        let status = this.post('status');
        let location = this.post('location');
        let url = this.post('url');
        let photos = JSON.stringify(photoUrl);
        let addAd = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: adModule.host + ":" + adModule.port + adModule.path + "admin/edit",
                form: {token: token, ad_id: ad_id, name: name, status: status, location: location, url: url, photos: photos}
            });
        }
        let res = await addAd();
        try {
            res = JSON.parse(res.body);
            if (res.status.return_code == "0") {
                this.success();
            }
            else {
                this.fail();
            }
        }
        catch (e) {
            console.log(e);
            this.fail();
        }
    }

    //多图上传
    //图片变更的时候发起上传请求
    //拿到url推入图片数组
    //点击删除发送图片所在index,从图片数组中删除改图片url
    //点击保存后，发送保存图片请求
    async uploadimgAction() {
        let formData = {
            file: fs.createReadStream(this.file('file').path)
        };
        let upload_image = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: fileModule.host + ":" + fileModule.port + fileModule.path,
                formData: formData
            });
        };
        let res = await upload_image();
        try {
            res = JSON.parse(res.body);
            if (res.status.return_code == '0') {
                this.success('上传成功');
            }
        }
        catch (e) {
            console.log(e);
            this.fail()
        }
        photoUrl.push(res.result.url);
    }
    //从图片数组中删除图片
    async deleteimgAction() {
        let index = this.post('index');
        photoUrl.splice(index,1);
    }
}

