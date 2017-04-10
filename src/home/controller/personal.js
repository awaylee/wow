/**
 * Created by Jeff on 2016/12/22.
 */
import Base from './base.js';
import request from 'request';

let author_id;
let userModule = think.config("mobileUserModule");
let workModue = think.config("workModule");
let token;

export default class extends Base {
    async __before() {
        token = await this.session("token");
    }
    async indexAction() {
        author_id = this.param("author_id");
        //获取作者详情
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ':' + userModule.port + userModule.path+ "other/getdetail",
                form: {token: token, author_id:author_id}
            });
        };
        let author_detail = await getIndexData();
        author_detail = JSON.parse(author_detail.body).result;
        //获取作者的作品列表
        let getAuthorWork = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModue.host + ':' + workModue.port + workModue.path+ "mobile/getbyauth",
                form: {token: token, author_id:author_id}
            });
        };
        let author_work = await getAuthorWork();
        author_work = JSON.parse(author_work.body).result.works;
        this.assign({
            "author":author_detail,
            "works":author_work
        });
        return this.display();
    }

    async addconcernAction(){
        let text = this.post("text");
        if(text == "已关注"){
            let deleteConcern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "followauthor/delete",
                    form: {author_id: author_id, token: token}
                });
            };
            let result = await deleteConcern();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("取消关注成功");
            }
            else{
                this.fail("取消关注失败");
            }
        }
        else{
            let addConcern = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "followauthor/add",
                    form: {author_id: author_id, token: token}
                });
            };
            let result = await addConcern();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("添加关注成功");
            }
            else{
                this.fail("添加关注失败");
            }
        }
    }
}
