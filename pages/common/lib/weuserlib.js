/***
 * @class
 * 处理user缓存相关
 */
var weconstants = require('./weconstants');
var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');
var config = require('../../../config');


var _request = function (type, data, cb) {
    qcloud.request({
        url: config.service.userUrl +"/"+ type,
        login: true,
        method: "POST",
        data: data,
        header: { 'content-type': 'application/json' },
        success: (response) => {
            var res = response.data;
            if ((typeof res.code) != 'undefined') {
                typeof cb == "function" && cb(res.code, res.message, res.data);
            } else {
                typeof cb == "function" && cb(-1, weconstants.WE_DAKA_ERROR_SERVICE, null);
            }
        },
        fail: (error) => {
            typeof cb == "function" && cb(-1, weconstants.WE_DAKA_ERROR_NETWORK, null);
        }
    });
}


// get Group Detail 
var getClientUser = function (user_id, cb) {

    var params = {
        user_id: user_id
    }
    _request("detail", params, cb)
}

var decryptWeRun = function (params, cb) {
  _request("decryptwerun", params, cb)
}


module.exports = {
    getClientUser: getClientUser,

    // 微信运动
    decryptWeRun: decryptWeRun,
};