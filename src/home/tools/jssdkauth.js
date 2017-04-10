import request from "request"

let auth = async (APPID, SECRET) => {
    //获取接口的AccessToken
    let apiAccessUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+ APPID +'&secret='+ SECRET;
    let getApiAccessToken = await (() => {
        let fn = think.promisify(request.get);
        return fn({
            url: apiAccessUrl
        });
    })();
    console.log('getApiAccessToken: \n');
    console.log(getApiAccessToken.body);
    getApiAccessToken = JSON.parse(getApiAccessToken.body);
    let API_ACCESS_TOKEN = getApiAccessToken.access_token;
    //获取调用微信JS接口的临时票据
    let getTicketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+API_ACCESS_TOKEN+'&type=jsapi';
    let getTicket = await (() => {
        let fn = think.promisify(request.get);
        return fn({
            url: getTicketUrl
        });
    })();
    getTicket = JSON.parse(getTicket.body);
    let jsapi_ticket = getTicket.ticket;//获取临时票据
    let signAcess = {
        'API_ACCESS_TOKEN':API_ACCESS_TOKEN,
        'jsapi_ticket':jsapi_ticket,
        'timestamp':createTimestamp()
    };
    return signAcess;
};
//获取当前时间戳
let createTimestamp = () => {
    return parseInt(new Date().getTime() / 1000) + '';
};

module.exports = auth;




