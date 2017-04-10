/**
 * Created by liwei on 2017/1/11.
 */

import Base from './base.js';
import request from 'request';

export default class extends Base {
    async indexAction (){
        return this.display();
    }
}
