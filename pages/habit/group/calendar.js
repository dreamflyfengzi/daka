//morningf@foxmail.com

var ccFile = require('../../../utils/calendar-converter.js')
var wegrouplib = require('../../common/lib/wegrouplib')
var weuserlib = require('../../common/lib/weuserlib')
var wefeedlib = require('../../common/lib/wefeedlib')
var util = require('../../../utils/util')

var calendarConverter = new ccFile.CalendarConverter()

var sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置

//月份天数表
var DAY_OF_MONTH = [
  [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
]

//判断当前年是否闰年
var isLeapYear = function (year) {
  if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0))
    return 1
  else
    return 0
}

//获取当月有多少天
var getDayCount = function (year, month) {
  return DAY_OF_MONTH[isLeapYear(year)][month]
}

//获取当前索引下是几号
var getDay = function (index) {
  return index - curDayOffset
}

var pageData = {
  date: "",                //当前日期字符串

  dateKey: "",

  row: "123456",
  //arr数据是与索引对应的数据信息
  arrIsShow: [],          //是否显示此日期
  arrDays: [],            //关于几号的信息
  arrInfoEx: [],          //农历节假日等扩展信息

  //选择一天时显示的信息
  detailData: {
    curDay: "",         //detail中显示的日信息
    curInfo1: "",
    curInfo2: "",
  }
}

//设置当前详细信息的索引，前台的详细信息会被更新
var setCurDetailIndex = function (index) {
  var curEx = pageData.arrInfoEx[index]
  curDay = curEx.sDay - 1
  pageData.detailData.curDay = curEx.sDay
  pageData.detailData.curInfo1 = "农历" + curEx.lunarMonth + "月" + curEx.lunarDay
  pageData.detailData.curInfo2 = curEx.cYear + curEx.lunarYear + "年 " + curEx.cMonth + "月 " + curEx.cDay + "日 " + curEx.lunarFestival
}

//刷新全部数据
var refreshPageData = function (year, month, day) {
  pageData.date = year + '年' + (month + 1) + '月'
  pageData.dateKey = year + '-' + (month + 1)
  var offset = new Date(year, month, 1).getDay()

  for (var i = 0; i < 42; ++i) {
    pageData.arrIsShow[i] = i < offset || i >= getDayCount(year, month) + offset ? false : true
    pageData.arrDays[i] = i - offset + 1
    var d = new Date(year, month, i - offset + 1)
    var dEx = calendarConverter.solar2lunar(d)
    pageData.arrInfoEx[i] = dEx
  }

  if (pageData.arrIsShow[35] == false) {
    pageData.row = "12345"
  } else {
    pageData.row = "123456"
  }

  setCurDetailIndex(offset + day)
}

var curDate = new Date()
var curMonth = curDate.getMonth()
var curYear = curDate.getFullYear()
var curDay = curDate.getDay()
refreshPageData(curYear, curMonth, curDay)

