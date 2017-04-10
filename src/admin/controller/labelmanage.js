'use strict';

import Base from './base.js';
import request from "request";
import fs from 'fs';

let labelModule = think.config('labelModule');
export default class extends Base {
    async indexAction() {
      let token = await this.session('token');
      let getLabel = () => {
        let fn = think.promisify(request.post);
        return fn({
          url: labelModule.host+':'+labelModule.port+labelModule.path+'admin/getall',
          form: {token: token}
        });
      };
      let label = await getLabel();
      label = JSON.parse(label.body).result;
      this.assign({
        "labels": label
      });
        return this.display();
    }
    async uploadAction() {
      console.log(this.file());
      let token = await this.session('token');
        let formData = {
            'token': token,
            file: fs.createReadStream(this.file('csv').path)
        };
        let upload = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: labelModule.host +":"+labelModule.port+labelModule.path+"admin/import",
            formData:formData
          });
        };
        let res = await upload();
        console.log(res.body);
        res = JSON.parse(res.body);
        try{
            if(res.status.return_code == '0'){
                this.success('请求成功');
            }
        }
        catch(e){
            console.log(e);
            this.fail()
        }
    }
    async searchAction() {
      let token = await this.session('token');
      let name = this.post('name');
      let status = this.post('status');
      let res;
      if(name == '' && status !== ''){
        let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: labelModule.host+':'+labelModule.port+labelModule.path+'admin/search',
            form: {'token':token, status: status}
          });
        };
        res = await search();
      }
      else if(name !== '' && status == ''){
         let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: labelModule.host+':'+labelModule.port+labelModule.path+'admin/search',
            form: {'token':token, name: name}
          });
        };
        res = await search();
      }
      else if(name !== '' && status !== ''){
        let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: labelModule.host+':'+labelModule.port+labelModule.path+'admin/search',
            form: {'token':token, name: name, status: status}
          });
        };
        res = await search();
      }
      else{
        this.fail('参数不足');
        return;
      }
      console.log(res.body);
      res = JSON.parse(res.body);
      if(res.status.return_code = '0'){
        this.success(res.result);
      }
      else{
        this.error('请求错误');
      }
    }
}
