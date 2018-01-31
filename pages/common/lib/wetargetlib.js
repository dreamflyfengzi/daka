/***
 * @class
 * 处理group缓存相关
 */
var weconstants = require('./weconstants');
var wegrouplib = require('./wegrouplib');

var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');
var config = require('../../../config');


var _request = function (type, data, cb) {
  qcloud.request({
    url: config.service.targetUrl + type,
    login: true,
    method: "POST",
    data: data,
    header: { 'content-type': 'application/json' },
    success: (response) => {
      var res = response.data;
      if ((typeof res.code) != 'undefined') {
        wegrouplib.saveLocalGroupStatus(data.group_id, "edit")
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



var editTarget = function (params, cb) {
  _request("edit", params, cb)
}

var addTarget = function (params, cb) {
  _request("add", params, cb)
}

var deleteTarget = function (params, cb) {
  _request("delete", params, cb)
}


module.exports = {
  editTarget: editTarget,
  addTarget: addTarget,
  deleteTarget: deleteTarget
};