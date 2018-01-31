// pages/habit/group/create.js

var util = require('../../../../utils/util');
var wegrouplib = require('../../../common/lib/wegrouplib');

var app = getApp()
Page({
  data: {
    target_types: [],
    target_type_index: 0,
    target_limits: [],
    target_limit_index: 0,
    target_value_placeholder: "",
    group_name: '',
    target_name: '',
    target_value: '',
    introduction: '',
    is_quanzi: true,
    quanzi: '圈子',

    error: {
      msg: "",
      show: true
    },
    form_disabled: false,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    // get group setting
    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        is_quanzi: setting.is_quanzi,
        quanzi: setting.is_quanzi ? '圈子' : '任务',
        target_types: setting.group.target_types,
        target_limits: setting.group.target_limits
      })
      wx.setNavigationBarTitle({
        title: setting.is_quanzi ? '创建小圈子' : '创建任务'
      })

    });
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
  bindPickerTargetChange: function (e) {
    this.setData({
      target_type_index: e.detail.value
    })
  },
  bindPickerLimitChange: function (e) {
    this.setData({
      target_limit_index: e.detail.value
    })
  },
  bindGroupNameChange: function (e) {
    this.setData({
      group_name: e.detail.value
    })
  },
  bindTargetNameChange: function (e) {
    this.setData({
      target_name: e.detail.value
    })
  },
  bindIntroductionChange: function (e) {
    this.setData({
      introduction: e.detail.value
    })
  },
  bindTargetValueChange: function (e) {
    this.setData({
      target_value: e.detail.value
    })
  },
  createGroupSubmit: function (e) {
    util.showBusy('创建中');
    this.setData({
      form_disabled: true
    })
    console.log("formSubmit:", e, e.detail.value);

    //var group_name = e.detail.value.group_name;

    var group_name = this.data.group_name;
    var target_name = this.data.target_name;
    var target_type = this.data.target_types[this.data.target_type_index]["key"]; //e.detail.value.target_type;
    var target_value = this.data.target_value;
    var introduction = this.data.introduction;

    var target_limit = this.data.target_limits[this.data.target_limit_index]["key"];

    if (group_name == "") {
      this.showError("圈子名称不能为空");
      return;
    }

    if (target_name == "") {
      this.showError("圈子任务不能为空");
      return;
    }

    if (target_type == "select" && target_value == "") {
      this.showError("默认值不能为空");
      return;
    }

    var that = this;
    var params = {
      name: group_name,
      target_name: target_name,
      target_type: target_type,
      target_value: target_value,
      introduction: introduction,
      target_limit: target_limit
    }
    wegrouplib.createGroup(params, function (code, msg, data) {
      if (code == 0) {
        var group_id = data.group.group_id;
        util.showSuccess("创建成功", function () {

          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/habit/group/view?from=create&group_id=' + group_id
            })
          }, 1000);

        })
      } else {
        that.showError(msg);
      }
    })
  },
  showError: function (msg) {
    wx.hideToast();
    var that = this;
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
    }, 2000);

  }
})