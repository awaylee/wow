/**
 * Created by Jeff on 2016/12/22.
 */
import Base from './base.js';
import request from "request";

let moodModule = think.config('moodModule');
let commentModule = think.config("commentModule");
let token;

export default class extends Base {
    async __before(){
        token = await this.session("token");
    }
    async indexAction() {
        //获取艺术圈心情
        let getArtsWorld = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: moodModule.host + ":" + moodModule.port + moodModule.path + "mobile/getall",
                form:{token:token}
            })
        };
        let feeling = await getArtsWorld();
        feeling = JSON.parse(feeling.body).result;
        this.assign({
            "feelings":feeling
        });
        return this.display();
    }

    //获取更多艺术圈心情
    async getmoreAction() {
        let page = this.post('page');
        let getArtsWorld = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: moodModule.host + ":" + moodModule.port + moodModule.path + "mobile/getall",
                form:{token:token, page:page}
            })
        };
        let feeling = await getArtsWorld();
        feeling = JSON.parse(feeling.body).result;
        this.assign({
            "feelings":feeling
        });
        return this.display();
    }

    async getcommentAction(){
        let feeling_id = this.post("feeling_id");
        //获取心情评论
        let getMoodComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + 'mobile/getbyid', //线上地址
                form: {target_id: feeling_id, type: "feeling", token: token}
            });
        };
        let comment = await getMoodComment();
        comment = JSON.parse(comment.body);
        if(comment.status.return_code == "0"){
            this.success(comment.result.comments);
        }
        else{
            this.fail("获取评论失败："+ comment.status.reason);
        }
        let commentDetail = comment.result.comments;
        console.log(commentDetail);

    }

    //直接评论
    async commentAction(){
        let text = this.post("text");
        let feeling_id = this.post("feeling_id");
        let publishComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + "mobile/publish",
                form: {text: text, target_id: feeling_id, type: "feeling", is_reply: 0, token: token}
            });
        };
        let result = await publishComment();
        console.log(result.body);
        result = JSON.parse(result.body);
        console.log(result);
        if(result.status.return_code == "0"){
            this.success("发布成功");
        }
        else{
            this.fail("发布失败");
        }
    }

    //回复评论
    async publishcommentAction(){
        let target_aname = this.post("target_aname");
        let target_id = this.post("target_id");
        let target_aid = this.post("target_aid");
        let target_cid = this.post("target_cid");
        let text = this.post("text");
        let publishMoodComment = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: commentModule.host + ":" + commentModule.port + commentModule.path + 'mobile/publish', //线上地址
                form: {target_aname: target_aname, type: "feeling", target_id:target_id, target_aid:target_aid, target_cid:target_cid, text:text, is_reply:1, token: token}
            });
        };
        let recomment = await publishMoodComment();
        console.log(recomment.body);
        recomment = JSON.parse(recomment.body);
        if(recomment.status.return_code == "0"){
            this.success(recomment.result.comments);
        }
        else{
            this.fail("获取评论失败："+ recomment.status.reason);
        }
    }

}
