/**
 * Created by liwei on 2017/1/6.
 */

import Base from './base.js';
import request from 'request';
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.private]");
let noticeModule = think.config("noticeModule");
let userModule = think.config('mobileUserModule');
let token;
let target_id;
let ownAvatar;
export default class extends Base {
    async __before() {
        token = await this.session("token");
    }
    async indexAction() {
        let Avatar = await this.session('ownAvatar');
        let name = this.param("name");
        target_id = this.param("target_id");
        if(target_id == undefined){
            target_id = "bbbb";
        }
        this.assign({
            "name":name,
            "ownAvatar":Avatar
        });

        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + 'mobile/private/getme',
                form: {token: token}
            });
        };
        let messages = await getIndexData();
        messages = JSON.parse(messages.body).result.messages;
        let getMe = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + "me/allinfo",
                form: {token: token}
            });
        };
        let info = await getMe();
        info = JSON.parse(info.body).result;
        await this.session("ownAvatar", info.avatar);
        this.assign({
            "info":info,
            "messages":messages
        });
        logger.debug("[info]:",info);
        return this.display();
    }
    //发送私信
    async sendAction(){
        let text = this.post("text");
        let Avatar = await this.session("ownAvatar");
        this.assign({"ownAvatar":Avatar});
        logger.debug('[Avatar]:',Avatar);
        let sendPrivate = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + "mobile/send",
                form: {text: text, target_id: target_id, type: "private", token: token}
            });
        };
        let result = await sendPrivate();
        result = JSON.parse(result.body);
        logger.debug(result.result);
        if(result.status.return_code == 0){
            this.success('发送成功');
            this.assign({"ownAvatar":Avatar});
            logger.debug('[ownAvatar]:',ownAvatar);
        } else {
            this.success('发送失败',res);
        }
    }
}
