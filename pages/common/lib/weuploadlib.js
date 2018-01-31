/**
 * 最终上传到cos的URL
 * 把以下字段配置成自己的cos相关信息，详情可看API文档 https://www.qcloud.com/document/product/436/6066
 * REGION: cos上传的地区
 * APPID: 账号的appid
 * BUCKET_NAME: cos bucket的名字
 * DIR_NAME: 上传的文件目录
 */
var config = require('../../../config');
var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');

/**
 * 上传方法
 * filePath: 上传的文件路径
 * fileName： 上传到cos后的文件名
 */
function uploadFile(type, prefixid, file, cb) {

    // 鉴权获取签名
    qcloud.request({
        url: config.service.cosSignUrl,
        login: true,
        method: "POST",
        data: { group_id: prefixid },
        header: { 'content-type': 'application/json' },
        success: (response) => {
            // 签名 cosRes.data
            _uploadFile(type, prefixid, response.data.data.cossign, file, cb)
        },
        fail: function (error) {
            cb(false, file, null)
        }
    })
}

/**
 * 上传方法
 * filePath: 上传的文件路径
 * fileName： 上传到cos后的文件名
 */
function uploadFiles(type, prefixid, cossign, files, cb) {


    for (var i in files) {
        _uploadFile(type, prefixid, cossign, files[i], cb);
    }
}
function _uploadFile(type, prefixid, cossign, file, cb) {
    // 头部带上签名，上传文件至COS
    var fileName = prefixid + "_" + file["fileName"];
    var filePath = file["filePath"];
    var fileType = file["type"];

    console.log(cossign, config.service.cosUploadUrl + '/' + type + "/" + fileType + "/" + fileName);
    wx.uploadFile({
        url: config.service.cosUploadUrl + '/' + type + "/" + fileType + "/" + fileName,
        filePath: filePath,
        header: {
            'Authorization': cossign
        },
        name: 'filecontent',
        formData: {
            op: 'upload'
        },
        success: function (uploadRes) {
            console.log("success", uploadRes);
            //console.log("uploadRes", file, _file);
            var data = uploadRes.data
            //console.log('uploadRes', cossign, uploadRes)
            //do something
            cb(true, file, data);
        },
        fail: function (e) {
            console.log("error", e);
            cb(false, file, null);
            //console.log(config.service.cosUploadUrl+ '/' + type + "/" + fileType +"/"+ fileName);
        }
    })

}

// 预加载 发布 
var getCosSign = function (class_id, cb) {

    var data = {
        class_id: class_id
    }
    qcloud.request({
        url: config.service.cosSignUrl,
        login: true,
        method: "POST",
        data: data,
        header: { 'content-type': 'application/json' },
        success: (response) => {
            var res = response.data;
            if ((typeof res.code) != 'undefined') {
                typeof cb == "function" && cb(res.code, res.message, res.data);
            } else {
                typeof cb == "function" && cb(-1, weconstants.WE_ZUOYE_ERROR_SERVICE, null);
            }
        },
        fail: (error) => {
            typeof cb == "function" && cb(-1, weconstants.WE_ZUOYE_ERROR_NETWORK, null);
        }
    })
}

module.exports = {
    getCosSign: getCosSign,
    uploadFile: uploadFile,
    uploadFiles: uploadFiles
}