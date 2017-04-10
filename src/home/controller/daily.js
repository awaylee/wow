/**
 * Created by Jeff on 2016/12/22.
 */
import Base from './base.js';
import request from "request";

let token;
let workModule = think.config("workModule");
let articleModule = think.config("articleModule");

export default class extends Base {
    async __before(){
        token = await this.session("token");
    }

    async indexAction() {
        //获取每日精选文章信息
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url:articleModule.host + ":" + articleModule.port + articleModule.path + "mobile/dscvinfos",
                form: {token: token}
            });
        };
        let articles = await getIndexData();
        articles = JSON.parse(articles.body).result.articles;

        //获取每日精选作品信息
        let getIndexWork = () => {
            let fn = think.promisify(request.post);
            return fn({
                url:workModule.host + ":" + workModule.port + workModule.path + "mobile/dscvinfos",
                form: {token: token}
            });
        };
        let Works = await getIndexWork();

        Works = JSON.parse(Works.body).result.works;

        this.assign({
            "articles":articles,
            "works": Works
        });
        return this.display();
    }
    async getmoreAction(){
        let page = this.post("page");
        let getIndexData = () => {
            let fn = think.promisify(request.post);
            return fn({
                url:"http://localhost:2333/article/gettoday.json",
                form: {token: token, page: page}
            });
        };
        let swipeAd = await getIndexData();
        let Adresult = JSON.parse(swipeAd.body);
        let picture = Adresult.result[0].pictures;
        this.assign({
            "pictures":picture
        });
        return this.display();
    }

}
