// pages/habit/group/view.js
var util = require('../../../utils/util')
var wegrouplib = require('../../common/lib/wegrouplib')
var wefeedlib = require('../../common/lib/wefeedlib')

var sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置

function _next() {
  var that = this;
  if (isNaN(this.data.percent) || this.data.progress >= this.data.percent) {
    return true;
  }
  this.setData({
    progress: ++this.data.progress
  });
  setTimeout(function () {
    _next.call(that);
  }, 20);
}

var app = getApp()
Page({

  data: {
    user_id: null,
    userInfo: {},
    group_id: null,
    group: null,
    members: null,
    is_join: true,
    activeFeedIndex: 'feed_all',
    weakday: util.getWeakDay(),
    activeTabIndex: 'group_feed',
    sliderOffset: 0,
    sliderLeft: 0,
    feeds: [],
    users: [],
    scrollHeight: 0,
    windowHeight: 0,
    isFeedFristRequest: true,
    isFeedPullDownLoading: true,
    isFeedNeedLoad: false,
    target: null,
    info: {
      show: false,
      msg: ""
    },
    isShowTitle: false,
    windowWidth: 0,
    retryNum: 0,
    progress: 0,
    percent: 100,
    is_target_day: false,
    isShareing: false,
    //image 
    images_width: [],
    // comment 
    comment_input: {
      display: 'none',
      focus: false,
      value: "",
      placeholder: "评论"
    },
    comments: {},
    comment_users: {}
  },
  pageStatus: "onLoad",
  images_width: [],
  comment_input: {
    display: 'none',
    focus: false,
    value: "",
    placeholder: "评论"
  },
  _comment: {
    feed_id: 0,
    reply_id: 0,
    reply_user_id: 0,
    msg: '',
    status: 0
  },
  comments: {},
  comment_users: {},

  onLoad: function (options) {
    this.pageStatus = "onLoad"
    // 页面初始化 options为页面跳转所带来的参数
    //调用应用实例的方法获取全局数据
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: ((res.windowWidth - 30) / 2 - sliderWidth) / 2,
          sliderOffset: 0,
          scrollHeight: res.windowHeight + 'px',
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        })
      }
    })

    var group_id = options.group_id
    //todo
    //group_id = 11988
    //group_id = 13486
    //group_id = 12912
    //group_id = 14008

    //group_id = 17573

    var share = options.share
    var from = options.from

    that.setData({
      group_id: group_id,
      isShowTitle: from == "share" ? true : false
    })

    app.getUserInfo(function (userInfo, setting) {

      that.setData({
        userInfo: userInfo
      })
      that.getGroup()

      that.getGroupFeeds()

      var daka = options.daka
      if (daka == 1) {
        that.shareDakaGroup(options.target)
      }

      if (from == "create") {
        that.showCreateGroupTip()
      }
    })

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    console.log("onShow", this.pageStatus);
    if (this.pageStatus == "onHide") {
      var that = this
      wegrouplib.getLoalGroupStatus(that.data.group_id, function (status) {
        console.log(status);
        //feed
        if (status == "daka" || status == "redaka") {

          that.setData({
            isFeedFristRequest: true
          })
          that.getGroup()
          that.getGroupFeeds()
        } else if (status == "edit" || status == "image") {
          that.getGroup()
        } else if (status == "join") {
          //that.getGroup()
        }

      })
    }
  },
  onHide: function () {
    // 页面隐藏
    this.pageStatus = "onHide"
  },
  onUnload: function () {
    // 页面关闭
  },
  onShareAppMessage: function () {

    this.setData({
      isShareing: true
    })
    var that = this
    var group = this.data.group 

    var d = new Date()
    if (this.data.target) {
      return {
        title: '今日我已打卡' + group.target_name + '#' + this.data.target + '#,你呢？',
        path: '/pages/habit/group/view?from=share&group_id=' + this.data.group_id + '&timestamp=' + d.getTime(),
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        },
        complete: function (res) {
          that.setData({
            isShareing: false
          })
        }
      }
    } else {
      return {
        //title: '一起来打卡 ' + this.data.group.name,
        title: '我在' + group.name + '已坚持' + group.counter + '次, 邀请你来打卡?', //#' + group.target_name + '#
        path: '/pages/habit/group/view?from=share&group_id=' + this.data.group_id + '&timestamp=' + d.getTime(),
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        },
        complete: function (res) {
          that.setData({
            isShareing: false
          })
        }
        //imageUrl: this.data.feeds[0]["images"][0]['url']
      }
    }
  },
  bindImageLoad: function (e) {
    var idx = e.target.dataset.image_id

    if (e.detail.height > e.detail.width) {

      var width = parseInt(200 * e.detail.width / e.detail.height) + 1
      this.images_width[idx] = width
      console.log(this.images_width)
      this.setData({
        images_width: this.images_width
      })
    } else {
      var width = parseInt(200 * e.detail.width / e.detail.height) + 1

      if (width < (this.data.windowWidth - 60)) {
        this.images_width[idx] = width
        this.setData({
          images_width: this.images_width
        })
      }
    }

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
  checkinGroupTap: function (event) {
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/checkin?from=group&group_id=' + group_id
    })
  },

  viewDetailGroupTap: function (e) {
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/detail?from=group&group_id=' + group_id
    })

  },

  viewShareGroupTap: function (e) {
    var group_id = this.data.group_id
    wx.navigateTo({
      url: '../group/share?from=group&group_id=' + group_id + '&daka_counter=' + this.data.group.counter
    })

  },

  viewGroupCalendarTap: function (e) {
    var group_id = this.data.group_id

    wegrouplib.saveLocalGroupCalendar(this.data.userInfo)
    wx.navigateTo({
      url: '../group/calendar?from=group&group_id=' + group_id + "&user_id=" + this.data.user_id + '&nickname=' + this.data.userInfo.nickname+'&group_name='+this.data.group.name
    })
  },

  viewRankGroupTap: function (e) {
    var group_id = this.data.group_id

    wegrouplib.saveLocalGroupCalendar(this.data.userInfo)
    wx.navigateTo({
      url: '../group/calendar?from=group&index=rank&group_id=' + group_id + "&user_id=" + this.data.user_id + '&nickname=' + this.data.userInfo.nickname + '&group_name=' + this.data.group.name
    })
  },
  viewUserCalendarTap: function (e) {
    var group_id = this.data.group_id
    var user_id = e.currentTarget.dataset.user_id
    var feed_index_id = e.currentTarget.dataset.feed_index_id;

    var nickname = this.data.feeds[feed_index_id].user.nickname

    wegrouplib.saveLocalGroupCalendar(this.data.feeds[feed_index_id].user)
    wx.navigateTo({
      url: '../group/calendar?from=group&group_id=' + group_id + '&user_id=' + user_id + '&nickname=' + nickname + '&group_name=' + this.data.group.name
    })
  },

  joinGroupTap: function (e) {
    var group_id = this.data.group_id
    this.joinGroupCloud(group_id)
  },

  likeFeedTap: function (e) {
    console.log("like", e)
    var feed_id = e.currentTarget.dataset.feed_id;
    var feed_index_id = e.currentTarget.dataset.feed_index_id;
    var feeds = this.data.feeds;

    if (feeds[feed_index_id].is_like) {

      var likes = feeds[feed_index_id].likes ? feeds[feed_index_id].likes : [];

      var _likes = []
      for (var i = 0; i < likes.length; i++) {
        if (likes[i]["user_id"] != this.data.userInfo.id) {
          _likes.push(likes[i])
        }
      }
      feeds[feed_index_id].likes = _likes;
      feeds[feed_index_id].likenum--;
      feeds[feed_index_id].is_like = false;

      console.log(feeds[feed_index_id])
      this.setData({
        feeds: feeds
      })

      var params = {
        feed_id: feed_id,
        group_id: this.data.group_id
      }
      wefeedlib.unlikeFeed(params, function (code, msg, data) {

      })
    } else {

      var likes = feeds[feed_index_id].likes ? feeds[feed_index_id].likes : [];

      likes = likes.concat([{
        user_id: this.data.userInfo.id,
        avatar_url: this.data.userInfo.avatar_url
      }])

      console.log(likes);

      feeds[feed_index_id].likes = likes;
      feeds[feed_index_id].likenum++;
      feeds[feed_index_id].is_like = true;

      console.log(feeds[feed_index_id])
      this.setData({
        feeds: feeds
      })

      var params = {
        feed_id: feed_id,
        group_id: this.data.group_id
      }
      wefeedlib.likeFeed(params, function (code, msg, data) {

      })
    }
  },

  setCommentInput: function (display, focus, value, placeholder) {
    this.comment_input.display = display
    this.comment_input.focus = focus
    this.comment_input.value = value
    this.comment_input.placeholder = placeholder
  },
  commentFeedTap: function (e) {
    console.log(e)
    var that = this

    var feed_id = e.currentTarget.dataset.feed_id;

    var value = that._comment.feed_id == feed_id && that._comment.status == 1 ? that._comment.msg : ''
    this.setCommentInput('', true, value, '评论')
    this.setData({
      comment_input: this.comment_input,
      toView: "comment-id-" + feed_id
    })

    this._comment = {
      status: 1,
      feed_id: feed_id,
      msg: that._comment.feed_id == feed_id ? that._comment.msg : '',
      reply_id: 0,
      reply_user_id: 0
    }
  },
  bindReplyCommentTap: function (e) {
    var feed_id = e.currentTarget.dataset.feed_id;
    var comment_id = e.currentTarget.dataset.comment_id;
    var comment_user_id = e.currentTarget.dataset.comment_user_id;

    if (comment_user_id != this.data.userInfo["id"]) {
      var placeholder = "回复" + this.comment_users[comment_user_id]["nickname"] + ":"
      this.setCommentInput('', true, '', placeholder)
      this.setData({
        comment_input: this.comment_input
      })
      this._comment = {
        status: 2,
        feed_id: feed_id,
        msg: '',
        reply_id: comment_id,
        reply_user_id: comment_user_id,
      }
    }
    else {
      var that = this
      wx.showActionSheet({
        itemList: ['删除'],
        success: function (res) {
          console.log(res, res.tapIndex)

          if (res.tapIndex == 0) {
            var params = {
              feed_id: feed_id,
              comment_id: comment_id,
              group_id: that.data.group_id
            }
            var comments = [];
            for (var i in that.comments[feed_id]) {
              if (that.comments[feed_id][i]["id"] != comment_id) {
                comments.push(that.comments[feed_id][i])
              }
            }
            that.comments[feed_id] = comments
            that.setData({
              comments: that.comments
            })
            wefeedlib.deleteComment(params, function (code, msg, data) {

            })

          }
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })
    }
  },
  bindCommentFocus: function (e) {
    console.log(e)
  },
  bindCommentChange: function (e) {
    console.log(e)

    this._comment.msg = e.detail.value
  },
  bindCommentConfirm: function (e) {
    console.log("bindCommentConfirm", e)

    var msg = e.detail.value
    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    if (msg == "" || re.test(msg)) {
      this.setCommentInput('none', false, this.comment_input.value, this.comment_input.placeholder)
      this.setData({
        comment_input: this.comment_input
      })
      return;
    }

    this._comment.msg = e.detail.value
    this.sendComment()
  },

  bindCommentBlur: function (e) {
    console.log("bindCommentBlur", e)

    this.setCommentInput('none', false, this.comment_input.value, this.comment_input.placeholder)
    this.setData({
      comment_input: this.comment_input
    })
  },
  sendCommentMessageTap: function (e) {
    console.log("sendCommentMessageTap", e)
    this.sendComment()
  },

  sendComment: function () {
    var comment = {
      msg: this._comment.msg,
      user_id: this.data.userInfo["id"],
      reply_id: this._comment.reply_id,
      reply_user_id: this._comment.reply_user_id
    }
    var comment_feed_id = this._comment.feed_id

    if (this.comments[comment_feed_id]) {
      this.comments[comment_feed_id].push(comment)
    } else {
      this.comments[comment_feed_id] = [comment]
    }

    console.log(comment, comment_feed_id)

    var params = {
      group_id: this.data.group_id,
      feed_id: this._comment.feed_id,
      msg: this._comment.msg,
      reply_id: this._comment.reply_id,
      reply_user_id: this._comment.reply_user_id
    }
    wefeedlib.replyComment(params, function (code, msg, data) {
      console.log(code, msg, data)
      if (code == 0) {

      }
    })
    this.setCommentInput('none', false, '', '')

    this.setData({
      comment_input: this.comment_input,
      comments: this.comments,
    })
    this._comment = {
      status: 0,
      feed_id: 0,
      msg: '',
      reply_id: 0,
      reply_user_id: 0
    }
  },
  moreFeedTap: function (e) {
    var feed_id = e.currentTarget.dataset.feed_id;
    var feed_index_id = e.currentTarget.dataset.feed_index_id;
    var show_delete = e.currentTarget.dataset.show_delete
    var show_edit = e.currentTarget.dataset.show_edit

    var itemList = []

    if (show_edit == 1) {
      itemList.push('编辑')
    }
    if (show_delete == 1) {
      itemList.push('删除')
    }

    var that = this
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        console.log(res, res.tapIndex)

        if (res.tapIndex >= 0 && itemList[res.tapIndex] == '删除') {
          that.deleteFeed(feed_id)
        } else if (res.tapIndex >= 0 && itemList[res.tapIndex] == '编辑') {
          that.editFeed(feed_id, feed_index_id)
        } 
        //else if (res.tapIndex == 0) {
        //  that.viewShareFeed(feed_id, feed_index_id)
        //}
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  shareFeedTap:function(e){
    var feed_id = e.currentTarget.dataset.feed_id;
    var feed_index_id = e.currentTarget.dataset.feed_index_id;

    this.viewShareFeed(feed_id, feed_index_id)
  },
  viewShareFeed: function (feed_id, feed_index_id) {
    var that = this
    console.log(that.data.feeds[feed_index_id]);
    var feed = that.data.feeds[feed_index_id];

    var target_name = that.data.group.targets[feed.target_id] ? this.data.group.targets[feed.target_id]["name"] : feed.target_name
    util.showLoading('加载中')
    wefeedlib.saveLocalFeedSync(feed)
    wx.navigateTo({
      url: '../group/task?from=group&feed_id=' + feed_id + '&group_id=' + that.data.group_id + '&group_name=' + that.data.group["name"] + '&target_name=' + target_name + '&target_day=' + feed["user"]["counter"]
    })
    util.hideLoading()
  },

  editFeed: function (feed_id, feed_index_id) {
    console.log(feed_id)

    var that = this
    console.log(that.data.feeds[feed_index_id]);
    var feed = that.data.feeds[feed_index_id];
    util.showLoading('加载中')

    var target_name = that.data.group.targets[feed.target_id] ? this.data.group.targets[feed.target_id]["name"] : feed.target_name


    wefeedlib.saveLocalFeedSync(feed)
    wx.navigateTo({
      url: '../group/recheckin?from=group&feed_id=' + feed_id + '&group_id=' + that.data.group_id + '&group_name=' + that.data.group["name"] + '&target_name=' + target_name + '&target_day=' + feed["user"]["counter"]
    })
    util.hideLoading()
  },

  deleteFeed: function (feed_id) {
    var params = {
      feed_id: feed_id,
      group_id: this.data.group_id
    }
    var that = this
    wefeedlib.deleteFeed(params, function (code, msg, data) {
      if (code == 0) {

        util.showSuccess("删除成功")
        that.setData({
          isFeedFristRequest: true
        })
        that.getGroup()
        that.getGroupFeeds()
      } else {
        util.showModel("删除失败", msg)
      }
    })
  },

  shareDakaGroup: function (target) {

    var that = this
    that.setData({
      target: target,
      info: {
        show: true,
        msg: "打卡成功,点击右上角...分享给好友"
      }
    })
    setTimeout(function () {
      that.setData({
        target: target,
        info: {
          show: false,
          msg: ""
        }
      })
    }, 3000)
  },

  showCreateGroupTip: function () {
    var that = this
    var title = "创建成功"
    var content = "邀请小伙伴一起来打卡, 点击右上角...选择分享发送给好友 点击小圈子可进入管理页面"
    wx.showModal({
      title,
      content: content,
      showCancel: false,
      success: function (res) {
      }
    })
  },
  joinGroup: function () {
    var that = this
    var title = '确认加入'
    var content = '加入' + that.data.group.name + ',一起来坚持'// + that.data.group.target_name
    wx.showModal({
      title,
      content: content,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          that.joinGroupCloud(that.data.group_id)
        }
      }
    })
  },

  joinGroupCloud: function (group_id) {
    var that = this
    wegrouplib.joinGroup(group_id, function (code, msg, data) {
      if (code == 0) {
        util.showSuccess("加入成功")
        that.setData({ is_join: true })
        that.getGroup()
      } else {
        util.showModel("操作失败", msg)
      }
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeTabIndex: e.currentTarget.id
    })
  },

  feedClick: function (e) {
    if (this.data.isFeedPullDownLoading) {
      return;
    }

    this.setData({
      activeFeedIndex: e.currentTarget.id,
      isFeedFristRequest: true,
      feeds: [],
      isFeedPullDownLoading: true
    })
    this.getGroupFeeds()

  },
  onPullDownFeedsRefresh: function () {
    console.log('onPullDownGroupsRefresh')

    if (!this.data.isFeedNeedLoad || this.data.isFeedPullDownLoading) {
      return
    }
    this.setData({ isFeedPullDownLoading: true })
    var that = this
    // from http
    this.getGroupFeeds()
  },
  getGroup: function () {
    var that = this
    var group_id = this.data.group_id
    // from cache
    var group = wegrouplib.getLocalGroup(group_id)
    var percent = group.target_day > 0 ? (group.counter * 100) / group.target_day : 0
    percent = percent > 100 ? 100 : percent
    if (group) {
      this.setData({
        group: group,
        percent: percent
      })
      _next.call(that);

      wx.setNavigationBarTitle({
        title: group.name + '·小圈子'
      })
    }

    wegrouplib.getClientGroup(group_id, function (code, msg, data) {
      console.log(code, msg, data)
      if (code == 0) {
        var percent = data.group.target_day > 0 ? (data.group.counter * 100) / data.group.target_day : 0
        percent = percent > 100 ? 100 : percent
        that.setData({
          group: data.group,
          user_id: data.user_id,
          is_join: data.is_join,
          percent: percent
        })

        _next.call(that);

        if (data.group) {
          wx.setNavigationBarTitle({
            title: data.group.name + '·小圈子'
          })
        }

        if (data.group.allow_join == 1 && !data.is_join) {
          that.joinGroup()
        }
      } else if (code == -1 && that.data.retryNum < 3) {
        console.log(code,msg)
        /*
        app.clearUserSession();
        that.setData({
          retryNum: that.data.retryNum++
        })
        app.getUser(function (userInfo, setting) {
          that.getGroup()
          that.getGroupFeeds()
        })
        */
      }
    })
  },


  getGroupFeeds: function () {
    var that = this
    var group_id = this.data.group_id
    var feed_num = that.data.isFeedFristRequest ? 0 : this.data.feeds.length

    var feed_id = 0
    if (feed_num > 0) {
      feed_id = this.data.feeds[feed_num - 1]["id"]
    }

    var type = this.data.activeFeedIndex == "feed_all" ? 'all' : 'today';
    var params = {
      offset: feed_num,
      feed_id: feed_id,
      type: type
    }
    wegrouplib.getClientGroupFeed(group_id, params, function (code, msg, data) {
      if (code == 0) {

        var isNeedLoad = data.is_needload
        var isFeedFristRequest = that.data.isFeedFristRequest
        if (data.feeds.length > 0) {
          that.getComments(data.feeds)

          var feeds = (isFeedFristRequest) ? data.feeds : that.data.feeds.concat(data.feeds)

          var users
          if (isFeedFristRequest) {
            users = data.users
            users[that.data.userInfo.id] = that.data.userInfo;
          } else {
            users = that.data.users
            for (var i in data.users) {
              users[i] = data.users[i];
            }
          }
          that.setData({
            feeds: feeds,
            users: users,
            isFeedPullDownLoading: false,
            isFeedNeedLoad: isNeedLoad,
            isFeedFristRequest: false
          })
        } else {
          // 没有数据了
          if (isFeedFristRequest) {
            that.setData({
              feeds: []
            })
          }
          that.setData({
            isFeedPullDownLoading: false,
            isFeedNeedLoad: isNeedLoad,
            isFeedFristRequest: false
          })
        }

        if (isFeedFristRequest && isNeedLoad == false) {
          that.setData({
            scrollHeight: 'auto',
          })
        }
        if (isFeedFristRequest && isNeedLoad) {
          that.setData({
            scrollHeight: that.data.windowHeight + 'px',
          })
        }
      } else if (code > 0) {
        that.setData({
          isFeedPullDownLoading: false,
          isFeedNeedLoad: false
        })
      }
    })
  },

  getComments: function (feeds, needRetry) {
    var feed_ids = [];
    var that = this
    console.log(feeds)
    for (var i in feeds) {
      if(feeds[i].id){
        feed_ids.push(feeds[i]["id"])
      }
    }

    var params = {
      group_id: this.data.group_id,
      feed_ids: feed_ids.join(",")
    }
    console.log("getComments",params)
    wefeedlib.getComments(params, function (code, msg, data) {
      console.log(code,msg,data)
      if (code == 0) {
        for (var idx in data.comments) {
          that.comments[idx] = data.comments[idx]
        }

        for (var uidx in data.users) {
          that.comment_users[uidx] = data.users[uidx]
        }

        that.setData({
          comments: that.comments,
          comment_users: that.comment_users
        })
      } else {
        if (!needRetry) {
          that.getComments(feeds, true)
        }
      }
    })
  },
})