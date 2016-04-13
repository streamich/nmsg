/// <reference path="./typing.d.ts" />
import {expect} from 'chai';
import * as serialize from '../src/serialize';


describe('serialize', function() {
    describe('Json', function() {
        var serializer = new serialize.Serializer.Json;
        it('number', function () {
            var data = 123;
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            expect(unpacked).to.equal(data);
        });
        it('string', function () {
            var data = 'Hello World';
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            expect(unpacked).to.equal(data);
        });
        it('object', function () {
            var data = {key: 'value'};
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            expect(unpacked).to.be.an('object');
            expect(unpacked.key).to.equal(data.key);
        });
    });

    describe('Msgpack', function() {
        var serializer = new serialize.Serializer.Msgpack;
        it('number', function () {
            var data = 123;
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            expect(unpacked).to.equal(data);
        });
        it('string', function () {
            var data = 'Hello World';
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            expect(unpacked).to.equal(data);
        });
        it('object', function () {
            var data = {key: 'value'};
            var packed = serializer.pack(data);
            var unpacked = serializer.unpack(packed);
            expect(unpacked).to.be.an('object');
            expect(unpacked.key).to.equal(data.key);
        });
    });
});
