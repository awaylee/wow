/**
 * Created by liwei on 2017/1/17.
 */

import Base from './base.js';
import fs from  "fs";
import request from 'request';
import Log4js from "log4js";

let logger = Log4js.getLogger("[admin.work]");
let workModule = think.config('workModule');
let commentModule = think.config('commentModule');
let work_id;
let token;

export default class extends Base {
    async __before(){
        token = await this.session('token');
        work_id = this.param('work_id');
    }
    async indexAction (){
        //获取作品详情
        let param = {
            url: workModule.host + ":" + workModule.port + workModule.path + "admin/detail",
            form:{token:token, work_id:work_id}
        };
        logger.debug("[index] param:", JSON.stringify(param));
        let res = await (()=>{
            return think.promisify(request.post) (param);
        })();
        let workdetails = JSON.parse(res.body);
        logger.debug("[index] res:" + JSON.stringify(workdetails));
        if(workdetails.status.return_code == "0"){
            let workdetail = workdetails.result;
            this.assign({
                "workdetail":workdetail,
                "userad":'true'
            });
            //console.log(workdetail.comments_dtl[3])
        } else{
            this.fail("获取作品详情失败："+ workdetails.status.reason);
        }
        return this.display();
    }

    //删除作品评论
    async delcommentAction () {
        let comment_id = this.post("comment_id");
        let param = {
            url: commentModule.host + ":" + commentModule.port + commentModule.path + "admin/delete",
            form: {token: token, comment_id: comment_id, type: 'work'}
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

    //删除作品
    async deleteAction () {
        let work_ids = [];
        work_ids.push(this.post("work_id"));
        work_ids = JSON.stringify(work_ids);
        let param = {
            url: workModule.host + ":" + workModule.port + workModule.path + "admin/delete",
            form: {token: token, work_ids: work_ids}
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
