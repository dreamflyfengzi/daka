/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

var host = "57251387.dreamflyhaizei.com"
var app = "wedaka"


var FILE_REGION = 'tj';
var FILE_APPID = '1253272913';
var FILE_BUCKET_NAME = 'wedaka';

var config = {
  service: {
    // 下面的地址配合云端 Server 工作
    host,

    // 登录地址，用于建立会话
    loginUrl: `https://${host}/${app}/login`,

    //user
    userUrl: `https://${host}/${app}/user`,

    homeUrl: `https://${host}/${app}/home/`,

    groupUrl: `https://${host}/${app}/group/`,

    //profile
    profileUrl: `https://${host}/${app}/profile/`,

    //Feed
    feedUrl: `https://${host}/${app}/feed/`,

    //Target
    targetUrl: `https://${host}/${app}/target/`,

    //zaoqi
    zaoqiUrl: `https://${host}/${app}/zaoqi/`,

    settingUrl: `https://${host}/${app}/setting/`,

    // cos 上传
    cosUploadUrl: `https://${FILE_REGION}.file.myqcloud.com/files/v2/${FILE_APPID}/${FILE_BUCKET_NAME}`,

    // 填写自己的鉴权服务器地址
    cosSignUrl: `https://${host}/${app}/cosauth`,

    // 短信url
    smsUrl: `https://${host}/${app}/sms/`,

    payUrl: `https://${host}/${app}/wxpay/`


  }
};

module.exports = config
