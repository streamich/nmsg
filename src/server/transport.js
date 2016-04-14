"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var stream_1 = require('stream');
var events_1 = require('events');
var util_1 = require('../util');
var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection() {
        _super.apply(this, arguments);
    }
    Connection.prototype.send = function (chunk) {
        this.write(chunk);
    };
    return Connection;
}(stream_1.Duplex));
exports.Connection = Connection;
var ConnectionStream = (function (_super) {
    __extends(ConnectionStream, _super);
    function ConnectionStream() {
        _super.apply(this, arguments);
    }
    ConnectionStream.prototype.send = function (chunk) {
        this.write(chunk);
    };
    ConnectionStream.prototype._transform = function (data, encoding, callback) {
        callback(null, data);
    };
    return ConnectionStream;
}(stream_1.Transform));
exports.ConnectionStream = ConnectionStream;
var Transport = (function (_super) {
    __extends(Transport, _super);
    function Transport(opts) {
        if (opts === void 0) { opts = {}; }
        _super.call(this);
        this.opts = util_1.extend({}, Transport.defaultOpts, opts);
    }
    Transport.defaultOpts = {};
    return Transport;
}(events_1.EventEmitter));
exports.Transport = Transport;
