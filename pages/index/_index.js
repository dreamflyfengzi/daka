//index.js
//获取应用实例
var util = require('../../utils/util.js');
var wegrouplib = require('../common/lib/wegrouplib');

var app = getApp()
Page({
  data: {
    state: 'onLoad',
    userInfo: {},
    setting: {},
    groups: [],
    weakday: util.getWeakDay(),
    isLoading: true,
    loadMsg: "",
    isFailed: false
  },
  onLoad: function (options) {
    var that = this
    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        setting: setting
      })

      that.setData({
        state: "onLoad"
      })
      console.log("onLoad isLoading:" + that.data.isLoading);
      that.getGroups();
    });

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {

    if (this.data.state == "onHide") {
      var groups = wegrouplib.getLocalGroups();
      if (groups) {
        this.setData({
          groups: groups
        })
      }
    }

    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
    this.data.state = "onHide";
  },
  onUnload: function () {
    // 页面关闭
  },
  onShareAppMessage: function () {
    var d = new Date()

    var title;
    if (this.data.userInfo.nickname) {
      title = this.data.userInfo.nickname + "邀请你来打卡 | 一起早起跑步读书,一起来打卡,一起成长";
    } else {
      title = "与你的小圈子一起早起跑步读书,一起打卡,一起成长";
    }
    return {
      title: title,
      path: '/pages/index/index?from=share&timestamp=' + d.getTime()
    }

  },
  // 下拉刷新
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh', new Date())
    if (this.data.isFailed) {
      console.log('onPullDownRefresh getGroups')

      this.getGroups();
    } else {
      wx.stopPullDownRefresh()
    }
  },
  //事件处理函数
  groupCheckinTap: function (event) {
    var group_id = event.target.dataset.group_id;
    wx.navigateTo({
      url: '../habit/group/checkin?group_id=' + group_id
    })
  },
  groupViewTap: function (event) {
    var group_id = event.currentTarget.dataset.group_id;
    wx.navigateTo({
      url: '../habit/group/view?group_id=' + group_id
    })
  },
  getGroups: function () {

    var that = this
    that.setData({
      isLoading: true
    })
    // from cache
    var groups = wegrouplib.getLocalGroups();

    if (groups) {
      that.setData({
        groups: groups
      })
    }

    wegrouplib.getClientGroups({}, function (code, msg, data) {

      if (code == 0) {
        var groups = [];
        groups = data.groups

        that.setData({
          groups: groups,
          isLoading: false,
          loadMsg: groups.length == 0 ? '' : ''
        });
        wegrouplib.saveLocalGroups(data.groups);
      } else {
        console.log(code, msg)
        that.setData({
          loadMsg: "加载失败,请下拉重试",
          isLoading: false,
          isFailed: true
        });

        if (data && data.detail && data.detail.errMsg && (data.detail.errMsg == "getUserInfo:fail auth deny" || data.type == "ERR_WX_GET_USER_INFO")) {
          if (wx.openSetting) {
            wx.openSetting({
              success: (res) => {
                console.log(res)
                if (res.authSetting["scope.userInfo"]) {
                  wx.reLaunch({
                    url: 'pages/index/index'
                  })
                }
              }
            })

          }
        }
      }
      wx.stopPullDownRefresh()
    })
  }
})
