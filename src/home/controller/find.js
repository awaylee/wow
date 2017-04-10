'use strict';

import Base from './base.js';
import request from "request";

let token = '';
let artistModule = think.config('artistModule');

export default class extends Base {
    async __before() {
        token = await this.session('token');
    }

    async indexAction() {
        // /*
        //  获取艺术家信息
        //  请求方式:post
        //  请求数据:token
        //  */
        // let getAllArtist = () => {
        //     let fn = think.promisify(request.post);
        //     return fn({
        //         url: artistModule.host + ":" + artistModule.port + artistModule.path + 'mobile/getallshort', //线上地址
        //         form: {token: token}
        //     });
        // }
        // let allartist = await getAllArtist();
        // try {
        //     allartist = JSON.parse(allartist.body).result;
        // }
        // catch (e){
        //     console.log(e);
        // }
        // this.assign({
        //     'allartist': allartist
        // })
        return this.display();
    }
}
