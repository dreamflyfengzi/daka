//app.js
var qcloud = require('./vendor/qcloud-weapp-client-sdk/index');
var config = require('./config');
App({
  onLaunch: function (options) {
    console.log(options)
    
    this.globalData.scene = (options&&options.scene)?options.scene:0

    qcloud.setLoginUrl(config.service.loginUrl);
    this.doLogin();
    console.log("doLogin");

    var that = this
    // 回传设备信息
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res
      }
    })
  },

  /**
   * 点击「登录」按钮
   */
  doLogin: function (cb) {
    var that = this;
    console.log("doLogin begin")
    qcloud.login({
      success(result) {
        console.log(result)
        that.globalData.login = 1;
        typeof cb == "function" && cb()
      },
      fail(error) {
        that.globalData.login = 2;
        console.log(error)
        if (error.type == "ERR_WX_GET_USER_INFO") {
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

          } else {
            wx.showModal({
              title: '登录失败',
              content: '需要您的授权,请退出重试',
              showCancel: false,
              success: function (res) {
                console.log('showModal success');
              }
            })
          }
        } else {
          that.globalData.retryCounter++
          if (that.globalData.retryCounter <= 3) {
            setTimeout(function () {
              that.doLogin(cb);
            }, 100)
          } else {
            wx.showModal({
              title: '登录失败',
              content: error.message,
              showCancel: false,
              success: function (res) {
                console.log('showModal success');
              }
            })
          }
        }
      }
    })
  },
  getUser: function (cb) {
    var that = this;
    var data = {
      scene : that.globalData.scene,
      systemInfo: that.globalData.systemInfo
    }
    data.scene = that.globalData.scene
    data.system
    qcloud.request({
      url: config.service.userUrl,
      login: true,
      method: "POST",
      data: data,
      success: (response) => {
        var res = response.data;
        if (res.code == 0) {
          that.globalData.userInfo = res.data.userInfo;
          that.globalData.setting = res.data.setting;

          typeof cb == "function" && cb(that.globalData.userInfo, that.globalData.setting)
        } else {

          that.globalData.retryCounter++
          if (that.globalData.retryCounter <= 3) {
            qcloud.clearSession();
            setTimeout(function () {
              that.getUser(cb);
            }, 100)
          } else {
            wx.showModal({
              title: '登录失败',
              content: '服务异常,请退出重试',
              showCancel: false,
              success: function (res) {
                console.log('showModal success');
              }
            })
          }
        }
      },
      fail: (error) => {
        if (error.type == qcloud.ERR_WX_GET_USER_INFO) {
          console.log(error);
        }
        typeof cb == "function" && cb(null, null)

      }
    });
  },
  clearUserSession: function () {
    qcloud.clearSession();
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo, this.globalData.setting)
    } else {
      that.getUser(cb);
    }
  },
  globalData: {
    scene: 0,
    userInfo: null,
    setting: null,
    login: 0,
    systemInfo: null,
    retryCounter: 0
  }
})