var app = getApp()
Page({
  data: {
    calendar: pageData,
    group_id: 0,
    user_id: 0,
    userInfo: {},
    group: null,
    join_day: -1,
    daka_counter: -1,
    member_counter: -1,
    tasks: null,
    activeTabIndex: 'group_calendar',
    activeRankIndex: 'weak_rank',
    sliderOffset: 0,
    sliderLeft: 0,
    feeds: [],
    ranks: [],
    scrollHeight: 0,
    isFeedFristRequest: true,
    isFeedPullDownLoading: true,
    isFeedNeedLoad: false,
    calendarLoading: false,


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
  pageStatus: "onLoad",

  onLoad: function (options) {
    this.pageStatus = "onLoad"

    var group_id = options.group_id
    var user_id = options.user_id
    var nickname = options.nickname
    var group_name = options.group_name

    var index = options.index

    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: ((res.windowWidth - 30) / 3 - sliderWidth) / 3,
          scrollHeight: res.windowHeight + 'px',
          windowWidth: res.windowWidth,
          activeTabIndex: index == "rank" ? "group_rank" : "group_calendar",
          sliderOffset: (index == "rank") ? 2 * (res.windowWidth - 30) / 3 : 0
        })
        console.log(2 * ((res.windowWidth - 30) / 3 - sliderWidth) / 3)

      }
    })
    //group_id = 10210
    //user_id = 0
    this.setData({
      group_id: group_id,
      user_id: user_id,
      userInfo: {
        id: user_id,
        nickname: nickname
      }
    })

    wx.setNavigationBarTitle({
      title: nickname + "·" + group_name
    })

    var that = this
    app.getUserInfo(function (userInfo, setting) {

      if (userInfo && userInfo.id && user_id == userInfo.id) {
        that.setData({
          userInfo: userInfo
        })
      } else {
        that.getUser()
      }

      that.getGroup()

      that.getGroupFeeds()

      that.getGroupRank()
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    if (this.pageStatus == "onHide") {
      this.getGroup()
      this.setData({
        isFeedFristRequest: true
      })
      this.getGroup()
      this.getGroupFeeds()
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
    var that = this
    var group = this.data.group

    var d = new Date()

    return {
      title: this.data.userInfo.nickname +'·' + this.data.group.name + '|一起来打卡 ' ,
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

  },

  onPullDownFeedsRefresh: function () {
    if (!this.data.isFeedNeedLoad || this.data.isFeedPullDownLoading) {
      return
    }
    this.setData({ isFeedPullDownLoading: true })
    console.log('onPullDownGroupsRefresh')
    var that = this
    // from http
    this.getGroupFeeds()
  },

  tabClick: function (e) {
    console.log(e.currentTarget.offsetLeft)
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeTabIndex: e.currentTarget.id
    })
  },
  rankClick: function (e) {
    this.setData({
      activeRankIndex: e.currentTarget.id
    })
  },
  viewUserCalendarRankTap: function (e) {
    console.log(e)
    var group_id = this.data.group_id
    var user_id = e.currentTarget.dataset.user_id
    var nickname = this.data.members[user_id].nickname
    var group_name = this.data.group.name

    wegrouplib.saveLocalGroupCalendar(this.data.members[user_id])
    wx.navigateTo({
      url: '../group/calendar?from=group&group_id=' + group_id + '&user_id=' + user_id + '&nickname=' + nickname + "&group_name=" + group_name
    })
  },
  showCheckinTap: function (e) {
    console.log("showCheckinTap", e)

    var datekey = e.currentTarget.dataset.datekey
    var day = e.currentTarget.dataset.day
    var redaka = e.currentTarget.dataset.redaka

    var tasks = this.data.tasks

    if (redaka != 1) {

      this.setData({
        is_show_daka: false,
        day_feeds: [],
        active_key: datekey + day
      })
      this.getGroupDayFeeds(datekey + "-" + day)
      console.log(1);
    } else {
      // 最近3天 补卡
      this.setData({
        is_show_daka: true,
        day_feeds: [],
        daka_day: datekey + "-" + day,
        active_key: datekey + day
      })
      this.getGroupDayFeeds(datekey + "-" + day)
    }

  },

  checkinTap: function (e) {
    if (this.data.is_show_daka) {
      var day_time = this.data.daka_day
      var group_id = this.data.group_id
      wx.navigateTo({
        url: '../group/checkin?from=group&group_id=' + group_id + "&day_time=" + day_time
      })
      this.setData({
        is_show_daka: false
      })
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
      comment_input: this.comment_input
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

    var itemList = ['分享']

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

        if (res.tapIndex > 0 && itemList[res.tapIndex] == '删除') {
          that.deleteFeed(feed_id)
        } else if (res.tapIndex > 0 && itemList[res.tapIndex] == '编辑') {
          that.editFeed(feed_id, feed_index_id)
        } else if (res.tapIndex == 0) {
          that.viewShareFeed(feed_id, feed_index_id)
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },

  viewShareFeed: function (feed_id, feed_index_id) {
    var that = this
    console.log(that.data.feeds[feed_index_id]);
    var feed = that.data.feeds[feed_index_id];
    util.showLoading('加载中')
    wefeedlib.saveLocalFeedSync(feed)
    wx.navigateTo({
      url: '../group/task?from=group&feed_id=' + feed_id + '&group_id=' + that.data.group_id + '&group_name=' + that.data.group["name"] + '&target_name=' + that.data.group["target_name"] + '&target_day=' + feed["user"]["counter"]
    })
    util.hideLoading()
  },

  editFeed: function (feed_id, feed_index_id) {
    console.log(feed_id)

    var that = this
    console.log(that.data.feeds[feed_index_id]);
    var feed = that.data.feeds[feed_index_id];
    util.showLoading('加载中')
    wefeedlib.saveLocalFeedSync(feed)
    wx.navigateTo({
      url: '../group/recheckin?from=group&feed_id=' + feed_id + '&group_id=' + that.data.group_id + '&group_name=' + that.data.group["name"] + '&target_name=' + that.data.group["target_name"] + '&target_day=' + feed["user"]["counter"]
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
  getUser: function () {
    var that = this
    var userInfo = wegrouplib.getLocalGroupCalendar()
    if (userInfo && userInfo.id && this.data.user_id == userInfo.id) {
      this.setData({
        userInfo: userInfo
      })
    } else {
      weuserlib.getClientUser(this.data.user_id, function (code, msg, data) {
        if (code == 0) {
          that.setData({
            userInfo: data.userInfo
          })
        }
      })
    }
  },
  getGroup: function (group_id) {
    var that = this

    var group_id = that.data.group_id

    // from cache
    var group = wegrouplib.getLocalGroup(group_id)
    console.log(that.data.userInfo)
    if (group) {
      that.setData({
        group: group,
      })
    } else {

      // from http
      wegrouplib.getClientGroup(group_id, function (code, msg, data) {
        if (code == 0) {
          that.setData({
            group: data.group
          })
        }
      })
    }

    var params = {
      group_id: group_id,
      user_id: that.data.user_id
    }
    wegrouplib.getClientGroupHistory(params, function (code, msg, data) {
      if (code == 0) {
        that.setData({
          join_day: data.join_day,
          daka_counter: data.daka_counter,
          member_counter: data.member_counter,
          tasks: data.tasks,
          untasks: data.untasks
        })
      }
    })

  },

  getGroupRank: function () {
    var that = this
    var group_id = this.data.group_id
    wegrouplib.getClientGroupRank(group_id, function (code, msg, data) {
      if (code == 0) {
        that.setData({
          members: data.members,
          ranks: data.ranks,
        })
      }
    })
  },
  getGroupDayFeeds: function (day_time) {
    var that = this
    var group_id = this.data.group_id

    var params = {
      offset: 0,
      feed_id: 0,
      user_id: that.data.user_id,
      day_time: day_time,
      type: "day"
    }
    wegrouplib.getClientGroupFeed(group_id, params, function (code, msg, data) {
      if (code == 0) {

        if (data.feeds.length > 0) {

          var feeds = data.feeds

          that.setData({
            day_feeds: feeds,
            images: []
          })
        }
      } else if (code > 0) {
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

    var params = {
      offset: feed_num,
      feed_id: feed_id,
      user_id: that.data.user_id
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
            images: [],
            isFeedPullDownLoading: false,
            isFeedNeedLoad: isNeedLoad,
            isFeedFristRequest: false
          })
        } else {
          // 没有数据了
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
      } else if (code > 0) {
        that.setData({
          isFeedPullDownLoading: false,
          isFeedNeedLoad: false
        })
      }
    })
  },
  getComments: function (feeds) {
    var feed_ids = [];
    var that = this

    for (var i in feeds) {
      if (feeds[i].id) {
        feed_ids.push(feeds[i]["id"])
      }
    }

    var params = {
      group_id: this.data.group_id,
      feed_ids: feed_ids.join(",")
    }

    wefeedlib.getComments(params, function (code, msg, data) {

      if (code == 0) {
        for (var idx in data.comments) {
          that.comments[idx] = data.comments[idx]
        }

        for (var idx in data.users) {
          that.comment_users[idx] = data.users[idx]
        }

        that.setData({
          comments: that.comments,
          comment_users: that.comment_users
        })
      }
    })
  },
  goToday: function (e) {
    curDate = new Date()
    curMonth = curDate.getMonth()
    curYear = curDate.getFullYear()
    curDay = curDate.getDay()
    refreshPageData(curYear, curMonth, curDay)
    this.setData({ calendar: pageData })
  },

  goLastMonth: function (e) {
    if (this.data.calendarLoading) {
      return
    }
    this.setData({ calendarLoading: true })
    if (0 == curMonth) {
      curMonth = 11
      --curYear
    }
    else {
      --curMonth
    }
    refreshPageData(curYear, curMonth, 0)
    this.setData({
      calendar: pageData,
      calendarLoading: false
    })
  },

  goNextMonth: function (e) {
    if (this.data.calendarLoading) {
      return
    }
    this.setData({ calendarLoading: true })
    if (11 == curMonth) {
      curMonth = 0
      ++curYear
    }
    else {
      ++curMonth
    }
    refreshPageData(curYear, curMonth, 0)
    this.setData({
      calendar: pageData,
      calendarLoading: false
    })
  },

  selectDay: function (e) {
    setCurDetailIndex(e.currentTarget.dataset.dayIndex)
    this.setData({
      detailData: pageData.detailData,
    })
  },

  bindDateChange: function (e) {
    var arr = e.detail.value.split("-")
    refreshPageData(+arr[0], arr[1] - 1, arr[2] - 1)
    this.setData({ calendar: pageData })
  }
})