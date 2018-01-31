// pages/habit/group/target.js
var wegrouplib = require('../../common/lib/wegrouplib')
var wetargetlib = require('../../common/lib/wetargetlib')

var util = require('../../../utils/util')

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    group_id: 0,
    group: null,
    targets: null,
    new_target: {
      type: 'text',
      type_index: 0,
      name: '',
      value: '',
      limit: '1次',
      limit_index: 0
    },
    target_types: null,
    error: {
      msg: "",
      show: true
    },
    isCreating: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var group_id = options.group_id

    //group_id = 10327

    that.setData({
      group_id: group_id
    })

    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        target_types: setting.group.target_types,
        target_limits: setting.group.target_limits
      })
      that.getGroup()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindPickerTargetTypeChange: function (e) {
    console.log(e)
    var idx = e.currentTarget.dataset.target_idx;

    var targets = this.data.targets
    targets[idx]["type_index"] = e.detail.value
    this.setData({
      targets: targets
    })
  },
  bindPickerLimitChange: function (e) {
    console.log(e)
    var idx = e.currentTarget.dataset.target_idx;

    var targets = this.data.targets
    targets[idx]["limit_index"] = e.detail.value
    this.setData({
      targets: targets
    })
  },

  bindPickerNewTargetTypeChange: function (e) {
    var new_target = this.data.new_target
    new_target["type_index"] = e.detail.value
    this.setData({
      new_target: new_target
    })
  },
  bindPickerNewTargetLimitChange: function (e) {
    var new_target = this.data.new_target
    new_target["limit_index"] = e.detail.value
    this.setData({
      new_target: new_target
    })
  },
  addGroupTargetTap: function (e) {
    this.setData({
      isCreating: true
    })
  },
  removeGroupTargetTap: function (e) {
    this.setData({
      isCreating: false,
      new_target: {
        type_index: 0,
        type: 'text',
        name: '',
        value: ''
      }
    })
  },
  getGroup: function () {
    var that = this
    var group_id = that.data.group_id

    // from cache
    var group = wegrouplib.getLocalGroup(group_id)


    if (group) {
      that.setData({
        group: group,
        targets: that.getTargets(group.targets),
        is_creator: group.creator == that.data.userInfo.id ? true : false
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
          targets: that.getTargets(data.group.targets)
        })
      }
    })

    console.log(group)
  },


  editGroupTargetSubmit: function (e) {
    util.showLoading('保存中')
    console.log("formSubmit:", e, e.detail.value)

    var target_id = e.detail.value.target_id

    var target_name = e.detail.value.target_name
    var target_value = e.detail.value.target_value ? e.detail.value.target_value : ''

    var target_type_index = e.detail.value.target_type
    var target_type = this.data.target_types[target_type_index]["key"]

    var target_limit_index = e.detail.value.target_limit
    var target_limit = this.data.target_limits[target_limit_index]["key"]

    if (target_name == "") {
      this.showError("圈子任务不能为空")
      return
    }

    if (target_type == "select" && target_value == "") {
      this.showError("默认值不能为空")
      return
    }


    var params = {
      group_id: this.data.group_id,
      target_id: target_id,
      target_name: target_name,
      target_type: target_type,
      target_limit: target_limit,
      target_value: target_value,
    }
    var that = this

    wetargetlib.editTarget(params, function (code, msg, data) {
      if (code == 0) {
        util.showSuccess("保存成功", function () {

          /*
          wx.redirectTo({
            url: '/pages/habit/group/target?group_id=' + that.data.group_id
          })
          */
        })
      } else {
        that.showError(msg)
      }
    })
  },
  deleteGroupTargetTap: function (e) {
    var target_id = e.target.dataset.target_id
    var target_idx = e.target.dataset.target_idx
    console.log(target_id, target_idx)

    var params = {
      group_id: this.data.group_id,
      target_id: target_id
    }

    var that = this
    wx.showModal({
      title: '确定删除',
      content: '删除任务不影响之前打卡记录',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wetargetlib.deleteTarget(params, function (code, msg, data) {
            if (code == 0) {
              util.showSuccess("删除成功", function () {
                wx.redirectTo({
                  url: '/pages/habit/group/target?group_id=' + that.data.group_id
                })
                //todo
              })
            } else {
              that.showError(msg)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })



  },
  addGroupTargetSubmit: function (e) {
    util.showLoading('创建中')
    console.log("formSubmit:", e, e.detail.value)


    var target_name = e.detail.value.target_name
    var target_value = e.detail.value.target_value ? e.detail.value.target_value : ''

    var target_type_index = e.detail.value.target_type
    var target_type = this.data.target_types[target_type_index]["key"]

    var target_limit_index = e.detail.value.target_limit
    var target_limit = this.data.target_limits[target_limit_index]["key"]


    if (target_name == "") {
      this.showError("圈子任务不能为空")
      return
    }

    if (target_type == "select" && target_value == "") {
      this.showError("默认值不能为空")
      return
    }


    var params = {
      group_id: this.data.group_id,
      target_name: target_name,
      target_type: target_type,
      target_limit: target_limit,
      target_value: target_value,
    }
    var that = this

    wetargetlib.addTarget(params, function (code, msg, data) {
      if (code == 0) {
        util.showSuccess("创建成功", function () {
          wx.redirectTo({
            url: '/pages/habit/group/target?group_id=' + that.data.group_id
          })
        })
      } else {
        that.showError(msg)
      }
    })
  },
  showError: function (msg) {
    wx.hideToast()
    util.hideLoading()
    var that = this
    this.setData({
      error: {
        show: false,
        msg: "错误提示:" + msg
      }
    })

    setTimeout(function () {
      that.setData({
        error: {
          show: true,
          msg: "错误提示"
        }
      })
    }, 2000)

  },
  getTargets(targets) {
    var i = 1
    for (var idx in targets) {
      targets[idx]["no"] = i
      i++
    }
    return targets
  }
})