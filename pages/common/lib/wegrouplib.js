/***
 * @class
 * 处理group缓存相关
 */
var weconstants = require('./weconstants');
var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');
var config = require('../../../config');


var _request = function (type, data, cb) {
    qcloud.request({
        url: config.service.groupUrl + type,
        login: true,
        method: "POST",
        data: data,
        header: { 'content-type': 'application/json' },
        success: (response) => {
            var res = response.data;
            if ((typeof res.code) != 'undefined') {
                if (res.code == 0 &&
                  (type == "daka" || type == "redaka" || type == "edit" || type == "join" || type == "image")) {
                    saveLocalGroupStatus(data.group_id, type)
                }else if(res.code == 0 && type == "detail" && res.data.group){
                  saveLocalGroup(res.data.group)
                }
                typeof cb == "function" && cb(res.code, res.message, res.data);
            } else {
                typeof cb == "function" && cb(-1, weconstants.WE_DAKA_ERROR_SERVICE, null);
            }
        },
        fail: (error) => {
            typeof cb == "function" && cb(-2, weconstants.WE_DAKA_ERROR_NETWORK, error);
        }
    });
}

// create 
// 发布作业 
var createGroup = function (params, cb) {
    _request("create", params, cb)
}

// get Lists 
var getClientGroups = function (params, cb) {
    _request("lists", params, cb)
}

// share 
var shareGroup = function (params, cb) {
    _request("share", params, cb)
}

// get Group Detail 
var getClientGroup = function (group_id, cb) {

    var params = {
        group_id: group_id
    }
    _request("detail", params, cb)
}

// get Group Rank
var getClientGroupRank = function (group_id, cb) {
    var params = {
        group_id: group_id
    }
    _request("rank", params, cb)
}

// get Group Feed 
var getClientGroupFeed = function (group_id, params, cb) {
    params.group_id = group_id
    _request("feed", params, cb)
}

// get Group Member
var getClientGroupMember = function (group_id, cb) {
    var params = {
        group_id: group_id
    }
    _request("member", params, cb)
}

var getClientGroupHistory = function (params, cb) {
    _request("history", params, cb)
}

// getTask group
var getTask = function (params, cb) {
  _request("task", params, cb)
}

// join group
var joinGroup = function (group_id, cb) {
    var params = {
        group_id: group_id
    }
    _request("join", params, cb)
}

// edit 
var editGroup = function (params, cb) {
    _request("edit", params, cb)
}

var imageGroup = function (params, cb) {
    _request("image", params, cb)
}

var qrcodeGroup = function (params, cb) {
    _request("qrcode", params, cb)
}

// remind 
var remindGroup = function (params, cb) {
  _request("remind", params, cb)
}

// quit 
var quitGroup = function (group_id, user_id, cb) {
    var params = {
        group_id: group_id,
        user_id: user_id
    }
    _request("quit", params, cb)
}


// dakaGroup
var dakaGroup = function (params, cb) {
    _request("daka", params, cb)
}

// dakaGroup
var redakaGroup = function (params, cb) {
  _request("redaka", params, cb)
}

var exportGroup = function (params, cb) {
  _request("export", params, cb)
}

var saveLocalGroups = function (groups) {
  try{
    wx.setStorage({
        key: weconstants.WE_DAKA_KEY_GROUPS,
        data: groups
    });
  }catch(e){

  }
};

var saveLocalGroup = function (group) {
    var groups = getLocalGroups();
    if (!(groups && typeof groups === 'object' && Array == groups.constructor)) {
        groups = [];
    }

    var isExistFlag = false;
    if (groups) {
        for (var i in groups) {
            if (groups[i]["id"] == group["id"]) {
                groups[i] = group;
                isExistFlag = true;
                break;
            }
        }
    }

    if (!isExistFlag) {
        groups.push(group);
    }

    saveLocalGroups(groups);
};

var deleteLocalGroup = function (group_id) {
    var groups = getLocalGroups();

    var _groups = [];
    if (groups) {
        for (var j in groups) {
            if (groups[j]["id"] != group_id) {
                _groups.push(groups[j]);
            }
        }
    }
    saveLocalGroups(_groups);
};

var getLocalGroups = function () {
    var groups = []
    try {
        groups = wx.getStorageSync(weconstants.WE_DAKA_KEY_GROUPS)
    } catch (e) {
    }
    return groups;
}

var getLocalGroup = function (group_id) {
    try {
        var groups = getLocalGroups()
        if (groups && groups.length > 0) {
            for (var i in groups) {
                if (groups[i]["id"] == group_id) {
                    return groups[i];
                }
            }
        }
    } catch (e) {
    }
    return false;
}

var saveLocalGroupStatus = function (group_id, status) {
    var data = {
        status: status,
        group_id: group_id
    }
    wx.setStorage({
        key: weconstants.WE_DAKA_KEY_GROUP_STATUS,
        data: data
    });
};

var getLoalGroupStatus = function (group_id, cb) {
    wx.getStorage({
        key: weconstants.WE_DAKA_KEY_GROUP_STATUS,
        success: function (res) {
          if (res.data && res.data.status && res.data.group_id == group_id) {
                cb(res.data.status);
            }

            wx.removeStorage({
                key: weconstants.WE_DAKA_KEY_GROUP_STATUS,
            })
        }
    })
}

var saveLocalGroupCalendar = function (user) {
    try {
        wx.setStorageSync(weconstants.WE_DAKA_KEY_GROUP_CALENDAR, user)
    } catch (e) {
    }
}

var getLocalGroupCalendar = function () {
    var user = {}
    try {
        var value = wx.getStorageSync(weconstants.WE_DAKA_KEY_GROUP_CALENDAR)
        if (value) {
            user = value
        }
    } catch (e) {
        // Do something when catch error
    }
    return user

}


var saveLocalStyle = function (style) {
  try {
    wx.setStorage({
      key: weconstants.WE_DAKA_KEY_STYLE,
      data: style
    });
  } catch (e) {

  }
}

var getLocalStyle = function(){
  var style = 'card'
  try {
    style = wx.getStorageSync(weconstants.WE_DAKA_KEY_STYLE)
  } catch (e) {
  }
  return style;
}



module.exports = {
    saveLocalGroups: saveLocalGroups,
    saveLocalGroup: saveLocalGroup,
    deleteLocalGroup: deleteLocalGroup,
    getLocalGroups: getLocalGroups,
    getLocalGroup: getLocalGroup,
    getLoalGroupStatus: getLoalGroupStatus,

    getClientGroups: getClientGroups,
    getClientGroup: getClientGroup,
    getClientGroupRank: getClientGroupRank,
    getClientGroupFeed: getClientGroupFeed,
    getClientGroupMember: getClientGroupMember,
    getClientGroupHistory: getClientGroupHistory,
    getTask: getTask,

    createGroup: createGroup,
    editGroup: editGroup,
    joinGroup: joinGroup,
    quitGroup: quitGroup,
    dakaGroup: dakaGroup,
    redakaGroup: redakaGroup,
    imageGroup: imageGroup,
    qrcodeGroup: qrcodeGroup,
    shareGroup:shareGroup,
    remindGroup: remindGroup,

    saveLocalGroupCalendar: saveLocalGroupCalendar,
    getLocalGroupCalendar: getLocalGroupCalendar,
    saveLocalGroupStatus: saveLocalGroupStatus,

    saveLocalStyle: saveLocalStyle,
    getLocalStyle: getLocalStyle,

    exportGroup:exportGroup

};