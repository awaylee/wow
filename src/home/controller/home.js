'use strict';

import Base from './base.js';
import request from "request";
import signAl from "../tools/sign.js";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.home]");
let userModule = think.config('mobileUserModule');
let adModule = think.config('adModule');
let workModule = think.config('workModule');
let areaModule = think.config('areaModule');
let searchModule = think.config("searchModule");
let signFlag;
let token;
let userinfo;

export default class extends Base {
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
        //获取首页推荐作品信息
        let getIndexWork = () => {
            let fn = think.promisify(request.post);
            return fn({
                url:workModule.host + ":" + workModule.port + workModule.path +"mobile/indexinfos",
                form: {token: token}
            });
        };
        let indexWorks = await getIndexWork();
        indexWorks = JSON.parse(indexWorks.body).result.works;

        //获取所有轮播
        let param = {
            url: adModule.host + ":" + adModule.port + adModule.path + "mobile/getall",
            form:{token:token}
        };
        logger.debug("[swiper] param:", JSON.stringify(param));
        let res = await (()=>{
            return think.promisify(request.post) (param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[swiper] res:" + JSON.stringify(res));
        if(res.status.return_code == "0"){
            let ads = res.result.ads;
            this.assign({
                ads:ads
            })
        } else{
            this.fail("获取作品详情失败："+ res.status.reason);
        }

        /*
         获取展览场地信息
         */
        let location = await this.session('location');
        if(location == undefined){
            location = {
                "latitude": 40.2,
                "longitude": 103.8
            }
        }
        let latitude = location.latitude;
        let longitude = location.longitude;
        console.log('当前经度：'+ longitude, '当前维度：'+ latitude);
        // let getAreasData = () => {
        //     let fn = think.promisify(request.post);
        //     return fn({
        //         url: "http://localhost:2333/area/getAllArea.json",
        //         form: {addr_ll: '[' + latitude + ', ' + longitude + ']', token: token}
        //     });
        // };
        // let area_list = await getAreasData();
        // try {
        //     area_list = JSON.parse(area_list.body);
        // }
        // catch (e) {
        //     console.log(e);
        // }
        // let areas = area_list.result;
        this.assign({
            "works":indexWorks,
            "signFlag":signFlag
        });
        return this.display();//输出模版内容到浏览器端
    }

    //获取当前用户当前经纬度
    async locationAction(){
        let addr_lo = this.post('longitude');//经度
        let addr_la = this.post('latitude');//纬度
        logger.debug("[location] addr_lo:", addr_lo);
        logger.debug("[location] addr_la:", addr_la);
        await this.session({
            'addr_lo':addr_lo,
            'addr_la':addr_la
        });
    }

    async addlikeAction(){
        let like = this.post('like');
        let work_id = this.post("work_id");
        //点赞与取消赞
        if(like){
            let addlike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likework/add",
                    form: {token: token, work_id: work_id}
                });
            };
            let result = await addlike();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("点赞成功");
            }
            else{
                this.fail("点赞失败");
            }
        }
        if(like == 0){
            let deletelike = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: userModule.host + ":" + userModule.port + userModule.path + "likework/delete",
                    form: {token: token, work_id: work_id}
                });
            };
            let result = await deletelike();
            result = JSON.parse(result.body);
            if(result.status.return_code == "0"){
                this.success("取消赞成功");
            }
            else{
                this.fail("取消赞失败");
            }
        }
    }

    async getnewAction() {
        let page = this.post("page");
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url:"http://59.110.42.123:24074/mobile/newworks",
                //url: workModule.host + ":" + workModule.port + workModule.path +"newworks",
                form: {token: token ,page: page}
            });
        };
        let newWorks = await getIndexData();
        newWorks = JSON.parse(newWorks.body).result.works;
        if (newWorks !== "") {
            this.success(newWorks);
        }else{
            this.fail("没有数据了");
        }
    }

    async exhibitionAction(){
        return this.display();
    }

    //搜索功能
    async searchAction(){
        let value = this.param("value");
        console.log(value);
        let param = {
            url: searchModule.host + ":" + searchModule.port + searchModule.path +"mobile/getall",
            form: {token: token, keyword: value}
        };
        logger.debug("[search] param:", JSON.stringify(param));
        let result = await (()=>{
            return think.promisify(request.post) (param);
        })();
        logger.debug("[search] result:", JSON.stringify(result));
        if(result.statusCode == 200){
            result = JSON.parse(result.body).result;
            logger.debug("[search] result:", JSON.stringify(result));
            this.assign({
                "results": result
            });
        }

        return this.display();
    }

    // async checkAction() {//判断用户设备,获取用户经纬度信息
    //     let isAndroid = this.post('isAndroid');
    //     let location = this.post('location');
    //     await this.session('location', location).then(() => {
    //         console.log('设置位置session完成');
    //     });
    //     await this.session('isAndroid', isAndroid).then(() => {
    //         this.success('保存成功');
    //     })
    // }
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
