"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('../core/util');
var transport = require('../core/transport');
var stream = require('./stream');
var net = require('net');
var ClientTransportTcp = (function (_super) {
    __extends(ClientTransportTcp, _super);
    function ClientTransportTcp(opts) {
        if (opts === void 0) { opts = {}; }
        _super.call(this, util_1.extend({}, ClientTransportTcp.defaults, opts));
        // This allows to "write" to socket, even before its connected.
        this.createStreams();
    }
    ClientTransportTcp.prototype.createStreams = function () {
        var _this = this;
        this.socket = new net.Socket;
        this.out = new stream.LPEncoderStream;
        this.in = new stream.LPDecoderStream;
        this.out.on('error', function (err) { _this.onerror(err); });
        this.in.on('error', function (err) { _this.onerror(err); });
    };
    ClientTransportTcp.prototype.start = function (success, error) {
        var _this = this;
        if (!this.socket)
            this.createStreams();
        this.out.pipe(this.socket);
        this.socket.pipe(this.in);
        this.in.on('data', this.onMessage.bind(this));
        this.socket
            .on('error', function (err) {
            _this.socket = null;
            _this.onerror(err);
            error();
        })
            .on('close', function () {
            _this.socket = null;
            _this.onstop();
        })
            .connect(this.opts.port, this.opts.host, function () {
            _this.onstart();
            success();
        });
    };
    ClientTransportTcp.prototype.stop = function () {
        this.socket.end();
    };
    ClientTransportTcp.prototype.onMessage = function (buf) {
        var message = this.unserialize(buf);
        this.onmessage(message);
    };
    ClientTransportTcp.prototype.send = function (message) {
        var data = this.serialize(message);
        try {
            this.out.write(data);
        }
        catch (err) {
            this.onerror(err);
        }
    };
    ClientTransportTcp.defaults = {
        host: '127.0.0.1',
        port: 8080,
        serializer: null
    };
    return ClientTransportTcp;
}(transport.ClientTransport));
exports.ClientTransportTcp = ClientTransportTcp;
