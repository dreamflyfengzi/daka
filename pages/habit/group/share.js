// pages/habit/group/task.js
var wefeedlib = require('../../common/lib/wefeedlib')
var wegrouplib = require('../../common/lib/wegrouplib')

var DAKA_QRcodeurl = "/image/weapp_wxacode.jpg"
var DAKA_GroupUrl = "/image/logo.png"
Page({
  data: {
    windowWidth: 0,
    windowHeight: 0,

    group_image: '',

    nickname: '',
    target_day: 9,
    feed_time: '',
    target_title: '',
    target_title: "",
    target_desc: "",
    group_name: '',

    target_image: "",
    target_image_path: "",
    qrcdeimage: DAKA_QRcodeurl,

    image_height: 0,
    image_width: 0,
    image_y: 0,
    image_x: 0,

    target_title_y: 0,
    target_desc_y: 0,
    target_auther_y: 0,

    canvas_width: 0,
    canvas_height: 0,
    is_show: true
  },
  onLoad: function (options) {

    console.log(options)

    // 页面初始化 options为页面跳转所带来的参数
    
    var options = {
      feed_id: 94434,
      group_id: 12200,
      group_name: "OL优美妆健身打卡群",
      target_day: "34",
      target_name: "一起变美变瘦"
    }
    

    var group_id = options.group_id
    var target_desc = options.target_desc
    var target_title = options.target_title
    var target_image = options.target_image

    wx.showLoading({
      title: '绘制中',
    })


    var group = wegrouplib.getLocalGroup(group_id)
    console.log(group)

    if (group.qrcodeurl && group.qrcodeurl != "") {

    }



    this.setData({
      group_id: group_id,
      group: group,
      group_name: options.group_name,
      target_day: options.target_day,
      target_name: '坚持#' + options.target_name + '#',
      target_image: '',
      qrcdeimage: (group && group.qrcodeurl) ? group.qrcodeurl : DAKA_QRcodeurl,
      group_image: group && group.imgurl ? group.imgurl : ''
    })

    this.ctx = wx.createCanvasContext('feed_canvas')

    var that = this
    wx.getSystemInfo({
      success: function (systemInfo) {
        if (that.data.target_image != null && that.data.target_image != '') {
          wx.getImageInfo({
            src: that.data.target_image,
            success: function (image) {
              console.log(image)
              console.log(image.width)
              console.log(image.height)

              that.initSize(systemInfo, image)
              that.draw()
            },
            fail: function (res) {
              that.initSize(systemInfo, null)
              that.draw()
            }
          })
        } else {
          that.initSize(systemInfo, null)
          that.draw()
        }
      },
      fail: function (res) {
        console.log(res)
      }
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

  /*
   * 计算图片大小
   */
  initSize: function (system, image) {

    var that = this
    var target_desc = that.data.target_desc
    var _target_desc = "";
    var font_width = 18;
    var strlen = 0;
    var target_desc_height = target_desc && target_desc.length > 0 ? 18 : 0;
    for (var i in target_desc) {
      //console.log(target_desc[i])
      if (target_desc.charCodeAt(i) > 255) {
        strlen += 2
      } else {
        strlen++;
      }
      _target_desc += target_desc[i]
      if (target_desc[i] == "\n") {
        strlen = 0;
        target_desc_height += font_width;
      }
      if ((system.windowWidth - 40) <= strlen * font_width / 2) {
        _target_desc += "\n"
        strlen = 0
        target_desc_height += font_width;
      }
    }

    var target_title = that.data.target_title
    var _target_title = "";
    var target_title_height = 18;

    font_width = 20
    strlen = 0;
    for (var i in target_title) {
      //console.log(target_desc[i])
      if (target_title.charCodeAt(i) > 255) {
        strlen += 2
      } else {
        strlen++;
      }
      _target_title += target_title[i]

      if (target_title[i] == "\n") {
        strlen = 0;
        target_title_height += font_width;
      }

      if ((system.windowWidth - 40) <= strlen * font_width / 2) {
        _target_title += "\n"
        strlen = 0
        target_title_height += font_width;
      }
    }

    var header_height = 170

    var image_height, image_width, image_x, image_y
    image_height = 0
    image_x = 0
    image_y = 0
    if (image != null) {
      if (image.width > (system.windowWidth - 40)) {
        image_width = system.windowWidth - 40
        image_height = (image.height / image.width) * image_width
        image_x = 20
        image_y = header_height
      } else {
        image_height = image.height
        image_width = image.width
        image_x = (system.windowWidth - image.width) / 2
        image_y = header_height
      }
    }

    var target_title_y = header_height + image_height + 30
    var target_desc_y = target_title_y + target_title_height + 15
    var target_auther_y = (target_desc_height > 0) ? target_desc_y + target_desc_height : target_title_y + target_title_height
    that.setData({
      target_image_path: image && image.path ? image.path : '',
      windowWidth: system.windowWidth,
      windowHeight: system.windowHeight,
      canvas_height: target_auther_y + 140,
      canvas_width: system.windowWidth,
      image_width: image_width,
      image_height: image_height,
      image_x: image_x,
      image_y: image_y,
      target_title_y: target_title_y,
      target_title: _target_title,
      target_desc_y: target_desc_y,
      target_desc: _target_desc,
      target_auther_y: target_auther_y,
    })
  },
  draw: function () {


    var ctx = this.ctx

    var width = this.data.canvas_width
    var height = this.data.canvas_height

    //init
    ctx.setFillStyle('white')
    ctx.fillRect(0, 0, width, height)

    ctx.setFillStyle('#000000')
    ctx.setStrokeStyle('#000000')
    ctx.setFontSize(10)

    //title

    var title_x = 20
    if (this.data.group_image && this.data.group_image != DAKA_GroupUrl) {
      title_x = 85
    }
    ctx.setTextAlign('left')
    ctx.setFillStyle('#000000')
    ctx.setFontSize(28)
    ctx.fillText(this.data.group_name, title_x, 60)


    ctx.setTextAlign('right')
    ctx.setFillStyle('#228B22')
    ctx.setFontSize(24)
    ctx.fillText('已坚持' + this.data.target_day + '天', width - 20, 100)

    ctx.setFillStyle('#000000')
    ctx.setFontSize(20)
    ctx.fillText(this.data.target_name, width - 20, 130)

    ctx.setFillStyle('#D3D3D3')
    ctx.setFontSize(12)
    ctx.fillText(this.data.feed_time, width - 20, 150)

    ctx.setFillStyle('#000000')
    ctx.fillText(this.data.nickname, width - 100, 150)


    //画图
    if (this.data.image_x > 0) {
      ctx.drawImage(this.data.target_image_path, this.data.image_x, this.data.image_y, this.data.image_width, this.data.image_height)
    }

    ctx.setTextAlign('left')
    ctx.setFillStyle('#000000')
    ctx.setFontSize(18)
    var target_title = this.data.target_title.split("\n");
    for (var i in target_title) {
      ctx.fillText(target_title[i], 20, this.data.target_title_y + i * 18)
    }

    if (this.data.target_desc.length > 0) {
      ctx.setTextAlign('left')
      ctx.setFillStyle('#000000')
      ctx.setFontSize(16)
      var target_desc = this.data.target_desc.split("\n");
      for (var i in target_desc) {
        ctx.fillText(target_desc[i], 20, this.data.target_desc_y + i * 18)
      }
    }

    ctx.setTextAlign('right')
    ctx.setFillStyle('#D3D3D3')
    ctx.setFontSize(12)
    ctx.fillText('长按识别二维码,一起来打卡', width - 140, height - 60)

    ctx.setFillStyle('#D3D3D3')
    ctx.setFontSize(14)
    ctx.fillText('与你的好友一起', width - 140, height - 40)


    ctx.setStrokeStyle('#D3D3D3')
    ctx.moveTo(width - 130, height - 100)
    ctx.lineTo(width - 130, height - 20)
    ctx.stroke()

    ctx.draw()
    wx.hideLoading()
    this.setData({
      is_show: false
    })

    console.log(this.data.qrcdeimage)
    var that = this
    if (that.data.qrcdeimage == DAKA_QRcodeurl) {
      ctx.drawImage(DAKA_QRcodeurl, width - 120, height - 120, 100, 100)
      ctx.draw(true)
      var params = {
        group_id: that.data.group_id
      }
      wegrouplib.qrcodeGroup(params, function (code, msg, data) {
        wx.hideToast()
        console.log(data)
        if (code == 0) {

          wx.getImageInfo({
            src: data.group.qrcodeurl,
            success: function (res) {

              ctx.drawImage(res.path, width - 120, height - 120, 100, 100)
              ctx.draw(true)
            },
            fail: function (res) {
              ctx.drawImage(DAKA_QRcodeurl, width - 120, height - 120, 100, 100)
              ctx.draw(true)
            }
          })

        } else {
          ctx.drawImage(DAKA_QRcodeurl, width - 120, height - 120, 100, 100)
          ctx.draw(true)
        }
      })

    } else {
      wx.getImageInfo({
        src: that.data.qrcdeimage,
        success: function (res) {

          ctx.drawImage(res.path, width - 120, height - 120, 100, 100)
          ctx.draw(true)
        },
        fail: function (res) {
          ctx.drawImage(DAKA_QRcodeurl, width - 120, height - 120, 100, 100)
          ctx.draw(true)
        }
      })
    }

    console.log("group_image", that.data.group_image)
    if (that.data.group_image && that.data.group_image != DAKA_GroupUrl) {
      wx.getImageInfo({
        src: that.data.group_image,
        success: function (res) {
          console.log(res)
          ctx.drawImage(res.path, 20, 20, 60, 60)
          ctx.draw(true)
        },
        fail: function (res) {
          console.log(res)
          //ctx.drawImage(DAKA_QRcodeurl, width - 120, height - 120, 100, 100)
          //ctx.draw(true)
        }
      })
    }

  },
  saveCanvasTap: function () {
    var that = this
    console.log('feed_canvas')
    wx.canvasToTempFilePath({
      canvasId: "feed_canvas",
      success: function (res) {
        console.log(res.tempFilePath)
        wx.previewImage({
          current: res.tempFilePath, // 当前显示图片的http链接
          urls: [res.tempFilePath] // 需要预览的图片http链接列表
        })
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function (res) {
        console.log(res)
      }
    })
  },
  onShareAppMessage: function () {

    var that = this
    var d = new Date()
    return {
      //title: '一起来打卡 ' + this.data.group.name,
      title: '我在' + this.data.group.name + '已坚持' + this.data.group.counter + '天#' + this.data.group.target_name + '#, 邀请你来打卡',
      path: '/pages/habit/group/view?from=share&group_id=' + this.data.group_id + '&timestamp=' + d.getTime(),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      },
      complete: function (res) {
      }
      //imageUrl: this.data.feeds[0]["images"][0]['url']
    }

  },
})