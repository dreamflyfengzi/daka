function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getWeakDay(){
  var d=new Date()
  var day = d.getDay()
  if(day==0)
  {
    day = 7;
  }
  return day;
}

// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000,
    mask:true
});

// 显示成功提示
var showSuccess = (text, cb) => wx.showToast({
    title: text,
    icon: 'success',
    mask:false,
    complete:typeof cb == "function" && cb()
});

var showLoading = (text)  => {
  if (wx.showLoading){
    wx.showLoading({
      title: text,
    })
  }else{
    wx.showToast({
      title: text,
    })
  }
}

var hideLoading = () => {
  if (wx.hideLoading) {
    wx.hideLoading()
  }else{
    wx.hideToast()
  }
}



// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: content,
        showCancel: false
    });
};

module.exports = {
  formatTime: formatTime,
  getWeakDay: getWeakDay,
  showBusy: showBusy,
  showSuccess:showSuccess,
  showModel:showModel,
  showLoading: showLoading,
  hideLoading: hideLoading
}


