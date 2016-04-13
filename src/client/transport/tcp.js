"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var stream_1 = require('stream');
var net = require('net');
var message = require('../../message');
var util_1 = require('../../util');
var Transport = (function (_super) {
    __extends(Transport, _super);
    function Transport(opts) {
        if (opts === void 0) { opts = {}; }
        _super.call(this);
        this.onmessage = null;
        this.onstart = null;
        this.onstop = null;
        this.opts = util_1.extend({}, Transport.defaultOpts, opts);
    }
    Transport.prototype.send = function (chunk) {
        this.write(chunk);
    };
    Transport.prototype.start = function () {
        var _this = this;
        this.socket = new net.Socket;
        this.in = new message.LPDecoderStream(this.socket);
        this.out = new message.LPEncoderStream(this.socket);
        this.resume();
        this.socket.connect(this.opts.port, this.opts.host, function () { if (_this.onstart)
            _this.onstart(); });
        this.socket.on('close', function () { if (_this.onstop)
            _this.onstop(); });
    };
    Transport.prototype.stop = function () {
        this.socket.end();
    };
    Transport.prototype._read = function () {
        var _this = this;
        this.in.on('data', function (buf) {
            _this.push(buf);
            if (_this.onmessage)
                _this.onmessage(buf);
        });
    };
    Transport.prototype._write = function (chunk, encoding, callback) {
        this.out.write(chunk, encoding, callback);
    };
    Transport.defaultOpts = {
        host: '127.0.0.1',
        port: 8080
    };
    return Transport;
}(stream_1.Duplex));
exports.Transport = Transport;
