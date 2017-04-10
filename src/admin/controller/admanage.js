'use strict';

import Base from './base.js';
import request from "request";
import fs from 'fs';

let token;
let adModule = think.config('adModule');
export default class extends Base {
    async __before() {
      token = await this.session('token');
    }
    async indexAction() {
      let getAd = () => {
        let fn = think.promisify(request.post);
        return fn({
          url: adModule.host+':'+adModule.port+adModule.path+'admin/getall',
          form:{token: token}
        });
      }
      let adinfo = await getAd();
      adinfo = JSON.parse(adinfo.body).result;
      this.assign({
        "ads": adinfo
      })
        return this.display();
    }

    async deleteAction() {
       let ad_ids = this.post('ad_ids');
       ad_ids = JSON.stringify(ad_ids);
        let deleteAd = () => {
          let fn = think.promisify(request.post);
          return fn({
            url: adModule.host+':'+adModule.port+adModule.path+'admin/delete',
            form: {'token':token, ad_ids: ad_ids}
          });
        }
        let res = await deleteAd();
        console.log(res.body);
        res = JSON.parse(res.body);
        if(res.status.reason == "success"){
            this.success()
        }
        else{
            this.fail(res.body.status.reason);
        }
    }
}
