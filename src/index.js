/**
 * blear.node.qiniu
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */


'use strict';

var crypto = require('crypto');
var object = require('blear.utils.object');
var random = require('blear.utils.random');
var url = require('blear.utils.url');
var access = require('blear.utils.access');
var path = require('blear.node.path');

var defaults = {
    /**
     * @type String
     * @desc 访问令牌
     */
    accessKey: '',

    /**
     * @type String
     * @desc 访问密钥
     */
    secretKey: '',

    /**
     * @type String
     * @desc 访问仓库
     */
    bucket: '',

    /**
     * @type String
     * @desc 绑定域名
     */
    host: '/',

    /**
     * @type String
     * @desc 访问目录
     */
    dirname: '/',

    /**
     * @type String
     * @desc 上传文件
     */
    filename: null,

    /**
     * @type Number
     * @desc 签名有效期，单位毫秒
     */
    expires: 10 * 60 * 1000,

    /**
     * @type String
     * @desc MIME 限制
     */
    mimeLimit: 'image/*',

    /**
     * @type Boolean
     * @desc 是否绝对路径
     * 是：转换后的 url 包含 @ 符号，即 http://qiniu.cdn.com/@/path/to/file.png，
     * 或者两个斜杆表示 http://qiniu.cdn.com//path/to/file.png
     * 否：转换后的 url 不含 @ 符号，即 http://qiniu.cdn.com/path/to/file.png
     */
    absolutely: false
};
var slashStartRE = /^\//;

exports.defaults = defaults;

/**
 * 覆盖默认配置
 */
exports.config = function () {
    return access.getSet({
        get: function (key) {
            return configs[key];
        },
        set: function (key, val) {
            configs[key] = val;
            afterConfigSet();
        },
        setLength: 2
    }, arguments);
};

/**
 * 生成上传 key 和上传凭证
 * @param [configs] {Object} 配置
 * @param [configs.host="/"] {String} 域
 * @param [configs.bucket=""] {String} 仓库
 * @param [configs.accessKey=""] {String} access_key
 * @param [configs.secretKey=""] {String} secret_key
 * @param [configs.dirname="/"] {String} 上传目录
 * @param [configs.filename] {String} 上传文件名，否则随机生成
 * @param [configs.expires] {Number} 凭证有效期，默认 10 分钟，单位毫秒
 * @param [configs.mimeLimit="image/*"] {String} 上传文件限制类型
 * @param [configs.absolutely] {Boolean} 是否绝对路径
 * @returns {{key: String, token: String}}
 */
exports.signature = function (configs) {
    configs = object.assign({}, defaults, configs);

    // if (configs.dirname && configs.dirname.length > 1) {
    //     configs.dirname = endRE.test(configs.dirname) ? configs.dirname : configs.dirname + '/';
    // } else {
    //     configs.dirname = '';
    // }
    //
    // if (configs.host.slice(-1) === '/') {
    //     configs.host = configs.host.slice(0, -1);
    // }

    var key = path.join(configs.dirname, (configs.filename || random.guid()));
    var qiniuURL = configs.host || configs.origin;

    if (configs.absolutely) {
        qiniuURL= url.join(qiniuURL, '@');
    }else{
        key = key.replace(slashStartRE, '');
    }

    qiniuURL = url.join(qiniuURL, key);

    var encoded = urlsafeBase64Encode(JSON.stringify({
        scope: configs.bucket + ':' + key,
        // 有效期
        deadline: Math.floor((configs.expires + Date.now()) / 1000),
        mimeLimit: configs.mimeLimit
    }));
    var encoded_signed = base64ToUrlSafe(hmacSha1(encoded, configs.secretKey));

    return {
        key: key,
        token: configs.accessKey + ':' + encoded_signed + ':' + encoded,
        url: qiniuURL
    };
};


function urlsafeBase64Encode(jsonFlags) {
    var encoded = new Buffer(jsonFlags).toString('base64');
    return base64ToUrlSafe(encoded);
}

function base64ToUrlSafe(v) {
    return v.replace(/\//g, '_').replace(/\+/g, '-');
}

function hmacSha1(encodedFlags, secretKey) {
    var hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(encodedFlags);
    return hmac.digest('base64');
}


