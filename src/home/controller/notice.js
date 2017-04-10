/**
 * Created by Jeff on 2016/12/22.
 */
import Base from './base.js';
import request from "request"
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.notice]");
let noticeModule = think.config('noticeModule');
let token;
let ownAvatar;
export default class extends Base {
    async __before() {
        token = await this.session("token");
    }

    async indexAction() {
        return this.display();
    }

    async serviceAction() {
        let Avatar = await this.session('ownAvatar');
        this.assign({"ownAvatar":Avatar});
        return this.display();
    }

    async messageAction() {
        let getMessage = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + 'mobile/sys/getme', //线上地址
                form: {token: token}
            });
        };
        let messages = await getMessage();
        messages = JSON.parse(messages.body).result.messages;
        this.assign({
            "messages": messages
        });
        return this.display();
    }

    async privateAction() {
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + 'mobile/private/getme',
                form: {token: token}
            });
        };
        let messages = await getIndexData();
        messages = JSON.parse(messages.body).result.messages;
        this.assign({
            "messages": messages
        });
        return this.display();
    }

    //删除所有私信
    async delprivateallAction() {
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + 'mobile/private/deleteall',
                form: {token: token}
            });
        };
        let result = await getIndexData();
        result = JSON.parse(result.body);
        if (result.status.return_code == "0") {
            this.success("删除成功");
        } else {
            this.fail("删除失败");
        }
    }

    //删除一条私信
    async delprivateoneAction() {
        let message_id = this.post("message_id");
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + 'mobile/private/deleteone',
                form: {token: token, message_id: message_id}
            });
        };
        let result = await getIndexData();
        result = JSON.parse(result.body);
        if (result.status.return_code == "0") {
            this.success("删除成功");
        } else {
            this.fail("删除失败");
        }
    }

    //删除所有通知消息（未设计）
    async delmessageallAction() {
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: "http://localhost:2333/private/getall.json",
                form: {token: token}
            });
        };
        let result = await getIndexData();
        result = JSON.parse(result.body);
        if (result.status.return_code == "0") {
            this.success("删除成功");
        } else {
            this.fail("删除失败");
        }
    }

    //删除一条通知消息（未设计）
    async delmessageoneAction() {
        let message_id = this.post("message_id");
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: "http://localhost:2333/private/getall.json",
                form: {token: token, message_id: message_id}
            });
        };
        let result = await getIndexData();
        result = JSON.parse(result.body);
        if (result.status.return_code == "0") {
            this.success("删除成功");
        } else {
            this.fail("删除失败");
        }
    }

    //向客服发送消息
    async sendserverAction(){
        let Avatar = await this.session('ownAvatar');
        let content = this.post('content');
        let param = {
            url: noticeModule.host + ":" + noticeModule.port + noticeModule.path + 'mobile/helper/send',
            form: {token: token, content: content}
        };
        logger.debug("[sendserver] param:",JSON.stringify(param));
        let res = await(() =>{
            return think.promisify(request.post)(param)
        })();
        res = JSON.parse(res.body);

        logger.debug('[sendserver] res:',JSON.stringify(res));
        logger.debug('[Avatar]:',Avatar);
        if(res.status.return_code == 0){
            this.success('发送成功');
            this.assign({"ownAvatar":Avatar});

        } else {
            this.success('发送失败',res);
        }

    }
}

