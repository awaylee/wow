import Base from './base.js';
import fs from  "fs";
import request from 'request';
import Log4js from "log4js";

let logger = Log4js.getLogger("[admin.article]");
let articleModule = think.config('articleModule');
let commentModule = think.config('commentModule');
let article_id;
let token;
export default class extends Base {
    async __before(){
        token = await this.session('token');
        article_id = this.param('article_id');
    }
    async indexAction (){
        //获取作品详情
        let param = {
            url: articleModule.host + ":" + articleModule.port + articleModule.path + "admin/detail",
            form:{token:token, article_id:article_id}
        };
        logger.debug("[index] param:", JSON.stringify(param));
        let res = await (()=>{
            return think.promisify(request.post) (param);
        })();
        let article = JSON.parse(res.body);
        logger.debug("[index] res:" + JSON.stringify(article));
        if(article.status.return_code == "0"){
            article = article.result;
            this.assign({
                "article":article,
                "userad":'true'
            });
        } else{
            this.fail("获取作品详情失败："+ article.status.reason);
        }

        return this.display();
    }

    //删除文章评论
    async delcommentAction () {
        let article_id = this.post("article_id");
        let param = {
            url: commentModule.host + ":" + commentModule.port + commentModule.path + "admin/delete",
            form: {token: token, commarticle_idvent_id: article_id, type: 'article'}
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

    //删除文章
    async deleteAction () {
        let article_ids = [];
        article_ids.push(this.post("article_id"));
        article_ids = JSON.stringify(article_ids);
        let param = {
            url: articleModule.host + ":" + articleModule.port + articleModule.path + "admin/delete",
            form: {token: token, article_ids: article_ids}
        };
        logger.debug("[delete] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[delete] res:" + JSON.stringify(res));
        if (res.status.return_code == "0") {
            this.success('删除成功');
        } else {
            this.fail("删除失败：" + res.status.reason);
        }
    }
}
