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
    Transport.prototype.start = function (backoff) {
        var _this = this;
        backoff.attempt(function (success, error) {
            _this.socket = new net.Socket;
            _this.in = new message.LPDecoderStream(_this.socket);
            _this.out = new message.LPEncoderStream(_this.socket);
            _this.pipe(_this.out);
            // this.in.pipe(this);
            _this.in.on('data', function (buf) {
                if (_this.onmessage)
                    _this.onmessage(buf);
            });
            _this.socket.on('error', error);
            _this.socket.on('close', function () { if (_this.onstop)
                _this.onstop(); });
            _this.socket.connect(_this.opts.port, _this.opts.host, function () {
                if (_this.onstart)
                    _this.onstart();
                success();
            });
        });
    };
    Transport.prototype.stop = function () {
        this.socket.end();
    };
    Transport.prototype._transform = function (data, encoding, callback) {
        callback(null, data);
    };
    Transport.defaultOpts = {
        host: '127.0.0.1',
        port: 8080
    };
    return Transport;
}(stream_1.Transform));
exports.Transport = Transport;
