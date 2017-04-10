import Base from './base.js';
import request from "request";
import signAl from "../tools/sign.js";
import Log4js from "log4js";

let logger = Log4js.getLogger("[home.home]");
let userModule = think.config('mobileUserModule');
let adModule = think.config('adModule');
let token;

export default class extends Base {
    async __before() {
        token = await this.session('token');
    }

    async indexAction (){
        return this.display();
    }
}
