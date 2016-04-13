"use strict";
/// <reference path="./typing.d.ts" />
var chai_1 = require('chai');
var serialize = require('../src/serialize');
describe('serialize', function () {
    describe('Json', function () {
        var serializer = new serialize.Serializer.Json;
        it('number', function () {
            var data = 123;
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            chai_1.expect(unpacked).to.equal(data);
        });
        it('string', function () {
            var data = 'Hello World';
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            chai_1.expect(unpacked).to.equal(data);
        });
        it('object', function () {
            var data = { key: 'value' };
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            chai_1.expect(unpacked).to.be.an('object');
            chai_1.expect(unpacked.key).to.equal(data.key);
        });
    });
    describe('Msgpack', function () {
        var serializer = new serialize.Serializer.Msgpack;
        it('number', function () {
            var data = 123;
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            chai_1.expect(unpacked).to.equal(data);
        });
        it('string', function () {
            var data = 'Hello World';
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            chai_1.expect(unpacked).to.equal(data);
        });
        it('object', function () {
            var data = { key: 'value' };
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            chai_1.expect(unpacked).to.be.an('object');
            chai_1.expect(unpacked.key).to.equal(data.key);
        });
    });
});
