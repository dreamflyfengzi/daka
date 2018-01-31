/***
 * @class
 * 处理group缓存相关
 */
var weconstants = require('./weconstants');
var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');
var config = require('../../../config');

var payOrder = function (price, cb) {
  // from http
  qcloud.request({
    url: config.service.payUrl + 'payorder',
    login: true,
    method: "POST",
    data: { price: price },
    header: { 'content-type': 'application/json' },
    success: (response) => {
      var res = response.data;

      if ((typeof res.code) != 'undefined') {
        typeof cb == "function" && cb(res.code, res.message, res.data);
      } else {
        typeof cb == "function" && cb(-1, weconstants.WE_ZUOYE_ERROR_SERVICE, null);
      }
    },
    fail: (error) => {
      typeof cb == "function" && cb(-1, weconstants.WE_ZUOYE_ERROR_NETWORK, null);
    }
  });
}

module.exports = {
  payOrder: payOrder
};