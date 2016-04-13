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
    function Connection() {
        _super.apply(this, arguments);
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
    Transport.prototype.start = function () {
        var _this = this;
        this.server = net.createServer();
        this.server.on('connection', function (socket) {
            var conn = new Connection;
            conn.in = new message.LPDecoderStream(socket);
            conn.out = new message.LPEncoderStream(socket);
            conn.resume();
            _this.emit('connection', conn);
        });
        this.server.on('error', function (err) { _this.emit('error', err); });
        this.server.on('stop', function () { _this.emit('stop'); });
        this.server.listen({
            host: this.opts.host,
            port: this.opts.port
        }, function () { _this.emit('start'); });
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
