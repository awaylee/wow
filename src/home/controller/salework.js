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
    async indexAction() {
        return this.display();
    }

    async getnewAction() {
        //获取可售艺术品
        let page;
        if(this.post('page') == "" || undefined){
            page = 1;
        } else {
            page = this.post('page');
        }
        let param = {
            url:workModule.host + ":" + workModule.port + workModule.path + "mobile/sale/enable",
            form:{token:token, page:page}
        };
        logger.debug("[salework]:param" + JSON.stringify(param));
        let res = await(() => {
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body).result;
        let newWorks = res.works;
        logger.debug("[salework]:newWorks" + JSON.stringify(newWorks));
        if(newWorks !== ""){
            this.success(newWorks);
        } else {
            this.fail("没有数据了");
        }

    }
}
