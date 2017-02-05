/**
 * mocha 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var expect = require('chai-jasmine').expect;
var qiniu = require('../src/index.js');

describe('Static', function () {
    it('.defaults', function () {
        expect(qiniu.defaults).not.toBe(undefined);
    });

    it('.config', function () {
        qiniu.config({
            accessKey: '123',
            secretKey: '456',
            bucket: 'abc'
        });
        expect(qiniu.defaults.accessKey).toBe('123');
        expect(qiniu.defaults.secretKey).toBe('456');
        expect(qiniu.defaults.bucket).toBe('abc');
    });

    it('.signature', function () {
        var ret = qiniu.signature({
            filename: 'def'
        });

        console.log(ret);
        expect(ret.key).not.toBe(undefined);
        expect(ret.token).not.toBe(undefined);
        expect(ret.token).toMatch(/^123:/);
    });
});

