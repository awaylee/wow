/**
 * Created by liwei on 2017/3/28.
 */
import Base from './base.js';
import fs from  "fs";
import request from 'request';
import Log4js from "log4js";


let pictures = {};//轮播图片
let actModule = think.config('actModule');
let fileModule = think.config("fileModule");
let adminModule = think.config("adminModule");
let adModule = think.config("adModule");
let token;
let logger = Log4js.getLogger("[admin.exhibition]");

export default class extends Base {
    async __before() {
        token = await this.session('token');
    }

    async indexAction() {
        this.assign({
            exhibition: 'true'
        });
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/act/getlist",
            form: {token: token}
        };
        logger.debug("[index] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[index] res:",JSON.stringify(res));
        let acts = res.result.acts;
        if(res.status.return_code == 0){
            this.assign({
                "acts":acts
            })
        } else {
            this.success('获取客服消息失败',res.status.reason)
        }

        return this.display();
    }

    async indexdataAction() {
        let params = this.param();
        logger.debug("[reportdata][data] " + JSON.stringify(params));
        let page = parseInt(params.offset/20)+1;

        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/act/getlist",
            form: {token: token, page:page}
        };
        logger.debug("[indexdata] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[indexdata] res:",JSON.stringify(res));
        let acts = res.result;
        logger.debug("[indexdata] acts:",JSON.stringify(acts));
        if(res.status.return_code == 0){
            this.json({
                total: acts.total,
                page_size: acts.page_num,
                page_count: acts.total_page,
                page_index: acts.page,
                rows: acts.acts
            });
        } else {
            this.success('获取展览列表失败',res.status.reason)
        }

    }

    async deleteAction(){
        let act_ids = this.post("act_ids");
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "admin/act/delete",
            form: {token: token, act_ids:act_ids}
        };
        logger.debug("[delete] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[delete] res:",JSON.stringify(res));
        if(res.status.return_doce == 0){
            this.success('删除成功');
        } else {
            this.success('删除失败',res)
        }
    }
}
