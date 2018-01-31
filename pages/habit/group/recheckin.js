var util = require('../../../utils/util.js')
var wegrouplib = require('../../common/lib/wegrouplib')
var weuploadlib = require('../../common/lib/weuploadlib')
var weuserlib = require('../../common/lib/weuserlib')
var wefeedlib = require('../../common/lib/wefeedlib')

Page({
  data: {
    from: null,
    feed_id: 0,
    group_id: null,
    group: null,
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
    form_disabled: false
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    var group_id = options.group_id


    // 页面初始化 options为页面跳转所带来的参数
    /*
    var options = {
      feed_id: 93339,
      group_id: 13333,
      group_name: "OL优美妆健身打卡群",
      target_day: "34",
      target_name: "一起变美变瘦"
    }
    */

    var feed_id = options.feed_id
    var group_id = options.group_id
    var target_desc = options.target_desc
    var target_title = options.target_title
    var target_image = options.target_image


    var feed = wefeedlib.getLocalFeedSync(feed_id)
    console.log("feed", feed)

    var d = new Date();
    d.setTime(feed.day_time * 1000);
    var day = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()

    var from = options.from
    that.setData({
      feed_id: feed_id,
      group_id: group_id,
      feed: feed,
      day: day,
      target_desc: feed.desc,
      imageSrc: feed.images && feed.images.length > 0 ? feed.images[0].url : null,
      has_image: feed.images && feed.images.length > 0 ? true : false,
      from: from
    })


    that.getGroup(group_id)
  },
  bindPickerChange: function (e) {
    console.log(e)
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
      util.showLoading('获取数据中')
      wx.getWeRunData({
        success(res) {
          //const encryptedData = res.encryptedData

          //console.log(encryptedData)
          var params = {
            group_id: that.data.group_id,
            encryptedData: res.encryptedData,
            iv: res.iv,
            daytime: that.data.day,
            type: "werun"
          }
          weuserlib.decryptWeRun(params, function (code, msg, data) {
            util.hideLoading()
            if (code == 0) {
              that.setData({
                target_walk_disabled: true,
                target_walk: data.step,
                target_walk_input: '微信运动步数: ' + data.step + '步'
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
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
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
          has_image: false,
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
      var cosres = JSON.parse(data)
      if (!(cosres && cosres.code == 0)) {
        ret = false
      }
      if (ret) {
        that.setData({
          cosImageSrc: { cos: data },
          form_disabled: false
        })
        util.hideLoading()
        util.showSuccess('上传成功')
      } else {
        that.showError("上传图片失败")
      }
    })
  },
  removeImageTap: function (e) {
    this.setData({
      imageSrc: null,
      has_image: false
    })
  },
  dakaSubmit: function (e) {
    this.setData({
      form_disabled: true
    })
    util.showLoading('正在保存')

    var _target = this.data.target

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

    if (!this.data.has_image && this.data.imageSrc && !this.data.cosImageSrc) {
      this.showError("上传图片失败,请删除重新上传")
      return false
    }

    var that = this

    var images = []
    if (!this.data.has_image && this.data.imageSrc && this.data.cosImageSrc) {
      images.push(this.data.cosImageSrc)
    }

    var params = {
      task_id: that.data.feed_id,
      group_id: that.data.group_id,
      desc: this.data.target_desc,
      target: target,
      images: images,
      update_image: that.data.feed.images && that.data.feed.images.length > 0 && this.data.has_image == false ? 1 : 0
    }
    console.log(params);

    wegrouplib.redakaGroup(params, function (code, msg, data) {
      if (code == 0) {
        util.hideLoading()
        util.showSuccess('保存成功', function () {
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
            /*
            wx.redirectTo({
              url: '/pages/habit/group/view?daka=1&target=' + target + '&group_id=' + that.data.group_id
            })
            */
          }, 2000)
        })
      } else {
        that.showError("保存失败," + msg)
      }
    })
  },

  getGroup: function (group_id) {
    var that = this

    // from cache
    var group = wegrouplib.getLocalGroup(group_id)
    if (group) {

      var targets = []
      var target = {}
      for (var i in group.targets) {
        if (group.targets[i]["id"] == that.data.feed["target_id"]) {
          targets.push(group.targets[i])
          target = group.targets[i]
          break;
        }
      }
      that.setData({
        group: group,
        targets: targets,
        target:target
      })

      if (target.type == 'walk') {
        var d1 = new Date();
        var day1 = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-' + d1.getDate()

        var d2 = new Date();
        d2.setTime(that.data.feed.day_time * 1000);
        var day2 = d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate()

        console.log(day1, day2)

        that.getWeRunData()

        /*
        if (day1 == day2){
          that.getWeRunData()
        }else{
          that.setData({
            target_walk_disabled: true,
            target_walk: that.data.feed.target ,
            target_walk_input: '微信运动步数: ' + that.data.feed.target + '步'
          })
        }
        */
      }
      else if (target.type == "select") {
        //target_type_index
        var target_type_index = 0
        for (var i in target.value) {
          if (that.data.feed.target == target.value[i]) {
            target_type_index = i
          }
        }
        this.setData({
          target_type_index: target_type_index
        })
      } else if (target.type == "time") {
        //target = this.data.target_time
        var d1 = new Date();
        var day1 = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-' + d1.getDate()

        var d2 = new Date();
        d2.setTime(that.data.feed.day_time * 1000);
        var day2 = d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate()

        console.log(day1, day2)
        if (day1 == day2) {
          var d = new Date()
          var target_time = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes())
          that.setData({
            target_time: target_time
          })

        } else {
          that.setData({
            target_time: that.data.feed.target
          })

        }
      } else if (target.type == "text") {
        this.setData({
          target_input: that.data.feed.target
        })
      }

      console.log(group)
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
