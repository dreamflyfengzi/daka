/***
 * @class
 * 处理group缓存相关
 */
var weconstants = require('./weconstants');
var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');
var config = require('../../../config');


var _request = function (type, data, cb) {
  qcloud.request({
    url: config.service.feedUrl + type,
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



var likeFeed = function (params, cb) {
  _request("like", params, cb)
}

var unlikeFeed = function (params, cb) {
  _request("unlike", params, cb)
}

var deleteFeed = function (params, cb) {
  _request("delete", params, cb)
}

var getComments = function (params, cb) {
  _request("comments", params, cb)
}

var replyComment = function (params, cb) {
  _request("commentreply", params, cb)
}

var deleteComment = function (params, cb) {
  _request("commentdelete", params, cb)
}

var saveLocalFeedSync = function (feed) {
  try {
    wx.setStorageSync(weconstants.WE_DAKA_KEY_FEED, feed)
  } catch (e) {
  }
}

var getLocalFeedSync = function (feed_id) {
  var feed = {}
  try {
    feed  = wx.getStorageSync(weconstants.WE_DAKA_KEY_FEED)
    if (feed && feed.id == feed_id){
      return feed
    }
  } catch (e) {
  }
  return feed;
}

module.exports = {
  likeFeed: likeFeed,
  unlikeFeed: unlikeFeed,
  deleteFeed:deleteFeed,
  getComments: getComments,
  replyComment:replyComment,
  deleteComment,deleteComment,
  saveLocalFeedSync: saveLocalFeedSync,
  getLocalFeedSync: getLocalFeedSync
};