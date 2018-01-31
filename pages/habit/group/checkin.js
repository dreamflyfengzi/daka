var util = require('../../../utils/util.js')
var wegrouplib = require('../../common/lib/wegrouplib')
var weuploadlib = require('../../common/lib/weuploadlib')
var weuserlib = require('../../common/lib/weuserlib')

Page({
  data: {
    from: null,
    group_id: null,
    group: null,
    targets: [],
    target_index: 0,
    target_type_index: 0,
    target_time: '',
    target_input: '',
    target_desc: '',
    target_walk: 0,
    target_walk_input: '',
    target_walk_disabled: true,
    error: {
      msg: "",
      show: true
    },
    cossign: null,
    imageSrc: null,
    cosImageSrc: null,
    form_disabled: false,
    form_loading: false
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    var group_id = options.group_id
    var day_time = options.day_time

    util.showLoading('加载中')

    var from = options.from
    //todo
    //group_id = 13419
    from = "group"

    var d = new Date()
    var target_time = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes())
    this.setData({
      group_id: group_id,
      day_time: day_time,
      from: from,
      target_time: target_time
    })

    that.getGroup(group_id)
  },
  bindPickerTargetChange: function (e) {
    var target_index = e.detail.value
    this.setData({
      target_index: target_index
    })


    if (this.data.targets[target_index]["type"] == 'walk') {
      this.getWeRunData()
    }
  },
  bindPickerTargetTypeChange: function (e) {
    this.setData({
      target_type_index: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      target_time: e.detail.value
    })
  },
  bindWalkChange: function (e) {
    this.setData({
      target_walk: e.detail.value
    })
  },
  bindInputChange: function (e) {
    this.setData({
      target_input: e.detail.value
    })
  },
  bindDescChange: function (e) {
    this.setData({
      target_desc: e.detail.value
    })
  },
  getWeRunData: function () {
    // 
    var that = this
    if (wx.getWeRunData) {
      wx.showLoading('获取数据中')

      wx.getWeRunData({
        success(res) {
          //const encryptedData = res.encryptedData

          //console.log(encryptedData)
          var params = {
            group_id: that.data.group_id,
            encryptedData: res.encryptedData,
            iv: res.iv,
            type: "werun",
            day_time: that.data.day_time
          }
          weuserlib.decryptWeRun(params, function (code, msg, data) {
            util.hideLoading()
            if (code == 0) {
              that.setData({
                target_walk_disabled: true,
                target_walk: data.step,
                target_walk_input: '微信运动: ' + data.step + '步'
              })
            } else {
              that.setData({
                target_walk_disabled: false,
                target_walk: 0,
                target_walk_input: ''
              })
              wx.showModal({
                title: '提示',
                showCancel: false,
                content: '微信运动获取失败，请手动输入'
              })
            }
          })

        },
        fail(res) {
          console.log(res)
          util.hideLoading()
          if (res.errMsg.indexOf("auth deny")) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '请授权使用微信运动',
              success: function (res) {
                wx.openSetting({
                  success: (res) => {
                    /*
                     * res.authSetting = {
                     *   "scope.userInfo": true,
                     *   "scope.userLocation": true
                     * }
                     */
                  }
                })
              }

            })
          } else {
            that.setData({
              target_walk_disabled: false,
              target_walk: 0,
              target_walk_input: ''
            })
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '微信运动获取失败，请手动输入'
            })
          }
        }
      })
    } else {
      util.hideLoading()
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        success: function (res) {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }
  },
  chooseImage: function () {
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
          form_disabled: true
        })

        that.uploadFile(image)
      },
      fail: function ({ errMsg }) {
      }
    })
  },

  uploadFile: function (image) {
    var that = this
    util.showLoading('上传中')

    weuploadlib.uploadFile("task", that.data.group_id, image, function (ret, file, data) {
      util.hideLoading()
      var cosres = JSON.parse(data)
      if (!(cosres && cosres.code == 0)) {
        ret = false
      }

      if (ret) {
        that.setData({
          cosImageSrc: { cos: data },
          form_disabled: false
        })

        util.showSuccess('上传成功')
      } else {
        that.showError("上传图片失败")
      }
    })
  },
  removeImageTap: function (e) {
    this.setData({
      imageSrc: null
    })
  },
  dakaSubmit: function (e) {
    this.setData({
      form_disabled: true,
      form_loading: true
    })

    var form_id = e.detail.formId

    util.showLoading('正在打卡')
    var group = this.data.group

    var _target = this.data.targets[this.data.target_index]
    var target
    if (_target.type == "select") {
      target = _target.value[this.data.target_type_index]
    } else if (_target.type == "time") {
      target = this.data.target_time
    } else if (_target.type == "walk") {
      target = this.data.target_walk
      var re = /^[0-9]+$/
      if (!re.test(target) || target == 0 || target > 200000) {
        this.showError("请输入正确的微信步数")
        return false
      }
    } else {
      target = this.data.target_input
    }

    if (target == "") {
      this.showError("打卡任务不能为空")
      return false
    }

    if (this.data.imageSrc && !this.data.cosImageSrc) {
      this.showError("上传图片失败,请删除重新上传")
      return false
    }
    var that = this

    var images = []
    if (this.data.imageSrc && this.data.cosImageSrc) {
      images.push(this.data.cosImageSrc)
    }

    var target_name = this.data.targets[this.data.target_index]["name"];
    var target_id = this.data.targets[this.data.target_index]["id"];

    var params = {
      group_id: that.data.group_id,
      desc: this.data.target_desc,
      target: target,
      images: images,
      day_time: that.data.day_time,
      form_id: form_id,
      target_id: target_id,
      target_name: target_name
    }

    //return false
    wegrouplib.dakaGroup(params, function (code, msg, data) {
      if (code == 0) {
        util.hideLoading()
        util.showSuccess('打卡成功', function () {
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
            /*
            wx.redirectTo({
              url: '/pages/habit/group/view?daka=1&target=' + target + '&group_id=' + that.data.group_id
            })
            */
          }, 1000)
        })
      } else {
        that.showError("打卡失败," + msg)
      }
    })
  },

  getGroup: function (group_id) {
    var that = this

    // from cache
    var group = wegrouplib.getLocalGroup(group_id)
    if (group) {

      var targets = []
      for (var i in group.targets) {
        if (group.targets[i]["limit"] == -1 || group.targets[i]["daka"] < group.targets[i]["limit"]) {
          targets.push(group.targets[i])
        }
      }
      that.setData({
        group: group,
        targets: targets
      })

      wx.setNavigationBarTitle({
        title: group.name + "·打卡"
      })

      console.log(group)
      if (!that.data.day_time) {
        if (group.is_daka || targets.length == 0) {
          wx.showModal({
            title: "打卡提示",
            content: "今天已打卡，无需重复打卡",
            showCancel: false,
            success: function (res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }

        if (group.is_show_daka == 0) {
          wx.showModal({
            title: "打卡提示",
            content: "打卡时间已过，请明天早点打卡",
            showCancel: false,
            success: function (res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }

        if (targets.length > 0 && targets[0]["type"] == 'walk') {
          that.getWeRunData()
        } else {
          util.hideLoading()
        }
      } else {
        var params = {
          group_id: that.data.group_id,
          day_time: that.data.day_time
        }
        wegrouplib.getTask(params, function (code, msg, data) {
          if (code == 0) {
            var targets = []
            for (var i in data.group.targets) {
              if (data.group.targets[i]["limit"] == -1 || data.group.targets[i]["daka"] < data.group.targets[i]["limit"]) {
                targets.push(data.group.targets[i])
              }
            }
            that.setData({
              group: data.group,
              targets: targets
            })
            if (targets.length > 0 && targets[0]["type"] == 'walk') {
              util.hideLoading()
              that.getWeRunData()
            } else {
              util.hideLoading()
            }
          } else {
            wx.showModal({
              title: "打卡提示",
              content: "打卡异常，请重试",
              showCancel: false,
              success: function (res) {
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          }
        })
      }


    }
  },
  showError: function (msg) {
    util.hideLoading()
    var that = this
    this.setData({
      error: {
        show: false,
        msg: "错误提示:" + msg
      },
      form_disabled: false,
      form_loading: false
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
