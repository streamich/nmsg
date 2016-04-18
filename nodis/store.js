"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var stream_1 = require('stream');
var stl_1 = require('./stl');
var Key = (function () {
    function Key() {
    }
    Key.create = function (data, timestamp) {
        var key = new Key;
        key.data = data;
        key.meta = {
            ts: timestamp
        };
        return key;
    };
    return Key;
}());
exports.Key = Key;
var Keys = (function () {
    function Keys() {
        this.map = new stl_1.Map();
    }
    return Keys;
}());
exports.Keys = Keys;
var SortedSet = (function () {
    function SortedSet() {
    }
    return SortedSet;
}());
exports.SortedSet = SortedSet;
var Storage = (function () {
    function Storage() {
        this.keys = new Keys;
        this.sortedSet = new SortedSet;
    }
    return Storage;
}());
exports.Storage = Storage;
var KeysExporter = (function (_super) {
    __extends(KeysExporter, _super);
    function KeysExporter() {
        _super.apply(this, arguments);
        this.step = 0;
        this.batch = 2;
    }
    KeysExporter.prototype._read = function () {
        var map = this.keys.map;
        for (var i = 0; i < this.batch; i++) {
            var index = this.step + i;
            if (index >= map.length)
                continue;
            var _a = map.iter(index), key = _a[0], mykey = _a[1];
            // console.log('step', this.step);
            // console.log('pushing', [key, val]);
            this.push(JSON.stringify([key, mykey.data]));
        }
        this.step += this.batch;
        if (this.step >= map.length)
            this.push(null);
    };
    return KeysExporter;
}(stream_1.Readable));
exports.KeysExporter = KeysExporter;
