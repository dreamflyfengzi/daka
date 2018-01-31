// pages/habit/profile/setting/money.js
var wepaylib = require('../../../common/lib/wepaylib');

var app = getApp()

Page({
  data: {
    setting: null,
    title: '求包养',
    prices: [
      1.68, 6.6, 8.8, 16.8, 88, 168
    ]
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        setting: setting
      })
      console.log(setting)
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  previewImageTap: function (e) {
    var current = e.target.dataset.src

    var urls = [current]
    urls.push(current)
    wx.previewImage({
      current: current,
      urls: urls
    })
  },
  /**
  * 选中赞赏金额
  */
  selectItem: function (event) {
    var price = event.currentTarget.dataset.item;
    var that = this;

    wepaylib.payOrder(price, function (code, msg, data) {
      if (code == 0) {
        console.log("获取支付密匙", data);

        wx.requestPayment({
          timeStamp: '' + data.timeStamp,
          nonceStr: data.nonceStr,
          package: data.package,
          signType: data.signType,
          paySign: data.paySign,
          success: function (res) {
            //app.data.rankLoaded = false;//通知排行榜重新加载
            wx.showToast({
              title: '支付成功,感谢',
              icon: 'success'
            });
          },
          fail: function (res) {
            wx.showToast({
              title: '已取消支付',
              icon: 'success'
            });
          },
          complete: function () {
            that.setData({ selected: 0 });//取消选中
          }
        });

      } else {
        //弹出对话框提示支付失败信息
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '支付失败',
          success: function (res) {
            if (res.confirm) {
            }
          }
        });
        that.setData({ selected: 0 });//取消选中
      }
    })
  }

})