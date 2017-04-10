'use strict';

import Base from './base.js';
import request from 'request';

let adminModule = think.config('adminModule');
export default class extends Base {
    async indexAction() {
        let token = await this.session('token');
        console.log(token);
        let getUser = () => {
            let fn = think.promisify(request.post);
            return fn({
                url: adminModule.host + ':' + adminModule.port + adminModule.path + 'getall',
                form: {token: token}
            });
        };
        let user = await getUser();
        console.log(user.body);
        user = JSON.parse(user.body).result;
        this.assign({
            "users": user
        });
        return this.display();
    }

    async searchAction() {
        let token = await this.session('token');
        let name = this.post('name');
        let user_id = this.post('user_id');
        let register_date_start = this.post('register_date_start');
        let register_date_end = this.post('register_date_end');
        let res = null;
        if (name == '' && status !== '') {
            let search = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: areaModule.host + ':' + areaModule.port + areaModule.path + 'admin/search',
                    form: {token: token, status: status}
                });
            };
            res = await search();
        } else if (name !== '' && status == '') {
            let search = () => {
                let fn = think.promisify(request.post);
                return fn({
                    url: areaModule.host + ':' + areaModule.port + areaModule.path + 'admin/search',
                    form: {token: token, name: name}
                });
            };
            res = await search();
        } else {
            this.fail('参数不足');
            return;
        }
        if (res == null) {
            this.fail('请求错误');
            return;
        }
        console.log(res.body);
        res = JSON.parse(res.body);
        if (res.status.return_code = '0') {
            this.success(res.result);
        } else {
            this.error('请求错误');
        }
    }
}
