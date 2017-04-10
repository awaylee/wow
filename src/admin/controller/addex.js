/**
 * Created by liwei on 2017/3/29.
 */
import Base from './base.js';
import fs from  "fs";
import request from 'request';
import Log4js from "log4js";

let pictures = {};//轮播图片
let actModule = think.config('actModule');
let fileModule = think.config("fileModule");
let token;
let logger = Log4js.getLogger("[admin.addex]");
let exhibitionUrl;
let actUrl;
let photosUrl = [];

export default class extends Base {
    async __before() {
        token = await this.session('token');
    }

    async indexAction(){
        //获取大咖列表
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/artist/getlist",
            form: {token: token}
        };
        logger.debug("[artlist] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[artlist] res:",JSON.stringify(res));
        let artists = res.result.artists;
        if(res.status.return_code == 0){
            this.assign({
                "artists":artists
            })
        } else {
            this.success('获取大咖列表失败',res.status.reason)
        }
        this.assign({
            exhibition: 'true'
        });
        return this.display();
    }

    //上传图片
    async uploadAction() {
        let item;
        if(this.file().exhibition_img != undefined){
            item = 'exhibition_img';
        }
        else if(this.file().act_img != undefined ){
            item = 'act_img';
        }
        else if(this.file().work_photos != undefined){
            item = 'work_photos';
        }
        else{
            this.fail('文件为空');
            return;
        }
        console.log(item);
        let formData = {
            file: fs.createReadStream(this.file(item).path)
        };
        let upload_image = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: fileModule.host + ":" + fileModule.port + fileModule.path,
                formData: formData
            });
        };
        let res = await upload_image();
        res = JSON.parse(res.body);
        logger.debug("[upload] res:",JSON.stringify(res));
        switch (item) {
            case 'exhibition_img':
                exhibitionUrl = res.result.url;
                break;
            case 'act_img':
                actUrl = res.result.url;
                break;
            case 'work_photos':
                photosUrl.push(res.result.url);
                break;
        }
        try {

            if (res.status.return_code == '0') {

                // pictures[res.result.url] = true;
                // // pictures.push(res.result.url);
                this.success(res.result.url);
                logger.debug("[publish][upload] " + JSON.stringify(res));
            }
        } catch (e) {
            console.log(e);
            this.fail()
        }
    }

    //获取所有大咖列表
    async artlistAction(){
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/artist/getlist",
            form: {token: token}
        };
        logger.debug("[artlist] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[artlist] res:",JSON.stringify(res));
        let artists = res.result.artists;
        if(res.status.return_code == 0){
            this.assign({
                "artists":artists
            })
        } else {
            this.success('获取客服消息失败',res.status.reason)
        }
    }

    //添加展览
    async addAction(){
        let name = this.post('ex_name');
        let start_day = this.post('start_day');
        let end_day = this.post('end_day');
        let area_name = this.post('area_name');
        let addr_name = this.post('addr_name');
        let addr_lo = this.post('addr_lo');
        let addr_la = this.post('addr_la');
        let sponsor_name = this.post('sponsor_name');
        let act_picture = this.post('act_picture');
        let area_picture = this.post('area_picture');
        let artist_ids = this.post('artist_ids');
        let works = this.post('works');
        let detail = this.post('detail');
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/act/add",
            form: {
                token:token,
                name: name,
                start_day: start_day,
                end_day: end_day,
                area_name: area_name,
                addr_name: addr_name,
                addr_lo: addr_lo,
                addr_la: addr_la,
                sponsor_name: sponsor_name,
                act_picture: act_picture,
                area_picture: area_picture,
                artist_ids: artist_ids,
                works: works,
                detail: detail
            }
        };
        logger.debug('[add] param:',JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug('[add] res:',JSON.stringify(res));
        if(res.status.return_code == 0){
            this.success("添加成功");
        } else {
            this.success('添加失败',res.status.reason)
        }

    }
}
