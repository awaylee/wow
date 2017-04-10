/**
 * Created by liwei on 2017/2/21.
 */
import Base from './base.js';
import fs from "fs";
import request from "request";

let token;
let articleModule = think.config("articleModule");
let fileModule = think.config("fileModule");
let commentModule = think.config("commentModule");
let userModule = think.config('mobileUserModule');
let article_id;

export default class extends Base {
    async __before() {
        token = await this.session('token');
    }
    async indexAction (){
        this.assign({
            publish:true
        });
        return this.display();
    }
    //发布文章
    async publishAction(){
        let content = this.post("content");
        let name = this.post("name");
        console.log(content);
        let publishComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: articleModule.host + ":" + articleModule.port + articleModule.path + "admin/publish",
                form: {content: content, name: name, token: token}
            });
        };
        let result = await publishComment();
        result = JSON.parse(result.body);
        if(result.status.return_code == "0"){
            this.success("发布成功");
        }
        else{
            this.fail("发布失败");
        }
    }


}
