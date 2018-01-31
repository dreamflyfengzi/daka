// pages/habit/group/image.js
var wegrouplib = require('../../common/lib/wegrouplib')
var util = require('../../../utils/util')
var weuploadlib = require('../../common/lib/weuploadlib');

var app = getApp()

Page({
  data: {
    group_id: 0,
    group: null,
    error: {
      msg: "",
      show: true
    },
    cossign: null,
    imageSrc: null,
    cosImageSrc: null,
    form_disabled: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    var group_id = options.group_id
    that.setData({
      group_id: group_id
    })


    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
      that.getGroup()
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
  chooseImageTap: function () {
    var self = this

    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        var imageSrc = res.tempFilePaths[0]
        var fileName = res.tempFilePaths[0].match(/(wxfile:\/\/)(.+)/)
        fileName = fileName[2]
        if (fileName.indexOf("tmp_") == 0) {
          fileName = fileName.substr(4)
        }
        var d = new Date()

        fileName = d.getTime() + "_" + fileName
        var image = {
          filePath: res.tempFilePaths[0],
          fileName: fileName,
          type: "image"
        }

        that.setData({
          imageSrc: image.filePath,
          cosImageSrc: null,
          form_disabled: true
        })
        util.showBusy('上传中');
        that.uploadFile(image)
      },
      fail: function ({errMsg}) {
      }
    })
  },
  previewImageTap: function (e) {
    var current = e.target.dataset.src

    var urls = []
    urls.push(current)

    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  uploadFile: function (image) {
    var that = this;

    weuploadlib.uploadFile("group", that.data.group_id, image, function (ret, file, data) {
      var cosres = JSON.parse(data);
      if (!(cosres && cosres.code == 0)) {
        ret = false
      }
      if (ret) {
        that.setData({
          cosImageSrc: data,
          form_disabled: false
        })
        util.showSuccess('上传成功');
      } else {
        that.showError("上传图片失败")
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
        imageSrc: group.imgurl,
        is_creator: group.creator == that.data.userInfo.id ? true : false
      })
    }
  },
  saveImageTap: function () {
    var that = this
    util.showBusy('保存中');
    if (this.data.cosImageSrc == null) {
      this.showError("无需保存")
    }
    var params = {
      image: this.data.cosImageSrc,
      group_id: that.data.group_id
    }

    wegrouplib.imageGroup(params, function (code, msg, data) {
      if (code == 0) {
        util.showSuccess('保存成功', function () {
          var group = that.data.group
          group.imgurl = data.group.imgurl
          wegrouplib.saveLocalGroup(group)

          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        });
      } else {
        that.showError("上传失败 " + msg)
      }
    })

  },
  showError: function (msg) {
    wx.hideToast()
    var that = this;
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
    }, 2000);

  }
})