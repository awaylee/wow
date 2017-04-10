/**
 * Created by liwei on 2016/12/23.
 */
import Base from './base.js';
import fs from  "fs";
import request from "request";

let token;
let fileModule = think.config("fileModule");
let moodModule = think.config("moodModule");
let commentModule = think.config("commentModule");
let userModule = think.config('mobileUserModule');
let pictures = [];
export default class extends Base {
    async __before(){
        token = await this.session("token");
    }

    async indexAction() {
        return this.display();
    }
    async introduceAction(){
        return this.display();
    }

    //上传图片
    async uploadAction(){
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
                pictures.push(res.result.url);
                this.success(res.result.url);
            }
        }
        catch (e) {
            console.log(e);
            this.fail()
        }
    }

    //删除图片
    async removeAction(){
        let url = this.post('src');
        function removeByValue(arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
        removeByValue(pictures, url);
        console.log('pictures：'+pictures);
    }

    async publishAction(){
        let text = this.post("text");
        pictures = JSON.stringify(pictures);
        let pushlishMood = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: moodModule.host + ":" + moodModule.port + moodModule.path + "mobile/publish",
                form: {token: token, pictures: pictures, text: text}
            });
        };
        let result = await pushlishMood();
        result = JSON.parse(result.body);
        console.log(result);
        if(result.status.return_code == "0"){
            this.success("发布成功");
            pictures = [];
        }
        else{
            this.fail("发布失败");
        }
    }

    async deleteAction(){
        let feeling_ids = [];
        feeling_ids.push(this.post("feeling_id"));
        console.log(feeling_ids);
        feeling_ids = JSON.stringify(feeling_ids);
        let deleteFeeling = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: moodModule.host + ":" + moodModule.port + moodModule.path + "mobile/delete",
                form: {feeling_ids:feeling_ids, token: token}
            });
        };
        let result = await deleteFeeling();
        console.log(result.body);
        result = JSON.parse(result.body);
        if(result.status.return_code == "0"){
            this.success("删除成功");
        }
        else{
            this.fail("删除失败");
        }
    }

    async addconcernAction(){
        let text = this.post("text");
        let feeling_id = this.post("feeling_id");
        if(text == "添加点赞"){
            let addLike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likefeeling/add",
                    form: {feeling_id: feeling_id, token: token}
                });
            };
            let result = await addLike();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("添加点赞成功");
            }
            else{
                this.fail("添加点赞失败","取消点赞失败",result.status.reason);
            }
        }
        else if(text == "取消点赞"){
            let deleteLike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likefeeling/delete",
                    form: {feeling_id: feeling_id, token: token}
                });
            };
            let result = await deleteLike();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("取消点赞成功");
            }
            else{
                this.fail("取消点赞失败",result.status.reason);
            }
        }
    }
}
