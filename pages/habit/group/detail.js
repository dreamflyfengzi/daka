// pages/habit/group/edit.js
var wegrouplib = require('../../common/lib/wegrouplib')
var util = require('../../../utils/util')

var app = getApp()
Page({
  data: {
    target_types: [],
    target_type_index: 0,
    target_numbers: ['1个', '2个', '3个'],
    target_number_index: 0,
    user_id: null,
    group_id: null,
    group: null,
    is_creator: false,
    allow_join: -1,
    members: [],
    is_target_day: false,
    target_day: 21,
    form_disabled: false,
    error: {
      msg: "",
      show: true
    },
    pageState: "onLoad",
    allow_remind: false
  },
  onLoad: function (options) {
    var that = this
    var group_id = options.group_id

    //group_id = 10327

    that.setData({
      group_id: group_id,
      pageState: "onLoad"
    })

    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        target_types: setting.group.target_types
      })
      that.getGroup()
    })

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
  bindPickerTargetNumberChange: function (e) {
    this.setData({
      target_number_index: e.detail.value
    })
  },
  exportGroupTargetTap:function(e){
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/export?from=group&group_id=' + group_id
    })
  },
  viewGroupImageTap: function (e) {
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/image?from=group&group_id=' + group_id
    })
  },
  viewGroupTargetTap: function (e) {
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/target?from=group&group_id=' + group_id
    })
  },
  viewGroupQrcodeTap: function (e) {

    if (this.data.group.qrcodeurl) {
      var current = this.data.group.qrcodeurl

      var urls = []
      urls.push(current)

      wx.previewImage({
        current: current,
        urls: urls
      })
    } else {
      util.showBusy('加载中')
      var params = {
        group_id: this.data.group_id
      }
      var that = this
      wegrouplib.qrcodeGroup(params, function (code, msg, data) {
        wx.hideToast()
        console.log(data)
        if (code == 0) {
          var current = data.group.qrcodeurl

          var urls = []
          urls.push(current)

          wx.previewImage({
            current: current,
            urls: urls
          })
        } else {
          that.showError(msg)
        }
      })
    }

  },
  viewGroupMemberTap: function (e) {
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/member?from=group&group_id=' + group_id
    })
  },
  allowJoinChangeTap: function (e) {
    var allow_join = e.detail.value == true ? 1 : 0

    var params = {
      allow_join: allow_join
    }
    this.editGroup(params)
  },
  targetDayChangeTap: function (e) {
    this.setData({
      is_target_day: e.detail.value
    })
    if (e.detail.value == false) {
      var params = {
        target_day: 0
      }
      this.editGroup(params)
    }
  },
  targetDayBindChange: function (e) {
    console.log(e)
    this.setData({
      target_day: e.detail.value
    })
  },
  targetDaySubmint: function (e) {
    var params = {
      target_day: this.data.target_day
    }
    console.log(this.data.target_day)
    this.editGroup(params)
  },

  /* ----- 提醒 ----- */
  bindRemindTimeChange: function (e) {
    this.setData({
      remind_time: e.detail.value
    })
    console.log(e.detail.value)
  },

  allowRemindChangeTap: function (e) {
    var allow_remind = e.detail.value == true ? true : false

    this.setData({
      allow_remind: allow_remind
    })

    if (allow_remind == false) {
      this.remindGroup('')
    }
  },

  remindTimeSubmit: function (e) {
    console.log(e)
    var form_id = e.detail.formId
    this.remindGroup(form_id)
  },

  remindGroup: function (form_id) {
    util.showLoading('保存中')
    var allow_remind = this.data.allow_remind

    var params = {
      group_id: this.data.group_id,
      form_id: form_id,
      allow_remind: allow_remind ? 1 : 0,
      remind_time: this.data.remind_time
    }

    var that = this
    wegrouplib.remindGroup(params, function (code, msg, data) {
      util.hideLoading()
      if (code == 0) {
        wx.showToast({
          title: '保存成功',
        })
      } else {

      }
    })
  },
  getGroup: function () {
    var that = this
    var group_id = that.data.group_id

    var d = new Date()
    var remind_time = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes())

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
        is_creator: group.creator == that.data.userInfo.id ? true : false,
        group: group,
        allow_remind: group.remind_time && group.remind_time != "" ? true : false,
        remind_time: group.remind_time && group.remind_time != "" ? group.remind_time : remind_time,
        target_type_index: target_type_index,
        is_target_day: group.target_day && group.target_day > 0 ? true : false,
        target_day: group.target_day && group.target_day > 0 ? group.target_day : 21
      })
    }

    wegrouplib.getClientGroup(group_id, function (code, msg, data) {
      if (code == 0) {
        var target_type_index = 0
        for (var i in that.data.target_types) {
          if (that.data.target_types[i]["key"] == data.group.target_type) {
            target_type_index = i
            break
          }
        }
        that.setData({
          is_creator: data.group.creator == that.data.userInfo.id ? true : false,
          group: data.group,
          target_type_index: target_type_index,
          allow_remind: data.group.remind_time && data.group.remind_time != "" ? true : false,
          remind_time: data.group.remind_time && data.group.remind_time != "" ? data.group.remind_time : remind_time,
          is_target_day: data.group.target_day && data.group.target_day > 0 ? true : false,
          target_day: data.group.target_day && data.group.target_day > 0 ? data.group.target_day : 21
        })
      }
    })
  },
  quitGroupTap: function (e) {
    var that = this
    var group_id = that.data.group_id
    var user_id = that.data.userInfo.id

    var title = '提示'
    var content = '确认退出'
    wx.showModal({
      title,
      content: content,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wegrouplib.quitGroup(group_id, user_id, function (code, msg, data) {
            if (code == 0) {
              util.showSuccess("退出成功", function () {
                wegrouplib.deleteLocalGroup(group_id)
                setTimeout(function () {
                  // 会首页
                  wx.switchTab({
                    url: '/pages/index/index?refresh=1'
                  })
                }, 1000)
              })
            } else {
              that.showError(msg)
            }
          })
        }
      }
    })

  },
  editGroup: function (params) {
    var that = this
    util.showBusy('处理中')
    params.group_id = that.data.group_id

    if (that.data.form_disabled) {
      return
    }
    this.setData({
      form_disabled: true
    })

    wegrouplib.editGroup(params, function (code, msg, data) {
      if (code == 0) {
        util.showSuccess("操作成功", function () {
          that.setData({
            form_disabled: false
          })
        })
      } else {
        that.showError(msg)
      }
    })

  },

  editGroupSubmit: function (e) {
    console.log("formSubmit:", e, e.detail.value)

    var group_name = e.detail.value.group_name
    //var target_name = e.detail.value.target_name
    //var target_type = this.data.target_types[this.data.target_type_index]["key"] //e.detail.value.target_type
    //var target_value = e.detail.value.target_value ? e.detail.value.target_value : ''
    var introduction = e.detail.value.introduction

    if (group_name == "") {
      this.showError("圈子名称不能为空")
      return
    }
    /*
    if (target_name == "") {
      this.showError("圈子任务不能为空")
      return
    }

    if (target_type == "select" && target_value == "") {
      //this.showError("默认值不能为空")
      //return
    }
    */

    var that = this

    var params = {
      group_id: that.data.group["id"],
      name: group_name,
      //target_name: target_name,
      //target_type: target_type,
      //target_value: target_value,
      introduction: introduction
    }
    this.editGroup(params)
  },

  showError: function (msg) {
    wx.hideToast()
    var that = this
    this.setData({
      error: {
        show: false,
        msg: "错误提示:" + msg
      },
      form_disabled: false
    })

    setTimeout(function () {
      that.setData({
        error: {
          show: true,
          msg: "错误提示"
        }
      })
    }, 2000)

  }
})