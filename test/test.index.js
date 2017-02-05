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
            bucket: 'abc',
            host: 'http://qiniu.cdn.com/'
        });
        expect(qiniu.defaults.accessKey).toBe('123');
        expect(qiniu.defaults.secretKey).toBe('456');
        expect(qiniu.defaults.bucket).toBe('abc');
    });

    it('.signature', function () {
        var ret = qiniu.signature({
            dirname: '/a/b/c/d/',
            filename: '/x/y/z.png'
        });

        expect(ret.key).not.toBe(undefined);
        expect(ret.token).not.toBe(undefined);
        expect(ret.token).toMatch(/^123:/);
    });

    it('absolutely true', function () {
        var ret = qiniu.signature({
            dirname: '/a/b/c/d/',
            filename: '/x/y/z.png',
            host: '//a.s.d.com/',
            absolutely: true
        });

        expect(ret.key).toBe('/a/b/c/d/x/y/z.png');
        expect(ret.url).toBe('//a.s.d.com/@/a/b/c/d/x/y/z.png');
    });

    it('absolutely false', function () {
        var ret = qiniu.signature({
            dirname: '/a/b/c/d/',
            filename: '/x/y/z.png',
            host: '//a.s.d.com'
        });

        expect(ret.key).toBe('a/b/c/d/x/y/z.png');
        expect(ret.url).toBe('//a.s.d.com/a/b/c/d/x/y/z.png');
    });
});

