'use strict';

import Base from './base.js';
import request from 'request';

let token;
let workModule = think.config('workModule');
export default class extends Base {
    async __before() {
      token = await this.session('token');
    }
    async indexAction() {
     let getWork = () => {
        let fn = think.promisify(request.post);
        return fn({
          url: workModule.host+':'+workModule.port+workModule.path+'admin/getall',
          form:{token: token}
        });
      }
      let work = await getWork();
      work = JSON.parse(work.body).result;
      this.assign({
        "works": work
      })
        return this.display();
    }
    async deleteAction() {
       let work_ids = this.post('work_ids');
       let token = await this.session('token');
       work_ids = JSON.stringify(work_ids);
        let deleteAd = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: workModule.host+':'+workModule.port+workModule.path+'admin/delete',
            form: {'token':token, work_ids: work_ids}
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
      let name = this.post('name');
      let status = this.post('status');
      let res;
      if(name == '' && status !== ''){
        let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: workModule.host+':'+workModule.port+workModule.path+'admin/search',
            form: {'token':token, status: status}
          });
        }
        res = await search();
      }
      else if(name !== '' && status == ''){
         let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: workModule.host+':'+workModule.port+workModule.path+'admin/search',
            form: {'token':token, name: name}
          });
        }
        res = await search();
      }
      else if(name !== '' && status !== ''){
        let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: workModule.host+':'+workModule.port+workModule.path+'admin/search',
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
