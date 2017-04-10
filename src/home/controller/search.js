'use strict';

import Base from './base.js';
import request from "request";

let token = "";
let userModule = think.config('mobileUserModule');
let actModule = think.config('actModule');
export default class extends Base {
    //获取用户token
    async __before(){
      token = await this.session('token');
    }
    //搜索部分
    async indexAction() {
      return this.display();
    }
    async searchAction() {
        let tag = this.post('tag');
        let label_id = this.post('label_id');
        let time = this.post('time');
        let formData;
        if(tag !== ''){
            formData = {
                token:token,
                tag:tag
            }
        }
        else if(tag == '' && label_id == '' && time !== ''){
            formData = {
                token:token,
                time:time
            }
        }
        else if(tag == '' && label_id == !'' && time !== ''){
            formData = {
                token:token,
                time:time,
                label_id:label_id
            }
        }
        else if(tag == '' && label_id !== '' && time == ''){
            formData = {
                token:token,
                label_id:label_id
            }
        }
        else{
            this.fail('搜索结果为空');
        }
        let getData = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: actModule.host +":"+actModule.port+actModule.path+"mobile/usersearch",
            form:formData
          });
        };
        let res = await getData();
        try{
            res = JSON.parse(res.body);
        }
        catch (e){
            console.log(e);
        }
        if(res.status.return_code == '0'){
            this.success(res.result);
        }
        else{
            this.fail();
        }
    }
}
