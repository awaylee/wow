'use strict';

import config from "../config/config"
import log4js from "log4js";

let logger = log4js.getLogger("[admin][base]");
let adminModule = think.config('adminModule');
let token;
export default class extends think.controller.base {

    /**
     * some base method in here
     */
    async init(http) {
        super.init(http); //调用父类的init方法
        // let token = await this.param("token");//获取参数值，优先从 POST 里获取，如果取不到再从 GET 里获取
        // token = token || await this.session("token");
        // let server = this.config("server");//配置静态资源服务器
        let env = process.env.NODE_ENV || process.argv.splice(2);//环境
        this.assign({
            title: http.locale("艺术WOW后台管理系统"),
            root_path: env != "debug" ? "" : "",
        });
    }

    async __before() {
        token = await this.session('token');
        if (token == null) {
            logger.debug("[__before] token is null, please check it!");
            return this.toLogin();
        } else {
            let param = {
                url: adminModule.host + ':' + adminModule.port + adminModule.path + config.service.check_token,
                form: {token: token},
            };
            logger.debug("[__before] param", JSON.stringify(param));
            let result = await request(param);
            logger.debug("[__before] result: ", JSON.stringify(result));
            if (result.statusCode == null || result.statusCode != 200) {
                return this.toLogin();
            }
            result = JSON.parse(result.body);
            if (result.status == null || result.status.return_code !== "0") {
                return this.toLogin();
            }
        }
    }

    toLogin() {
        this.assign({
            error: {
                message: "Token无效，请重新登陆！",
                code: 0
            }
        });
        return this.redirect("/admin/login");
    }

    getToken() {
        return token;
    }
}
