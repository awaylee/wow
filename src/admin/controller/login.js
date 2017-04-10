'use strict';

import Base from './base.js';
import config from "../config/config"
import log4js from "log4js";

let logger = log4js.getLogger("[admin][index]");
let adminModule = think.config('adminModule');
let loginUrl = adminModule.host + ":" + adminModule.port + adminModule.path;

export default class extends Base {
    //获取管理员token
    async __before() {
        // await this.session();
        if (config.debug) {
            loginUrl += "login?email=aad21@163.com&phone=186111345678&name=testname2&passwd=12345678123456781234567812345678"
        } else {
            loginUrl += "login?email=aad2@163.com&phone=18611345678&name=testname1&passwd=12345678123456781234567812345678"
        }
    }

    async indexAction() {
        return this.display();
    }

    async verifyAction() {
        let username = this.post('username');
        let password = this.post('password');
        let verification = this.post('verification');
        let result = await request({
            //url: adminModule.host + ":" + adminModule.port + adminModule.path + "/login",
            url: loginUrl,
            form: {name: username, passwd: password, verification: verification}
        });
        logger.debug("[verify] ", JSON.stringify(result));
        result = JSON.parse(result.body);
        if (result.status.return_code == "0") {
            await this.session('token', result.result.token);
            this.success();
        } else {
            this.fail(result.status.reason);
        }
    }
}
