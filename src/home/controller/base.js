'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
    async init(http) {
        super.init(http); //调用父类的init方法
        let env = process.env.NODE_ENV || process.argv.splice(2);
        this.assign({
            title: http.locale("艺术WOW"),
            root_path: env != "debug" ? "" : ""
        });
    }
}
