// pages/habit/group/export.js
var wegrouplib = require('../../common/lib/wegrouplib')
var util = require('../../../utils/util')

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    picker_start_day: '',
    picker_end_day: '',
    start_day: '',
    end_day: '',
    error: {
      msg: "",
      show: true
    },
    disabled: false,
    export_status: 0,
    tasks: {},
    is_creator: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var group_id = options.group_id;

    this.setData({
      isSetClipboardData: wx.setClipboardData ? true : false,
      group_id: group_id
    })

    util.showLoading('加载中')
    var that = this
    app.getUserInfo(function (userInfo, setting) {
      //更新数据
      that.setData({
        userInfo: userInfo
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


  bindStartDayChange: function (e) {
    this.setData({
      start_day: e.detail.value
    })
  },
  bindEndDayChange: function (e) {
    this.setData({
      end_day: e.detail.value
    })
  },

  bindSetClipboardDataTap: function (e) {
    if (wx.setClipboardData) {
      wx.setClipboardData({
        data: this.data.tasks.fileurl,
        success: function (res) {
          util.showSuccess('复制成功')
        }
      })
    }
  },

  bindPreviewFileTap: function (e) {
    wx.downloadFile({
      url: this.data.tasks.fileurl,
      success: function (res) {
        var filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          //fileType:'csv',
          success: function (res) {
            console.log(filePath, res, '打开文档成功')
          }
        })
      }
    })
  },

  bindExportTap: function (e) {
    util.showLoading('导出中')
    this.setData({
      disabled: true
    })

    var params = {
      group_id: this.data.group_id,
      start_day: this.data.start_day,
      end_day: this.data.end_day
    }

    var that = this
    wegrouplib.exportGroup(params, function (code, msg, data) {
      if (code == 0) {
        util.hideLoading()
        if (data.tasks.daka_counter > 0) {
          that.setData({
            export_status: 1,
            tasks: data.tasks
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前无打卡数据,请更换时间',
            showCancel: false,
            success: function (res) {
              that.setData({
                export_status: 0,
                disabled: false
              })
            }
          })
        }
      } else {
        that.showError(msg)
      }
    })
  },

  getGroup: function () {
    var that = this
    var group_id = that.data.group_id
    var group = wegrouplib.getLocalGroup(group_id)

    var d = new Date()
    var end_day = d.getFullYear() + '-' + ((d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate())


    var sd = new Date(new Date() - 24 * 3600 * 1000)
    var start_day = sd.getFullYear() + '-' + ((sd.getMonth() + 1) < 10 ? "0" + (sd.getMonth() + 1) : (sd.getMonth() + 1)) + "-" + (sd.getDate() < 10 ? "0" + sd.getDate() : sd.getDate())

    var cd = new Date(group.create_time * 1000)
    var create_day = cd.getFullYear() + '-' + ((cd.getMonth() + 1) < 10 ? "0" + (cd.getMonth() + 1) : (cd.getMonth() + 1)) + "-" + (cd.getDate() < 10 ? "0" + cd.getDate() : cd.getDate())

    // from cache
    console.log(create_day, start_day, end_day)
    if (group) {
      this.setData({
        group: group,
        start_day: start_day,
        end_day: end_day,
        picker_start_day: create_day,
        picker_end_day: end_day,
        is_creator: group.creator == that.data.userInfo.id ? true : false,
      })
    }

    util.hideLoading()
  },
  showError: function (msg) {
    util.hideLoading()
    var that = this
    this.setData({
      export_status: 0,
      error: {
        show: false,
        msg: "错误提示:" + msg
      },
      disabled: false
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