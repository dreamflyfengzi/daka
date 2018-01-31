// /pages/habit/profile/setting.js
var app = getApp()

Page({
  data: {
    setting: null,
    userInfo: null
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

    var urls = [this.data.setting.wxacodeImgUrl]
    urls.push(current)
    wx.previewImage({
      current: current,
      urls: urls
    })
  }
})