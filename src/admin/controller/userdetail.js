/**
 * Created by liwei on 2017/1/16.
 */


import Base from './base.js';
import fs from  "fs";
import request from 'request';
import Log4js from "log4js";

let token;
let author_id;
let adminModule = think.config('adminModule');
let workModule = think.config('workModule');
let articleModule = think.config('articleModule');
let moodModule = think.config('moodModule');
let commentModule = think.config('commentModule');
let logger = Log4js.getLogger("[admin.userdetail]");

export default class extends Base {
    async __before(){
        token = await this.session('token');
        author_id = this.param('user_id');
    }
    async indexAction (){
        //获取用户的基本信息
        let userdetail = () => {
            let fn = think.promisify(request.post);
            return fn ({
                url: adminModule.host + ":" + adminModule.port + adminModule.path + "user/op/base",
                form:{token:token, author_id:author_id}
            });
        };
        let res = await userdetail();
        res = JSON.parse(res.body);
        logger.debug("[userdetail] " + JSON.stringify(res));
        if(res.status.return_code == "0"){
            let user = res.result;
            this.assign({
                "user": user,
                'userad':'true'
            });
        } else{
            this.fail("获取用户详情失败：", res.status.reason);
        }

        //获取用户发布的作品列表
        let worklist = () =>{
            let fn = think.promisify(request.post);
            return fn ({
                url: workModule.host + ":" + workModule.port + workModule.path + "admin/byauthor",
                form:{token:token, author_id:author_id}
            });
        };
        let worklists = await worklist();
        worklists = JSON.parse(worklists.body);
        logger.debug("[worklists] " + JSON.stringify(worklists));
        if(worklists.status.return_code == "0"){
            let worklist = worklists.result;
            this.assign({
                "worklists": worklist
            });
        } else{
            this.fail("获取用户详情失败："+ worklists.status.reason);
        }

        //获取一名用户的作品数量
        let worknum = () =>{
            let fn = think.promisify(request.post);
            return fn ({
                url: workModule.host + ":" + workModule.port + workModule.path + "admin/numbyauth",
                form:{token:token, author_id:author_id}
            });
        };
        let num = await worknum();
        num = JSON.parse(num.body);
        logger.debug("[num-worknum] " + JSON.stringify(num));
        if(num.status.return_code == "0"){
            let worknum = num.result;
            this.assign({
                "worknum": worknum
            });
        } else{
            this.fail("获取用户作品数量失败："+ num.status.reason);
        }

        //获取一名用户的文章数量
        let articlenum = () =>{
            let fn = think.promisify(request.post);
            return fn ({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + "admin/numbyauth",
                form:{token:token, author_id:author_id}
            });
        };
        let num_a = await articlenum();
        num_a = JSON.parse(num_a.body);
        logger.debug("[num-articlenum] " + JSON.stringify(num_a));
        if(num_a.status.return_code == "0"){
            let articlenum = num_a.result;
            this.assign({
                "articlenum": articlenum
            });
        } else{
            this.fail("获取用户文章数量失败："+ num_a.status.reason);
        }

        //获取一名用户的心情数量
        let moodnum = () =>{
            let fn = think.promisify(request.post);
            return fn ({
                url: moodModule.host + ":" + moodModule.port + moodModule.path + "admin/numbyauth",
                form:{token:token, author_id:author_id}
            });
        };
        let num_m = await moodnum();
        num_m = JSON.parse(num_m.body);
        logger.debug("[num-moodnum] " + JSON.stringify(num_m));
        if(num_m.status.return_code == "0"){
            let moodnum = num_m.result;
            this.assign({
                "moodnum": moodnum
            });
        } else{
            this.fail("获取用户心情数量失败："+ num_m.status.reason);
        }

        //获取一名用户的文章列表
        let articlelist = () =>{
            let fn = think.promisify(request.post);
            return fn ({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + "admin/byauthor",
                form:{token:token, author_id:author_id}
            });
        };
        let articleList = await articlelist();
        articleList = JSON.parse(articleList.body);
        logger.debug("[num-articleList] " + JSON.stringify(articleList));
        if(articleList.status.return_code == "0"){
            let articles = articleList.result.articles;
            this.assign({
                "articles": articles
            });
        } else{
            this.fail("获取用户详情失败："+ articleList.status.reason);
        }

        //获取用户心情
        let moodlist = () =>{
            let fn = think.promisify(request.post);
            return fn ({
                url: moodModule.host + ":" + moodModule.port + moodModule.path + "admin/byauthor",
                form:{token:token, author_id:author_id}
            });
        };
        let moodList = await moodlist();
        moodList = JSON.parse(moodList.body);
        logger.debug("[num-moodList] " + JSON.stringify(moodList));
        if(moodList.status.return_code == "0"){
            let moodlist = moodList.result.feelings;
            this.assign({
                "moodlist": moodlist
            });
        } else{
            this.fail("获取用户详情失败："+ moodList.status.reason);
        }

        return this.display();
    }

