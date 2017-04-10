/**
 * Created by liwei on 2017/2/21.
 */
import Base from './base.js';
import fs from "fs";
import request from "request";
import Log4js from "log4js";

let token;
let moodModule = think.config("moodModule");
let fileModule = think.config("fileModule");
let commentModule = think.config("commentModule");
let userModule = think.config('mobileUserModule');
let article_id;
let pictures = {};//发布作品的图片
let logger = Log4js.getLogger("[admin.pbmood]");

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

    //上传图片
    async uploadAction() {
        let formData = {
            file: fs.createReadStream(this.file('mood_img').path)
        };
        let upload_image = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: fileModule.host + ":" + fileModule.port + fileModule.path,
                formData: formData
            });
        };
        let res = await upload_image();
        try {
            res = JSON.parse(res.body);
            if (res.status.return_code == '0') {
                pictures[res.result.url] = true;
                // pictures.push(res.result.url);
                this.success(res.result.url);
                logger.debug("[publish][upload] pictures：" + JSON.stringify(pictures));
            }
        } catch (e) {
            console.log(e);
            this.fail()
        }
    }

    //删除图片
    async removeAction() {
        let url = this.post('src');
        delete pictures[url];
        logger.debug("[publish][remove] " + JSON.stringify(pictures));
    }

    async publishAction (){
        let text = this.post("text");
        let images = [];
        for (var key in pictures) {
            images.push(key);
        }
        let image_str = JSON.stringify(images);
        logger.debug("[pbmood][image_str] ",image_str);
        let param = {
            url: moodModule.host + ":" + moodModule.port + moodModule.path + "admin/publish",
            form: {text: text, pictures: image_str, token: token }
        };
        logger.debug('[pbmood] param:',JSON.stringify(param));
        let result = await(() =>{
            return think.promisify(request.post)(param);
        })();
        result = JSON.parse(result.body);
        logger.debug("[pbmood][publish] " + JSON.stringify(result));
        if (result.status.return_code == "0") {
            this.success("发布成功");
            pictures = {};
        }
        else {
            this.fail("发布失败");
            pictures = {};
        }
    }
}
