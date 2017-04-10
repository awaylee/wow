'use strict';

import Base from './base.js';
import request from 'request';
import fs from  "fs";
import signAl from "../tools/sign.js";
import Log4js from "log4js";
import crypto from "crypto";

let logger = Log4js.getLogger("[home.me]");
let signFlag;
let token;
let userinfo;
let pictures = [];
let random;//验证码
let fileModule = think.config("fileModule");
let userModule = think.config('mobileUserModule');
let labelModule = think.config('labelModule');
let workModule = think.config("workModule");
export default class extends Base {

    /*async __before() {
        token = await this.session('token');
        userinfo = await this.session('userinfo');
    }*/

    async __before() {
        let env = process.env.NODE_ENV || process.argv.splice(2);
        if(env == "debug"){
            let getToken = () => {
                let fn = think.promisify(request.get);
                return fn({
                    url:userModule.host + ":" + userModule.port + userModule.path +"login?user_id=bbbbb&name=zhouenming22222&city=chengdu&source=wechat"
                });
            };
            token = await getToken();
            token = JSON.parse(token.body).result.token;
            console.log(token);
            await this.session("token", token);
            // token = "d01d1a901aa790cadd5556eab454ab9d";
            signFlag = 0;
            // await this.session("token", token);
        }
        else{
            signFlag = 1;
            token = await this.session("token");
            userinfo = await this.session("userinfo");
        }
        console.log(signFlag);
        console.log(userinfo);
    }

