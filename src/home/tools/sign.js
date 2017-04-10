import sha1 from 'sha1'

let randomString = (len) => {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};
let createTimestamp = () => {
    return parseInt(new Date().getTime() / 1000) + '';
};
var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};
let signAl = (jsapi_ticket, url) => {
    let ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: randomString(16),
        timestamp: createTimestamp(),
        url: url
    };
    let string = raw(ret);
    ret.signature = sha1(string);
    return ret;
};
module.exports = signAl;
