'use strict';

import Base from './base.js';
import request from "request";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.swiper]");
let token;
let adModule = think.config('adModule');
let actModule = think.config('actModule');

export default class extends Base{
    async __before(){
        token = await this.session('token');
    }

    async indexAction (){
        //获取一个轮播
        let location = this.param('location');
        let param = {
            url: adModule.host + ":" + adModule.port + adModule.path + "mobile/getone",
            form:{token:token, location:location}
        };
        logger.debug("[swiper] param:", JSON.stringify(param));
        let res = await (()=>{
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[swiper] res:" + JSON.stringify(res));
        if(res.status.return_code == "0"){
            let ad = res.result;
            this.assign({
                ad:ad
            })
        } else{
            this.fail("获取作品详情失败："+ res.status.reason);
        }

        return this.display();
    }
}
