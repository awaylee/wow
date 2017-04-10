/**
 * Created by liwei on 2017/1/11.
 */

import Base from './base.js';
import fs from  "fs";
import request from 'request';
import Log4js from "log4js";


let pictures = {};//轮播图片
let workModule = think.config('workModule');
let fileModule = think.config("fileModule");
let adminModule = think.config("adminModule");
let adModule = think.config("adModule");
let token;
let logger = Log4js.getLogger("[admin.operation]");

export default class extends Base {
    async __before() {
        token = await this.session('token');
    }

    async indexAction() {
        return this.display();
    }

    async swipeAction() {
        //获取所有轮播
        let param = {
            url: adModule.host + ":" + adModule.port + adModule.path + "admin/getall",
            form: {token: super.getToken()}
        };
        logger.debug("[swiper] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[swiper] res:" + JSON.stringify(res));
        if (res.status.return_code == "0") {
            let ads = res.result.ads;
            this.assign({
                ads: ads
            })
        } else {
            this.fail("获取作品详情失败：" + res.status.reason);
        }
        this.assign({
            swipe: 'true'
        });
        return this.display();
    }

    //添加轮播
    async addswipeAction() {
        let images = [];
        for (var key in pictures) {
            images.push(key);
        }
        let image_str = images[0];
        let location = this.post('location');
        let name = this.post('name');
        let text = this.post('text');
        let param = {
            url: adModule.host + ":" + adModule.port + adModule.path + "admin/add",
            form: {token: super.getToken(), location: location, name: name, text: text, picture: image_str}
        };
        logger.debug("[addswipe] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[addswipe] res:" + JSON.stringify(res));
        if (res.status.return_code == "0") {
            this.success('修改成功');
            pictures = {};
        } else {
            this.fail("获取作品详情失败：" + res.status.reason);
            pictures = {};
        }
    }

    //删除轮播
    async delswipeAction() {
        let num = this.post('num');
        console.log(num);
        let param = {
            url: adModule.host + ":" + adModule.port + adModule.path + "admin/delete",
            form: {token: super.getToken(), location: num}
        };
        logger.debug("[delswipe] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[delswipe] res:" + JSON.stringify(res));
        if (res.status.return_code == "0") {
            this.success('删除成功');
        } else {
            this.fail("获取作品详情失败：" + res.status.reason);
        }
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


    async userAction() {
        //获取用户列表
        let getuser = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: adminModule.host + ":" + adminModule.port + adminModule.path + "user/getall",
                form: {token: token}
            });
        };
        let users = await getuser();
        users = JSON.parse(users.body);
        logger.debug("[user][users] " + JSON.stringify(users));
        if (users.status.return_code == "0") {
            users = users.result.users;
            this.assign({
                "users": users
            });
        } else {
            this.fail("获取用户列表失败：" + users.status.reason);
        }
        this.assign({"userad": 'true'});
        return this.display();
    }

    //server分页
    async userdataAction() {
        let param = this.param();
        logger.debug("[userdata][data] " + JSON.stringify(param));

        //获取用户列表
        let getuser = () => {
            let page = parseInt(param.offset/20)+1;
            let fn = think.promisify(request.post);
            return fn({
                url: adminModule.host + ":" + adminModule.port + adminModule.path + "user/getall",
                form: {token: token, page:page}
            });
        };
        let users = await getuser();
        users = JSON.parse(users.body);
        logger.debug("[userdata][users] " + JSON.stringify(users));
        console.log(users.result.page);
        if (users.status.return_code == "0") {
            this.json({
                total: users.result.total,
                page_size: users.result.page_num,
                page_count: users.result.total_page,
                page_index: users.result.page,
                rows: users.result.users
            });
        } else {
            this.fail("获取用户列表失败：" + users.status.reason);
        }
    }

    async publishAction() {
        this.assign({
            publish: 'true'
        });
        return this.display();
    }

    async pbworkAction() {
        let name = this.post("title");
        let is_sale = this.post("is_sale");
        let size_x = this.post("size_x");
        let size_y = this.post("size_y");
        let create_year = this.post("create_year");
        let create_month = this.post("create_month");
        let price = this.post("price");

        let images = [];
        for (var key in pictures) {
            images.push(key);
        }
        let image_str = JSON.stringify(images);
        let publishWork = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: workModule.host + ":" + workModule.port + workModule.path + "admin/publish",
                form: {
                    name: name,
                    is_sale: is_sale,
                    size_x: size_x,
                    size_y: size_y,
                    pictures: image_str,
                    create_year: create_year,
                    create_month: create_month,
                    price: price,
                    token: token
                }
            });
        };
        let result = await publishWork();
        result = JSON.parse(result.body);
        logger.debug("[publish][publish] " + JSON.stringify(result));
        if (result.status.return_code == "0") {
            this.success("发布成功");
            pictures = {};
        }
        else {
            this.fail("发布失败");
        }
    }

    async workAction() {
        this.assign({
            opwork: 'true'
        });
        //获取推荐作品
        let param = {
            url: workModule.host + ":" + workModule.port + workModule.path + "admin/getprop",
            form: {token: token}
        };
        logger.debug("[work] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        let work_hot = JSON.parse(res.body);
        logger.debug("[work] res:" + JSON.stringify(work_hot));
        if (work_hot.status.return_code == "0") {
            work_hot = work_hot.result;
            this.assign({
                "work_hot": work_hot
            });
        } else {
            this.fail("获取作品详情失败：" + work_hot.status.reason);
        }
        return this.display();
    }

    //修改推荐作品
    async editrcAction() {
        let work_id = this.post('work_id');
        let rank = this.post('rank');
        let param = {
            url: workModule.host + ":" + workModule.port + workModule.path + "admin/editrc",
            form: {token: super.getToken(), work_id: work_id, rank: rank}
        };
        logger.debug("[editrc] param:", JSON.stringify(param));
        let res = await (() => {
            return think.promisify(request.post)(param);
        })();
        res = JSON.parse(res.body);
        logger.debug("[editrc] res:" + JSON.stringify(res));
        if (res.status.return_code == "0") {
            this.success('修改成功');
        } else {
            this.fail("获取作品详情失败：" + res.status.reason);
        }
    }

    async saleAction() {
        this.assign({
            sale: 'true'
        });
        return this.display();
    }
}
