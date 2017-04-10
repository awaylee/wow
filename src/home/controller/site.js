'use strict';

import Base from './base.js';
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.site]");
let token = "";
let areaModule = think.config('areaModule');
let actModule = think.config('actModule');
export default class extends Base {
    //获取用户token
    async __before(){
        token = await this.session('token');
    }
    //获取展览详情
    async indexAction() {
        let act_id = this.param("act_id");
        let param = {
            url: actModule.host + ":" + actModule.port + actModule.path + "mobile/act/detail",
            form: {token: token, act_id:act_id}
        };
        logger.debug("[index] param:",JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post) (param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[index] res:",JSON.stringify(res));
        let act = res.result;
        if(res.status.return_code == 0){
            this.assign({
                "act":act
            })
        } else {
            this.success('获取场地详情失败',res.status.reason)
        }


        return this.display();
    }

    //添加删除关注
    // async addconcernAction(){
    //     let text = this.post("text");
    //     if(text == "已关注"){
    //         let deleteConcern = () => {
    //             let fn = think.promisify(request.post);
    //             return fn({
    //                 url: userModule.host + ":" + userModule.port + userModule.path + "followauthor/delete",
    //                 form: {author_id: author_id, token: token}
    //             });
    //         };
    //         let result = await deleteConcern();
    //         result = JSON.parse(result.body);
    //         if(result.status.return_code == "0"){
    //             this.success("取消关注成功");
    //         }
    //         else{
    //             this.fail("取消关注失败");
    //         }
    //     }
    //     else{
    //         let addConcern = () => {
    //             let fn = think.promisify(request.post);
    //             return fn({
    //                 url: userModule.host + ":" + userModule.port + userModule.path + "followauthor/add",
    //                 form: {author_id: author_id, token: token}
    //             });
    //         };
    //         let result = await addConcern();
    //         result = JSON.parse(result.body);
    //         if(result.status.return_code == "0"){
    //             this.success("添加关注成功");
    //         }
    //         else{
    //             this.fail("添加关注失败");
    //         }
    //     }
    // }
}
