// pages/habit/group/edit.js
var wegrouplib = require('../../common/lib/wegrouplib')
var util = require('../../../utils/util')

var app = getApp()
Page({
  data: {
    target_types: [],
    target_type_index: 0,
    user_id: null,
    group_id: null,
    group: null,
    allow_join: -1,
    members: [],
    form_disabled: false,
    error: {
      msg: "",
      show: true
    },
    pageState: "onLoad"
  },
  onLoad: function (options) {
    var that = this
    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        target_types: setting.group.target_types
      })
    })

    // 页面初始化 options为页面跳转所带来的参数
    var group_id = options.group_id
    that.setData({
      group_id: group_id,
      pageState: "onLoad"
    })
    this.getGroup()

    this.getGroupMember()
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var that = this

    if (that.data.pageState == "onHide") {
      var group = wegrouplib.getLocalGroup(that.data.group_id)

      that.setData({
        group: group
      })
    }
  },
  onHide: function () {
    // 页面隐藏
    this.setData({
      pageState: "onHide"
    })
  },
  onUnload: function () {
    // 页面关闭
  },
  bindPickerTargetChange: function (e) {
    this.setData({
      target_type_index: e.detail.value
    })

  },
  getGroup: function () {
    var that = this
    var group_id = that.data.group_id

    // from cache
    var group = wegrouplib.getLocalGroup(group_id)
    if (group) {
      var target_type_index = 0
      for (var i in that.data.target_types) {
        if (that.data.target_types[i]["key"] == group.target_type) {
          target_type_index = i
          break
        }
      }
      that.setData({
        group: group,
        target_type_index: target_type_index
      })
    }
  },
  getGroupMember: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    var that = this
    var group_id = that.data.group_id

    wegrouplib.getClientGroupMember(group_id, function (code, msg, data) {

      if (code == 0) {
        that.setData({
          members: data.members
        })
        var creator = null;
        for (var i in data.members) {
          if (that.data.group.creator == data.members[i]["user_id"]) {
            creator = data.members[i]
            break
          }
        }

        that.setData({
          creator: creator
        })
      }
      wx.hideToast()
    })
  },
  removeUserTap: function (e) {

    var that = this
    var group_id = that.data.group_id
    var user_id = e.target.dataset.user_id
    var nickname = e.target.dataset.nickname
    var title = '提示'
    var content = '确认删除' + nickname

    wx.showModal({
      title,
      content: content,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wegrouplib.quitGroup(group_id, user_id, function (code, msg, data) {
            if (code == 0) {
              util.showSuccess("删除成功", function () {
                that.getGroupMember()
              })
            } else {
              that.showError(msg)
            }
          })
        }
      }
    })
  }
})