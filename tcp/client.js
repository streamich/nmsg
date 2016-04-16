"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var transport = require('../node_modules/nmsg/src/transport');
var stream = require('./stream');
var net = require('net');
var ClientTransportTcp = (function (_super) {
    __extends(ClientTransportTcp, _super);
    function ClientTransportTcp() {
        _super.apply(this, arguments);
        this.opts = {
            host: '127.0.0.1',
            port: 8080,
            serializer: null
        };
    }
    ClientTransportTcp.prototype.start = function (success, error) {
        var _this = this;
        this.socket = new net.Socket;
        this.out = new stream.LPEncoderStream(this.socket);
        this.in = new stream.LPDecoderStream(this.socket);
        this.in.on('data', this.onMessage.bind(this));
        this.socket
            .on('error', function (err) {
            _this.onerror(err);
            error();
        })
            .on('close', function () { _this.onstop(); })
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
        this.out.write(data);
    };
    return ClientTransportTcp;
}(transport.ClientTransport));
exports.ClientTransportTcp = ClientTransportTcp;
