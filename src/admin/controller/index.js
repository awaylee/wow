'use strict';

import Base from "./base.js";
import config from "../config/config"
import log4js from "log4js";

let logger = log4js.getLogger("[admin][index]");
let adminModule = think.config('adminModule');
export default class extends Base {

    async indexAction() {
        //获取获取所有管理用户信息
        let result = await request({
            url: adminModule.host + ':' + adminModule.port + adminModule.path + 'manager/getall',
            form: {token: super.getToken()}
        });
        logger.debug("[index] result:", JSON.stringify(result));
        let admininfo = [];
        if (result != null && result.body != null && result.statusCode == 200) {
            result = JSON.parse(result.body);
            if (result.status != null && result.status.return_code === "0") {
                admininfo = result.result;
            } else {
                logger.error("[admin] - 获取数据失败：", JSON.stringify(result));
            }
        } else {
            logger.error("[admin] - 请求数据失败!");
        }
        logger.debug("[admininfo]",admininfo);
        this.assign({
            "admininfo": admininfo,
            "adindex": "true"
        });
        return this.display();
    }

    //在线人数
    async onlineAction() {
        var param = {
            url: adminModule.host + ':' + adminModule.port + adminModule.path + config.service.user_online,
            form: {token: super.getToken()},
        };
        let date = this.post("date");
        if (date != null && date.length > 0) {
            param.form.date = (new Date(date)).getTime() / 1000;
        } else {
            date = (new Date()).format("yyyy-MM-dd");
        }
        logger.debug("[online] - param:", JSON.stringify(param));
        let result = await request(param);
        logger.debug("[online] - result:", JSON.stringify(result));
        let user_online = [];
        if (result != null && result.body != null && result.statusCode == 200) {
            result = JSON.parse(result.body);
            if (result.status != null && result.status.return_code === "0") {
                user_online = result.result.onlines;
            } else {
                logger.error("[online] - 获取用户在线数据失败：", JSON.stringify(result));
            }
        } else {
            logger.error("[online] - 请求用户在线数据失败!");
        }
        this.assign({
            user_online: user_online,
            date: date,
            online: 'true',
        });
        return this.display();
    }

    async extantAction() {
        var param = {
            url: adminModule.host + ':' + adminModule.port + adminModule.path + config.service.user_remain,
            form: {token: super.getToken()},
        };
        let page = this.post("page");
        if (page != null && page.length > 0) {
            param.form.page = page;
        }
        logger.debug("[extant] - param:", JSON.stringify(param));
        let result = await request(param);
        logger.debug("[online] - result:", JSON.stringify(result));
        let diag = null, remains = null, users = 0;
        if (result != null && result.body != null && result.statusCode == 200) {
            result = JSON.parse(result.body);
            if (result.status != null && result.status.return_code === "0") {
                diag = result.result.diag;
                remains = result.result.remains;
                users = result.result.users;
            } else {
                logger.error("[online] - 获取用户留存数据失败：", JSON.stringify(result));
            }
        } else {
            logger.error("[online] - 请求用户留存数据失败!");
        }
        this.assign({
            diag: diag,
            users: users,
            remains: remains,
            page: page,
            extant: 'true'
        });
        return this.display();
    }

    async importAction() {
        this.assign({
            imports: 'true'
        });
        return this.display();
    }

    // async searchAction() {
    //   let token = await this.session('token');
    //   let name = this.post('name');
    //   let status = this.post('status');
    //   let res;
    //   if(name == '' && status !== ''){
    //     let search = () => {
    //       let fn = think.promisify(request.post);
    //       return fn({
    //         url: actModule.host+':'+actModule.port+actModule.path+'admin/adminsearch',
    //         form: {'token':token, status: status}
    //       });
    //     };
    //     res = await search();
    //   }
    //   else if(name !== '' && status == ''){
    //      let search = () => {
    //       let fn = think.promisify(request.post);
    //       return fn({
    //         url: actModule.host+':'+actModule.port+actModule.path+'admin/adminsearch',
    //         form: {'token':token, name: name}
    //       });
    //     };
    //     res = await search();
    //   }
    //   else if(name !== '' && status !== ''){
    //     let search = () => {
    //       let fn = think.promisify(request.post);
    //       return fn({
    //         url: actModule.host+':'+actModule.port+actModule.path+'admin/adminsearch',
    //         form: {'token':token, name: name, status: status}
    //       });
    //     };
    //     res = await search();
    //   }
    //   else{
    //     this.fail('参数不足');
    //     return;
    //   }
    //   res = JSON.parse(res.body);
    //   if(res.status.return_code = '0'){
    //     this.success(res.result);
    //   }
    //   else{
    //     this.error('请求错误');
    //   }
    // }
    // async deleteAction() {
    //    let act_ids = this.post('act_ids');
    //    let token = await this.session('token');
    //    act_ids = JSON.stringify(act_ids);
    //     let deleteAd = () => {
    //       let fn = think.promisify(request.post);
    //       return fn({
    //         url: actModule.host+':'+actModule.port+actModule.path+'admin/delete',
    //         form: {'token':token, act_ids: act_ids}
    //       });
    //     };
    //     let res = await deleteAd();
    //     console.log(res.body);
    //     res = JSON.parse(res.body);
    //     if(res.status.return_code == "0"){
    //         this.success()
    //     }
    //     else{
    //         this.fail(res.body.status.reason);
    //     }
    // }
}
