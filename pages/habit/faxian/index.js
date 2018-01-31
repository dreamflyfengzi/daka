var util = require('../../../utils/util.js');
var wegrouplib = require('../../common/lib/wegrouplib');

var app = getApp()
Page({
  data: {
    duration: 500,
    state: 'onLoad',
    userInfo: {},
    setting: {},
    groups: [],
    weakday: util.getWeakDay(),
    isLoading: true,
    loadMsg: "",
    isFailed: false,
    width: 0,
    height: 0,
    current: 0,
    index_style: 'card'
  },
  onLoad: function (options) {
    var that = this
    var style = wegrouplib.getLocalStyle()

    style = style == 'list' ? style : 'card'

    wx.getSystemInfo({
      success: function (systemInfo) {
        that.setData({
          windowWidth: systemInfo.windowWidth,
          windowHeight: systemInfo.windowHeight,
          width: systemInfo.windowWidth,
          height: systemInfo.windowHeight - 30
        })

        console.log(that.data.width, that.data.height)
      },
      fail: function (res) {
        console.log(res)
      }
    })
    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        setting: setting,
        index_style: style
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
        if (this.data.groups.length != groups.length) {
          this.setData({
            groups: groups,
            current: 0
          })
        } else {
          this.setData({
            groups: groups
          })
        }


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
    this.getGroups();

    if (this.data.isFailed) {
      console.log('onPullDownRefresh getGroups')

      this.getGroups();
    } else {
      wx.stopPullDownRefresh()
    }

  },
  changeStyleTap: function (e) {

    var index_style = this.data.index_style == 'card' ? 'list' : 'card'
    this.setData({
      index_style: index_style
    })

    wegrouplib.saveLocalStyle(index_style)
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
  checkinGroupTap: function (event) {
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/checkin?from=group&group_id=' + group_id
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
        /*
        for(var i in data.groups){
          groups.push(data.groups[i])
          if(i==3){
            break;
          }
        }
        */
        groups = data.groups
        that.setData({
          groups: groups,
          current: 0,
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
