'use strict';

import Base from './base.js';
import request from 'request';

let token = "";
let artistModule = think.config('artistModule');
export default class extends Base {
    async __before() {
      token = await this.session('token');
    }
    async indexAction() {
      let getArtist = () => {
        let fn = think.promisify(request.post);
        return fn({
          url: artistModule.host+':'+artistModule.port+artistModule.path+'admin/getall',
          form:{token: token}
        });
      }
      let artistinfo = await getArtist();
      artistinfo = JSON.parse(artistinfo.body).result;
      this.assign({
        "artists": artistinfo
      })
        return this.display();
    }
    async deleteAction() {
       let artist_ids = this.post('artist_ids');
       let token = await this.session('token');
       artist_ids = JSON.stringify(artist_ids);
       console.log(artist_ids);
        let deleteAd = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: artistModule.host+':'+artistModule.port+artistModule.path+'admin/delete',
            form: {'token':token, artist_ids: artist_ids}
          });
        }
        let res = await deleteAd();
        console.log(res.body);
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
            url: artistModule.host+':'+artistModule.port+artistModule.path+'admin/search',
            form: {'token':token, status: status}
          });
        }
        res = await search();
      }
      else if(name !== '' && status == ''){
         let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: artistModule.host+':'+artistModule.port+artistModule.path+'admin/search',
            form: {'token':token, name: name}
          });
        }
        res = await search();
      }
      else if(name !== '' && status !== ''){
        let search = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: artistModule.host+':'+artistModule.port+artistModule.path+'admin/search',
            form: {'token':token, name: name, status: status}
          });
        }
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