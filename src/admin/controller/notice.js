/**
 * Created by liwei on 2017/1/11.
 */

import Base from './base.js';
import fs from  "fs";
import request from 'request';
import Log4js from "log4js";

let logger = Log4js.getLogger("[admin.notice]");
let token;
let noticeModule = think.config("noticeModule");

export default class extends Base {
    async __before(){
        token = await this.session('token');
    }
    async indexAction() {
        return this.display();
    }

    //获取客服消息
    async serviceAction() {
        this.assign({
            customer:'true'
        });
        let param = {
            url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + "admin/helper/get",
            form: {token: token}
        };
        logger.debug("[service] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[service] res:",JSON.stringify(res));
        let infos = res.result.infos;
        if(res.status.return_code == 0){
            this.assign({
                "infos":infos
            })
        } else {
            this.success('获取客服消息失败',res.status.reason)
        }
        logger.debug("[infos]:",infos);

        return this.display();
    }

    //获取客服消息分页
    async servicedataAction() {
        let params = this.param();
        logger.debug("[serverdata][data] " + JSON.stringify(params));
        let page = parseInt(params.offset/20)+1;

        let param = {
            url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + "admin/helper/get",
            form: {token: token, page:page}
        };
        logger.debug("[service] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[service] res:",JSON.stringify(res));
        let infos = res.result;
        if(res.status.return_code == 0){
            this.json({
                total: infos.total,
                page_size: infos.page_num,
                page_count: infos.total_page,
                page_index: infos.page,
                rows: infos.infos
            });
        } else {
            this.success('获取客服消息失败',res.status.reason)
        }
        logger.debug("[infos]:",infos);
    }

    //客服回复消息
    async replyAction(){
        let content = this.post("value");
        let message_id = this.post("message_id");
        let param = {
            url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + "admin/helper/reply",
            form: {token: token, content:content, message_id:message_id}
        };
        logger.debug("[reply] param: ",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post)(param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[reply] res:", JSON.stringify(res));
        if(res.status.return_code == 0){
            this.success("回复成功");
        } else {
            this.success("回复失败",res.reason);
        }
    }

    //举报
    async reportAction() {
        this.assign({
            report:'true'
        });
        let param = {
            url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + "admin/report/getall",
            form: {token: token}
        };
        logger.debug("[report] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[report] res:",JSON.stringify(res));
        let informs = res.result.informs;
        if(res.status.return_code == 0){
            this.assign({
                "informs":informs
            })
        } else {
            this.success('获取客服消息失败',res.status.reason)
        }
        logger.debug("[informs]:",informs);

        return this.display();
    }
    //获取多页举报
    async reportdataAction() {
        let params = this.param();
        logger.debug("[reportdata][data] " + JSON.stringify(params));
        let page = parseInt(params.offset/20)+1;

        let param = {
            url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + "admin/report/getall",
            form: {token: token, page:page}
        };
        logger.debug("[reportdata] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[reportdata] res:",JSON.stringify(res));
        let informs = res.result;
        if(res.status.return_code == 0){
            this.json({
                total: informs.total,
                page_size: informs.page_num,
                page_count: informs.total_page,
                page_index: informs.page,
                rows: informs.informs
            });
        } else {
            this.success('获取客服消息失败',res.status.reason)
        }
        logger.debug("[informs]:",informs);
    }

    //删除举报
    async deleteAction(){
        let inform_id = this.post("inform_id");
        let inform_ids = [];
        inform_ids.push(inform_id);
        inform_ids = JSON.stringify(inform_ids);
        let param = {
            url:noticeModule.host + ":" + noticeModule.port + noticeModule.path + "admin/report/delete",
            form:{token:token, inform_ids:inform_ids}
        };
        logger.debug("[delete][param] " + JSON.stringify(param));
        let res = await(() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[delete][res] " + JSON.stringify(res));
        if(res.status.return_code == 0){
            this.success("删除举报成功")
        } else {
            this.success('删除举报失败',res.status.reason)
        }


    }
}
