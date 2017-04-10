'use strict';

import Base from './base.js';
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.exdetail]");
let token = "";
let userModule = think.config('mobileUserModule');
let actModule = think.config('actModule');
export default class extends Base {
    //获取用户token
    async __before(){
        token = await this.session('token');
    }

    async indexAction() {
        let act_id = this.param('act_id');
        let param = {
            url:actModule.host + ':' +actModule.port + actModule.path + 'mobile/detail',
            form:{token:token ,act_id:act_id}
        };
        logger.debug('[index] param:' + JSON.stringify(param));
        // let res = (()=>{
        //     return think.promisify(request.post)(param);
        // })();
        // res = JSON.parse(res);
        // logger.debug('[index] res',JSON.stringify(res));
        // if (res.status.return_code == "0"){
        //     let actinfo = res.result;
        //     this.assign({
        //         'actinfo':actinfo
        //     })
        // } else {
        //     logger.debug("获取展览详情失败："+ res.status.reason);
        // }
        return this.display();
    }

    //申请报名
    async applyAction(){
        let act_id = this.param('act_id');
        let param = {
            url:actModule.host + ':' +actModule.port + actModule.path + 'mobile/apply',
            form:{token:token ,act_id:act_id}
        };
        logger.debug("[apply] param: " + JSON.stringify(param));
        let res = (()=>{
            return think.promisify(request.post)(param)
        })();
        res = JSON.parse(res);
        logger.debug("[apply] res:" + JSON.stringify(res));
        if (res.status.return_code == 0){
            this.success('报名成功');
        } else {
            this.fail('报名失败：'+res.status.reason);
        }
    }
}
