"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var stream_1 = require('stream');
var stl_1 = require('./stl');
var Keys = (function () {
    function Keys() {
        this.map = new stl_1.Map;
        this.meta = {};
    }
    Keys.prototype.deleteMeta = function (key) {
        // TODO: clear timers
        delete this.meta[key];
    };
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
        this.key = new Keys;
        this.sortedSet = new SortedSet;
    }
    return Storage;
}());
exports.Storage = Storage;
function noop() { }
var commands;
(function (commands) {
    commands.set = function (key, value, opts, callback) {
        var mopts;
        if (typeof opts === 'function') {
            callback = opts;
            mopts = {};
        }
        else
            mopts = opts || {};
        if (typeof callback !== 'function')
            callback = noop;
        var storage = this;
        storage.key.map.set([key, value]);
    };
})(commands = exports.commands || (exports.commands = {}));
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
            var _a = map.iter(index), key = _a[0], val = _a[1];
            // console.log('step', this.step);
            // console.log('pushing', [key, val]);
            this.push(JSON.stringify([key, val]));
        }
        this.step += this.batch;
        if (this.step >= map.length)
            this.push(null);
    };
    return KeysExporter;
}(stream_1.Readable));
exports.KeysExporter = KeysExporter;
