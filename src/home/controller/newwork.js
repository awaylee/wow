/**
 * Created by liwei on 2017/1/22.
 */
import Base from './base.js';
import request from "request";
import signAl from "../tools/sign.js";

let userModule = think.config('mobileUserModule');
let adModule = think.config('adModule');
let workModule = think.config('workModule');
let areaModule = think.config('areaModule');
let searchModule = think.config("searchModule");
let signFlag;
let token;
let userinfo;

export default class extends Base {
    async indexAction() {
        return this.display();
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

}
