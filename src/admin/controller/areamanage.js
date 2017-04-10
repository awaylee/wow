'use strict';

import Base from './base.js';
import request from "request";

let areaModule = think.config('areaModule');
export default class extends Base {
    async indexAction() {
      let token = await this.session('token');
      let getArea = () => {
        let fn = think.promisify(request.post);
        return fn({
          url: areaModule.host+':'+areaModule.port+areaModule.path+'admin/getall',
          form:{token: token}
        });
      }
      let area = await getArea();
      area = JSON.parse(area.body).result;
      this.assign({
        "areas": area
      })
        return this.display();
    }

    async deleteAction() {
       let area_ids = this.post('area_ids');
       let token = await this.session('token');
       area_ids = JSON.stringify(area_ids);
        let deleteAd = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: areaModule.host+':'+areaModule.port+areaModule.path+'admin/delete',
            form: {'token':token, area_ids: area_ids}
          });
        }
        let res = await deleteAd();
        res = JSON.parse(res.body);
        if(res.status.return_code == "0"){
            this.success()
        }
        else{
            this.fail(res.body.status.reason);
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
            url: areaModule.host+':'+areaModule.port+areaModule.path+'admin/search',
            form: {'token':token, status: status}
          });
        }
        res = await search();
      }
      else if(name !== '' && status == ''){
         let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: areaModule.host+':'+areaModule.port+areaModule.path+'admin/search',
            form: {'token':token, name: name}
          });
        }
        res = await search();
      }
      else if(name !== '' && status !== ''){
        let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: areaModule.host+':'+areaModule.port+areaModule.path+'admin/search',
            form: {'token':token, name: name, status: status}
          });
        }
        res = await search();
      }
      else{
        this.fail('参数不足');
        return;
      }
      res = JSON.parse(res.body);
      if(res.status.return_code = '0'){
        this.success(res.result);
      }
      else{
        this.error('请求错误');
      }
    }
}
