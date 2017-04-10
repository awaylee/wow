'use strict';

import Base from './base.js';
import fs from  "fs";
import request from "request";
import Log4js from "log4js";
let logger = Log4js.getLogger("[home.work]");

let token = "";
let work_id = "";
let userinfo;
let pictures = {};
let userModule = think.config('mobileUserModule');
let workModule = think.config('workModule');
let fileModule = think.config("fileModule");
let commentModule = think.config("commentModule");
let ownAvatar;
let author_id;
export default class extends Base {
    //获取用户token
    async __before() {
        token = await this.session('token');
        userinfo = await this.session('userinfo');
        ownAvatar = await this.session('ownAvatar');
    }

    //作品详情
    async indexAction() {
        /*
         获取作品详情
         请求方式:post
         请求数据:token,work_id
         */
        work_id = this.param('work_id');
        let getWork = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModule.host + ":" + workModule.port + workModule.path + "mobile/getinfo",
                form: {work_id: work_id, token: token}
            });
        };
        let workDetail = await getWork();
        try {
            workDetail = JSON.parse(workDetail.body).result;
        }
        catch (e) {
            console.log(e);
        }
        logger.debug('workDetail: ' + JSON.stringify(workDetail));
        //获取文章评论信息
        let getComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + "mobile/getbyid",
                form: {target_id: work_id, type: "work", token: token, page: 1}
            });
        };
        let comments = await getComment();
        try {
            comments = JSON.parse(comments.body).result.comments;
        }
        catch (e) {
            console.log(e);
        }
        logger.debug('评论列表comments: ' + JSON.stringify(comments));

        //获取我的信息
        let getMe = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + "me/allinfo",
                form: {token: token}
            });
        };
        let info = await getMe();
        info = JSON.parse(info.body).result;
        logger.debug("我的信息info:" + JSON.stringify(info));
        await this.session("ownAvatar", info.avatar);
        this.assign({
            "ownAvatar": ownAvatar,
            "info": info,
            "userinfo": userinfo,
            'workDetail': workDetail,
            "comments": comments
        });
        logger.debug('ownAvatar:' + JSON.stringify(ownAvatar));
        logger.debug('userinfo:' + JSON.stringify(userinfo));

        //获取点赞信息
        let getlikes = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModule.host + ":" + workModule.port + workModule.path + "mobile/getlikes",
                form: {work_id: work_id, token: token}
            });
        };
        let likelist = await getlikes();
        likelist = JSON.parse(likelist.body).result.likes;
        logger.debug('likelist:' + JSON.stringify(likelist));
        this.assign({
            "likelist": likelist
        });

        return this.display();
    }

    async introduceAction() {
        return this.display();
    }

    //获取作品点赞信息
    async likeAction() {
        let getlikes = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModule.host + ":" + workModule.port + workModule.path + "mobile/getlikes",
                form: {work_id: work_id, token: token}
            });
        };
        let likelist = await getlikes();
        likelist = JSON.parse(likelist.body).result.likes;
        console.log('点赞列表详情');
        console.log(likelist);
        this.assign({
            "likelist": likelist
        });
        return this.display();
    }

    //上传图片
    async uploadAction() {
        let formData = {
            file: fs.createReadStream(this.file('mood_img').path)
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
                pictures[res.result.url] = true;
                // pictures.push(res.result.url);
                this.success(res.result.url);
                console.log('pictures：' + JSON.stringify(pictures));
            }
        } catch (e) {
            console.log(e);
            this.fail()
        }
    }

    //删除图片
    async removeAction() {
        let url = this.post('src');
        delete pictures[url];
        console.log('pictures：' + JSON.stringify(pictures));
    }

    //发布作品
    async publishAction() {
        let name = this.post("title");
        let is_sale = this.post("is_sale");
        let type = this.post("type");
        let size_x = this.post("size_x");
        let size_y = this.post("size_y");
        let create_year = this.post("create_year");
        let create_month = this.post("create_month");
        let price = this.post("price");

        let images = [];
        for (var key in pictures) {
            images.push(key);
        }
        let image_str = JSON.stringify(images);
        let publishWork = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModule.host + ":" + workModule.port + workModule.path + "mobile/publish",
                form: {
                    name: name,
                    is_sale: is_sale,
                    size_x: size_x,
                    size_y: size_y,
                    pictures: image_str,
                    create_year: create_year,
                    create_month: create_month,
                    price: price,
                    token: token
                }
            });
        };
        let result = await publishWork();
        result = JSON.parse(result.body);
        if (result.status.return_code == "0") {
            this.success("发布成功");
            pictures = {};
        }
        else {
            this.fail("发布失败");
            pictures = {};
        }
    }

    //发布评论
    async commentAction() {
        let text = this.post("text");
        let publishComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + "mobile/publish",
                form: {text: text, target_id: work_id, type: "work", is_reply: 0, token: token}
            });
        };
        let result = await publishComment();
        result = JSON.parse(result.body);
        console.log(result.result);
        if (result.status.return_code == "0") {
            this.success("发布成功");
        }
        else {
            this.fail("发布失败");
        }
    }

    //回复评论
    async recommentAction() {
        let target_aname = this.post("target_aname");
        let target_id = this.post("target_id");
        let target_aid = this.post("target_aid");
        let target_cid = this.post("target_cid");
        let text = this.post("text");
        let param = {
            url: commentModule.host + ":" + commentModule.port + commentModule.path + "mobile/publish",
            form: {text: text, target_id: target_id, target_cid: target_cid, type: "work", is_reply: 1, target_aname: target_aname, target_aid: target_aid, token: token}
        };
        logger.debug("[recomment] param:", JSON.stringify(param));
        let result = await (()=>{
            return think.promisify(request.post) (param);
        })();
        result = JSON.parse(result.body);
        logger.debug("[recomment] result:" + JSON.stringify(result));
        if (result.status.return_code == "0") {
            this.success("发布成功");
        }
        else {
            this.fail("发布失败");
        }
    }

    async addlikeAction() {
        let text = this.post("text");
        console.log(text);
        if (text == "添加点赞") {
            let addLike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likework/add",
                    form: {work_id: work_id, token: token}
                });
            };
            let result = await addLike();
            result = JSON.parse(result.body);
            if (result.status.return_code == "0") {
                this.success("添加点赞成功");
            }
            else {
                this.fail("添加点赞失败", "取消点赞失败", result.status.reason);
            }
        }
        else if (text == "取消点赞") {
            let deleteLike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likework/delete",
                    form: {work_id: work_id, token: token}
                });
            };
            let result = await deleteLike();
            result = JSON.parse(result.body);
            if (result.status.return_code == "0") {
                this.success("取消点赞成功");
            }
            else {
                this.fail("取消点赞失败", result.status.reason);
            }
        }
    }

    //添加关注作者
    async addconcernAction() {
        let text = this.post("text");
        author_id = this.param('author_id');
        if (text == "已关注") {
            let deleteConcern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "followauthor/delete",
                    form: {author_id: author_id, token: token}
                });
            };
            let result = await deleteConcern();
            result = JSON.parse(result.body);
            if (result.status.return_code == "0") {
                this.success("取消关注成功");
            }
            else {
                this.fail("取消关注失败");
            }
        }
        else {
            let addConcern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "followauthor/add",
                    form: {author_id: author_id, token: token}
                });
            };
            let result = await addConcern();
            result = JSON.parse(result.body);
            if (result.status.return_code == "0") {
                this.success("添加关注成功");
            }
            else {
                this.fail("添加关注失败");
            }
        }
    }

    //删除作品
    async deleteAction() {
        let work_ids = [];
        work_ids.push(this.post("work_id"));
        console.log(work_ids);
        work_ids = JSON.stringify(work_ids);
        let deleteArticle = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModule.host + ":" + workModule.port + workModule.path + "mobile/delete",
                form: {work_ids: work_ids, token: token}
            });
        };
        let result = await deleteArticle();
        console.log(result.body);
        result = JSON.parse(result.body);
        if (result.status.return_code == "0") {
            this.success("删除成功");
        }
        else {
            this.fail("删除失败");
        }
    }

    //举报一个作品
    async reportAction() {
        let content = this.post("content");
        let report_work_id = this.post('report_work_id');
        let param =  {
            url: workModule.host + ":" + workModule.port + workModule.path + "mobile/report",
            form: {content: content, work_id: report_work_id, token: token}
        };
        logger.debug("[report] param:", JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug('[report] res:',JSON.stringify(res));
        if (res.status.return_code == "0") {
            this.success("发布成功");
        }
        else {
            this.fail("发布失败");
        }
    }

}