    async indexAction() {
        //获取我的信息
        let getMe = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + "me/allinfo",
                form: {token: token}
            });
        };
        let info = await getMe();
        info = JSON.parse(info.body).result;
        let ownAvatar = info.avatar;
        await this.session("ownAvatar", ownAvatar);
        logger.debug("[ownAvatar]",ownAvatar);
        this.assign({
            "info":info
        });
        logger.debug("[info]:",info);
        return this.display();//输出模版内容到浏览器端
    }
    //我的订单
    async orderAction() {
        let page;
        if(this.post('page') == '' || undefined){
            page = 1;
        } else {
            page = this.post('page');
        }
        //我购买的
         let param = {
             url: userModule.host + ":" + userModule.port + userModule.path + "order/getbuy",
             form: {token: token, page:page}
         };
        logger.debug('[order] param', JSON.stringify(param));
        let res = await(() =>{
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[order] res: ", JSON.stringify(res));
        if(res.status.return_code == 0){
            let orders = res.result.orders;
            this.assign({
                "orders":orders
            })
        } else {
            logger.debug("获取数据失败：",res.status.reason);
        }

        //我出售的
        let saleparam = {
            url: userModule.host + ":" + userModule.port + userModule.path + "order/getsale",
            form: {token: token, page:page}
        };
        logger.debug('[sale] saleparam', JSON.stringify(saleparam));
        let result = await (() =>{
            return think.promisify(request.post)(saleparam);
        })();
        result = JSON.parse(result.body);
        logger.debug("[sale] result: ", JSON.stringify(result));
        if(result.status.return_code == 0){
            let sales = result.result.orders;
            this.assign({
                "sales":sales
            })
        } else {
            logger.debug("获取数据失败：",result.status.reason);
        }
        return this.display();
    }
    //获取更多我出售的
    async getsaleAction() {
        let page;
        if(this.post('page') == '' || undefined){
            page = 1;
        } else {
            page = this.post('page');
        }
        //我购买的
        let param = {
            url: userModule.host + ":" + userModule.port + userModule.path + "order/getsale",
            form: {token: token, page:page}
        };
        logger.debug('[sale] param', JSON.stringify(param));
        let res = await (() =>{
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[sale] res: ", JSON.stringify(res));
        if(res.status.return_code == 0){
            let orders = res.result.orders;
            this.assign({
                "sales":orders
            })
        } else {
            logger.debug("获取数据失败：",res.status.reason);
        }
    }

    async concernAction() {
        //获取我关注的作者
        let getMeConcern = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + "followauthor/get",
                form: {token: token}
            });
        };
        let follows = await getMeConcern();
        follows = JSON.parse(follows.body).result.follows;
        logger.debug("[follows]",follows);
        this.assign({
            "follows":follows
        });
        return this.display();
    }

    async addconcernAction(){
        let text = this.post("text");
        let author_id = this.post("author_id");
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

    async introduceAction() {
        //获取我的信息
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
            "info":info
        });

        //获取我发布的作品
        let getMeIntroduce = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + "publish/getworks",
                form: {token: token}
            });
        };
        let works = await getMeIntroduce();
        works = JSON.parse(works.body).result.works;

        //获取我发布的文章
        let getMeIntroduceArticle = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: userModule.host + ":" + userModule.port + userModule.path + "publish/getarticles",
                form: {token: token}
            });
        };
        let articles = await getMeIntroduceArticle();
        articles = JSON.parse(articles.body).result.articles;
        //获取我发布的心情
        let getArtsWorld = ()=>{
            let fn = think.promisify(request.post);
            return fn({
                url:userModule.host + ":" + userModule.port + userModule.path + "publish/getfeelings",
                form:{token:token}
            })
        };
        let artsWorldAll = await getArtsWorld();
        let artsWorldRes = JSON.parse(artsWorldAll.body);
        let feeling = artsWorldRes.result.feelings;
        this.assign({
            "works":works,
            "articles":articles,
            "feelings":feeling
        });
        return this.display();
    }

    async settingAction() {
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
            "signFlag":signFlag
        });
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

    //心情点赞
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

    //修改自己的信息
    async editselfAction() {
        let name = this.post('name');
        let avatar = this.post('avatar');
        let param = {
            url: userModule.host + ":" + userModule.port + userModule.path + "me/editself",
            form:{token:token, name:name, avatar:avatar}
        };
        logger.debug("[editself] param:", JSON.stringify(param));
        let res = await (()=>{
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[editself] res:" + JSON.stringify(res));
        if(res.status.return_code == "0"){
            this.success('修改成功');
        } else{
            this.fail("获取作品详情失败："+ res.status.reason);
        }
    }

    //下载微信服务器多媒体文件
    async downloadAction() {
        //let media_id = this.post('serverId');
        let accessToken = '5KWcgAsTOtHJHGyYWJbN3QWL5Cg-XFSms1LvRXvtswvPY58lGG_Z3ci4IID73b_8m8cM2d_VsTaIX2JnByb3u0fssPtTp4TyTeONmMlOref4WvT0dXGlNLmMOIVaUq-KOWJdACAVDQ';
        let media_id = this.param('sid');
        logger.debug("[download] sid:", JSON.stringify(media_id));

        let param = {
            url: "http://file.api.weixin.qq.com/cgi-bin/media/get?access_token="+ accessToken + "&media_id=" + media_id
        };
        logger.debug("[download] param:", JSON.stringify(param));

        let res = await (()=>{
            return think.promisify(request.get) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[download] res:" + JSON.stringify(res));
    }

    async saleAction() {
        return this.display();
    }
    //在线销售申请
    async applyAction() {
        let real_name = this.param('real_name');
        let tel = this.param('tel');
        let code = this.param('code');
        let id_number = this.param('id_number');
        pictures = JSON.stringify(pictures);
        if (code == random){
            let param = {
                url: userModule.host + ":" + userModule.port + userModule.path + "sale/apply",
                form:{real_name:real_name, tel:tel, code:code, id_number:id_number, token:token, pictures:pictures}
            };
            logger.debug("[apply] param:", JSON.stringify(param) );
            let res = await (()=>{
                return think.promisify(request.post) (param);
            })();
            res = JSON.parse(res.body);
            logger.debug("[apply] res:" + JSON.stringify(res));
            if(res.status.return_code == "0"){
                this.success('申请成功');
            } else{
                this.fail("申请失败："+ res.status.reason);
                pictures = [];
            }
        } else {
            this.fail("验证码错误，请重新输入");
        }


    }

    //短信验证码
    async codeAction(){
        let sdkappid = "1400027543";
        let appkey = "9d4db699238e2dc8b36bcddb06f7a183";
        random = String(Math.random()*100000).substring(0,4);
        let tel = this.post("tel");
        let time =  Date.parse(new Date())/1000;
        let data = "appkey="+appkey+"&random="+random+"&time="+time+"&mobile="+tel;
        logger.debug(sdkappid,random,tel,time);
        logger.debug("[data]",data);
        let hash = crypto.createHash('sha256').update(data).digest('hex');
        logger.debug("[hash]:",hash);
        var form = {
            "tel": { //如需使用国际电话号码通用格式，如："+8613788888888" ，请使用sendisms接口见下注
                "nationcode": "86", //国家码
                "mobile": tel //手机号码
            },
            "sign": "北京观照自然", // //短信签名，如果使用默认签名，该字段可缺省
            "tpl_id": 14860, //业务在控制台审核通过的模板ID
            "params": [
                random,
                "2"
                ], //参数，分别对应上面假定模板的{1}，{2}，{3}
            "sig": hash, //app凭证，具体计算方式见下注
            "time": time, //unix时间戳，请求发起时间，如果和系统时间相差超过10分钟则会返回失败
            "extend": "", //通道扩展码，可选字段，默认没有开通(需要填空)。
            //在短信回复场景中，腾讯server会原样返回，开发者可依此区分是哪种类型的回复
            "ext": "" //用户的session内容，腾讯server回包中会原样返回，可选字段，不需要就填空。
        };
        form = JSON.stringify(form);
        let param = {
            url:"https://yun.tim.qq.com/v5/tlssmssvr/sendsms?sdkappid="+sdkappid + "&random="+random,
            form:form
        };
        logger.debug("[code] param:",param);
        let res = await ( () =>{
            return think.promisify(request.post)(param)
        })();
        res = JSON.parse(res.body);
        logger.debug("[code] res:",JSON.stringify(res));
    }

    //发起签名请求
    async signAction() {
        let signAcess = await this.cache('signAcess');
        let APPID = await this.session('APPID');
        let jsapi_ticket = signAcess.jsapi_ticket;
        let url = this.post('url');//前端获取
        //解码
        url = decodeURIComponent(url);
        let sign = signAl(jsapi_ticket, url);
        sign.appid = APPID;
        console.log('sign     : ************');
        console.log(sign);
        console.log('signAcess: ************');
        console.log(signAcess);
        this.success(sign);
    }


}
