/**
 * Created by Jeff on 2016/12/23.
 */
'use strict';

import Base from './base.js';
import fs from "fs";
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.article]");
let token;
let articleModule = think.config("articleModule");
let fileModule = think.config("fileModule");
let commentModule = think.config("commentModule");
let userModule = think.config('mobileUserModule');
let article_id;
export default class extends Base {
    async __before(){
        token = await this.session("token");
    }
    async indexAction() {
        article_id = this.param("article_id");
        //获取文章细节
        let getArticleDetail = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + 'mobile/getinfo', //线上地址
                form: {article_id: article_id, token: token}
            });
        };
        let detail = await getArticleDetail();
        detail = JSON.parse(detail.body).result;

        //获取文章评论
        let getArticleComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + 'mobile/getbyid', //线上地址
                form: {target_id: article_id, type: "article", token: token, page: 1}
            });
        };
        let comment = await getArticleComment();
        comment = JSON.parse(comment.body).result.comments;
        console.log('comment');
        console.log(comment);

        //获取文章点赞信息
        let getArticleLike = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + 'mobile/getlikes', //线上地址
                form: {article_id: article_id, token: token}
            });
        };
        let like = await getArticleLike();
        like = JSON.parse(like.body).result.likes;
        console.log(like);

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
        console.log("info:\n");
        console.log(info);
        await this.session("ownAvatar", info.avatar);
        this.assign({
            "info":info,
            "detail": detail,
            "comments": comment,
            "likes":like
        });
        return this.display();
    }
    async likeAction(){
        //获取文章点赞信息
        let getArticleLike = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + 'mobile/getlikes', //线上地址
                form: {article_id: article_id, token: token}
            });
        };
        let like = await getArticleLike();
        like = JSON.parse(like.body).result.likes;
        this.assign({
            "likes":like
        });
        return this.display();
    }
    async introduceAction(){
        return this.display();
    }
    async uploadAction(){
        let formData = {
            file: fs.createReadStream(this.file('article_img').path)
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
                this.success(res.result.url);
            }
        }
        catch (e) {
            console.log(e);
            this.fail()
        }
    }

    //发布评论
    async commentAction(){
        let text = this.post("text");
        let publishComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + "mobile/publish",
                form: {text: text, target_id: article_id, type: "article", is_reply: 0, token: token}
            });
        };
        let result = await publishComment();
        result = JSON.parse(result.body);
        console.log(result.result);
        if(result.status.return_code == "0"){
            this.success("发布成功");
        }
        else{
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
        let publishComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + "mobile/publish",
                form: {text: text, target_id: target_id, target_cid: target_cid, type: "article", is_reply: 1, target_aname: target_aname, target_aid: target_aid, token: token}
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

    //发布文章
    async publishAction(){
        let content = this.post("content");
        let name = this.post("name");
        console.log(content);
        let publishComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + "mobile/publish",
                form: {content: content, name: name, token: token}
            });
        };
        let result = await publishComment();
        result = JSON.parse(result.body);
        if(result.status.return_code == "0"){
            this.success("发布成功");
        }
        else{
            this.fail("发布失败");
        }
    }

    //添加点赞
    async addconcernAction(){
        let text = this.post("text");
        if(text == "添加点赞"){
            let addLike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likearticle/add",
                    form: {article_id: article_id, token: token}
                });
            };
            let result = await addLike();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("添加点赞成功");
            }
            else{
                this.fail("添加点赞失败","取消点赞失败",result.status.reason);
            }
        }
        else if(text == "取消点赞"){
            let deleteLike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likearticle/delete",
                    form: {article_id: article_id, token: token}
                });
            };
            let result = await deleteLike();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("取消点赞成功");
            }
            else{
                this.fail("取消点赞失败",result.status.reason);
            }
        }
    }

    //删除文章
    async deleteAction(){
        let article_ids = [];
        article_ids.push(this.post("article_id"));
        console.log(article_ids);
        article_ids = JSON.stringify(article_ids);
        let deleteArticle = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + "mobile/delete",
                form: {article_ids:article_ids, token: token}
            });
        };
        let result = await deleteArticle();
        console.log(result.body);
        result = JSON.parse(result.body);
        if(result.status.return_code == "0"){
            this.success("删除成功");
        }
        else{
            this.fail("删除失败");
        }
    }

    //举报一篇文章
    async reportAction() {
        let content = this.post("content");
        let report_article_id = this.post('report_article_id');
        let param =  {
            url: articleModule.host + ":" + articleModule.port + articleModule.path + "mobile/report",
            form: {content: content, article_id: report_article_id, token: token}
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
