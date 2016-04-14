"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var net = require('net');
var transport = require('../transport');
var util_1 = require('../../util');
var message = require('../../message');
var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(socket) {
        var _this = this;
        _super.call(this);
        this.in = new message.LPDecoderStream(socket);
        this.out = new message.LPEncoderStream(socket);
        this.pipe(this.out);
        this.in.pipe(this);
        this.in.on('data', function (buf) {
            if (_this.onmessage)
                _this.onmessage(buf);
        });
    }
    return Connection;
}(transport.ConnectionStream));
exports.Connection = Connection;
var Transport = (function (_super) {
    __extends(Transport, _super);
    function Transport(opts) {
        if (opts === void 0) { opts = {}; }
        _super.call(this, util_1.extend({}, Transport.defaultOpts, opts));
    }
    Transport.prototype.start = function (backoff) {
        var _this = this;
        backoff.attempt(function (success, error) {
            _this.server = net.createServer();
            _this.server.on('connection', function (socket) {
                var conn = new Connection(socket);
                conn.resume();
                _this.emit('connection', conn);
            });
            _this.server.on('error', function (err) {
                _this.server.close();
                _this.emit('error', err);
                error();
            });
            _this.server.on('stop', function () { _this.emit('stop'); });
            _this.server.listen({
                host: _this.opts.host,
                port: _this.opts.port
            }, function () {
                _this.emit('start');
                success();
            });
        });
    };
    Transport.prototype.stop = function () {
        this.server.close();
    };
    Transport.defaultOpts = {
        host: '127.0.0.1',
        port: 8080
    };
    return Transport;
}(transport.Transport));
exports.Transport = Transport;
