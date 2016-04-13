"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Serializer = (function () {
    function Serializer() {
    }
    Serializer.toBuffer = function (data) {
        if (data instanceof Buffer)
            return data;
        if (typeof data === 'string')
            return new Buffer(data);
        if ((typeof data === 'object') && (typeof data.toString === 'function'))
            return new Buffer(data.toString());
        throw Error('Invalid unpacked data');
    };
    Serializer.toString = function (data) {
        if (typeof data === 'string')
            return data;
        else
            return data.toString();
    };
    return Serializer;
}());
exports.Serializer = Serializer;
var Json = (function (_super) {
    __extends(Json, _super);
    function Json() {
        _super.apply(this, arguments);
    }
    Json.prototype.pack = function (data) {
        var json = JSON.stringify(data);
        return json;
        // return Serializer.toBuffer(json);
    };
    Json.prototype.unpack = function (data) {
        var json = Serializer.toString(data);
        return JSON.parse(json);
    };
    return Json;
}(Serializer));
exports.Json = Json;
var Msgpack = (function (_super) {
    __extends(Msgpack, _super);
    function Msgpack() {
        _super.apply(this, arguments);
    }
    Msgpack.prototype.pack = function (data) {
        var msgpack = require('msgpack-lite');
        return msgpack.encode(data);
    };
    Msgpack.prototype.unpack = function (data) {
        var msgpack = require('msgpack-lite');
        return msgpack.decode(data);
    };
    return Msgpack;
}(Serializer));
exports.Msgpack = Msgpack;