    //封号
    async disableAction (){
        let user_id = this.post('user_id');
        let param = {
            url: adminModule.host + ":" + adminModule.port + adminModule.path + "user/disable",
            form:{token:token, author_id:user_id}
        };
        logger.debug("[disable] param:", JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[disable] res:" + JSON.stringify(res));
        if(res.status.return_code == "0"){
            this.success('封号成功');
        } else{
            this.fail("封号失败："+ res.status.reason);
        }
    }

    //解除封号
    async enableAction (){
        let user_id = this.post('user_id');
        let param = {
            url: adminModule.host + ":" + adminModule.port + adminModule.path + "user/enable",
            form:{token:token, author_id:user_id}
        };
        logger.debug("[enable] param:", JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[enable] res:" + JSON.stringify(res));
        if(res.status.return_code == "0"){
            this.success('解除封号成功');
        } else{
            this.fail("解除封号失败："+ res.status.reason);
        }
    }


    //文章
    // async articleAction (){
    //     let user_id = this.post('user_id');
    //     console.log(user_id);
    //     //获取一名用户的文章列表
    //     let articlelist = () =>{
    //         let fn = think.promisify(request.post);
    //         return fn ({
    //             url: articleModule.host + ":" + articleModule.port + articleModule.path + "admin/byauthor",
    //             form:{token:token, author_id:user_id}
    //         });
    //     };
    //     let articleList = await articlelist();
    //     articleList = JSON.parse(articleList.body);
    //     logger.debug("[num-articleList] " + JSON.stringify(articleList));
    //     if(articleList.status.return_code == "0"){
    //         let articles = articleList.result.articles;
    //         this.assign({
    //             "articles": articles
    //         });
    //     } else{
    //         this.fail("获取用户详情失败："+ articleList.status.reason);
    //     }
    //
    // }

    //获取用户心情
    async moodAction (){
        // let moodlist = () =>{
        //     let fn = think.promisify(request.post);
        //     return fn ({
        //         url: moodModule.host + ":" + moodModule.port + moodModule.path + "admin/byauthor",
        //         form:{token:token, author_id:author_id}
        //     });
        // };
        // let moodList = await moodlist();
        // moodList = JSON.parse(moodList.body);
        // logger.debug("[num-moodList] " + JSON.stringify(moodList));
        // if(moodList.status.return_code == "0"){
        //     let moodlist = moodList.result;
        //     this.assign({
        //         "moodlist": moodlist
        //     });
        // } else{
        //     this.fail("获取用户详情失败："+ moodList.status.reason);
        // }
    }

    //删除心情
    async delmoodAction () {
        let feeling_ids = [];
        feeling_ids.push(this.post("feeling_id"));
        feeling_ids = JSON.stringify(feeling_ids);
        let param = {
            url: moodModule.host + ":" + moodModule.port + moodModule.path + "admin/delete",
            form: {token: token, feeling_ids: feeling_ids}
        };
        logger.debug("[delmood] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[delmood] res:" + JSON.stringify(res));
        if (res.status.return_code == "0") {
            this.success('删除成功');
        } else {
            this.fail("删除失败：" + res.status.reason);
        }
    }

    //删除心情评论
    async delcommentAction () {
        let comment_id = this.post("comment_id");
        let param = {
            url: commentModule.host + ":" + commentModule.port + commentModule.path + "admin/delete",
            form: {token: token, comment_id: comment_id, type:'feeling'}
        };
        logger.debug("[delcomment] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[delcomment] res:" + JSON.stringify(res));
        if (res.status.return_code == "0") {
            this.success('删除成功');
        } else {
            this.fail("删除失败：" + res.status.reason);
        }
    }


}
