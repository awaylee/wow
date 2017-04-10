'use strict';
/**
 * config
 */
export default {
    DEBUG: false,
    DEFAULT_CODE: "021VTmYK1g9Ru80ErqWK1e3HYK1VTmYa",
    APPID: "wx2b5917ae22acdb3d",
    SECRET: "1d180667e195b318e07ec5a49efb4db7",
    ACCESS_TOKEN_URL: "https://api.weixin.qq.com/sns/oauth2/access_token?appid={APPID}&secret={SECRET}&code={CODE}&grant_type=authorization_code",
    CHECK_ACESS_TOKEN_URL: "https://api.weixin.qq.com/sns/auth?access_token={ACCESS_TOKEN}&openid={OPENID}",
    USER_INFO_URL: "https://api.weixin.qq.com/sns/userinfo?access_token={ACCESS_TOKEN}&openid={OPENID}&lang=zh_CN"
};
