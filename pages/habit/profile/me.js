// pages/habit/profile/me.js
var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');
var config = require('../../../config');
var util = require('../../../utils/util.js');
var wesmslib = require('../../common/lib/wesmslib');


var app = getApp()
Page({
  data: {
    error: {
      msg: "",
      show: true
    },
    form_disabled: false,
    userInfo: {},
    telephone: '',
    isVcodeSended: 0, // 0 可发送 1 发送中 2 不可发送 
    vcodeTime: 0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
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
  bindTelephoneInput: function (e) {
    console.log(e)
    this.setData({
      telephone: e.detail.value
    })
  },

  sendVcodeTap: function (e) {
    var that = this
    var telephone = that.data.telephone


    if (!telephone || telephone.length != 11 || telephone[0] != 1) {
      that.showError("手机号输入有误");

      return;
    }
    if (that.data.isVcodeSended != 0) {
      return;
    }

    that.setData({
      isVcodeSended: 1
    })

    wesmslib.sendVcode(telephone, function (code, msg, data) {
      if (code != 0) {
        that.showError("获取验证码失败,请重试");
        that.setData({
          isVcodeSended: 0
        })
        return
      }
      that.setData({
        isVcodeSended: 2,
        vcodeTime: 60
      })
      vcodeTimeInterval = setInterval(function () {
        var vcodeTime = that.data.vcodeTime -= 1
        if (vcodeTime > 0) {
          that.setData({
            vcodeTime: vcodeTime
          })
        } else {
          console.log(1)
          that.setData({
            isVcodeSended: 0
          })
          clearInterval(vcodeTimeInterval)
        }
      }, 1000)

      // 发送成功
      that.showError("验证码发送成功", true);
    })
  },
  editSubmit: function (e) {
    util.showBusy("保存中");
    this.setData({
      form_disabled: true
    })
    console.log("formSubmit:", e, e.detail.value);

    var nickname = e.detail.value.nickname;
    var telephone = e.detail.value.telephone;
    var motto = e.detail.value.motto;

    if (nickname == "") {
      this.showError("昵称不能为空");
      return;
    }

    var that = this;

    qcloud.request({
      url: config.service.profileUrl + "edit",
      login: true,
      method: "POST",
      data: {
        nickname: nickname,
        telephone: telephone,
        motto: motto
      },
      header: { 'content-type': 'application/json' },
      success: (response) => {
        if (response && response.data) {
          if (response.data.code == 0) {

            app.getUser(function () {
              util.showSuccess("保存成功", function () {
                that.setData({
                  form_disabled: false
                })
              })
            });

          } else {
            that.showError(response.data.message);
          }
        } else {
          that.showError("系统开小差了,请稍后重试");
        }
      },
      fail: (error) => {
        that.showError("网络异常,请稍后重试");
      }
    });

  },
  showError: function (msg) {
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