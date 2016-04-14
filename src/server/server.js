"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var util_1 = require('../util');
var Socket = (function () {
    function Socket(connection, serializer) {
        var _this = this;
        this.onmessage = function (msg) { };
        this.conn = connection;
        this.serializer = serializer;
        connection.onmessage = function (buf) {
            var msg = _this.serializer.unpack(buf);
            _this.onmessage(msg);
        };
    }
    Socket.prototype.send = function (msg) {
        var buf = this.serializer.pack(msg);
        this.conn.send(buf);
    };
    return Socket;
}());
exports.Socket = Socket;
var Server = (function (_super) {
    __extends(Server, _super);
    function Server(opts) {
        if (opts === void 0) { opts = {}; }
        _super.call(this);
        this.opts = util_1.extend({}, Server.defaultOpts, opts);
    }
    Server.prototype.createSocket = function (connection, serializer) {
        return new Socket(connection, serializer);
    };
    Server.prototype.start = function () {
        var _this = this;
        var transport = this.opts.transport;
        transport.on('connection', function (connection) {
            var socket = _this.createSocket(connection, _this.opts.serializer);
            _this.emit('connection', socket);
            _this.emit('socket', socket);
        });
        transport.on('start', function () { _this.emit('start'); });
        transport.on('stop', function () { _this.emit('stop'); });
        transport.start(this.opts.backoff);
        return this;
    };
    Server.prototype.stop = function () {
        this.opts.transport.stop();
    };
    Server.defaultOpts = {};
    return Server;
}(events_1.EventEmitter));
exports.Server = Server;
var backoff_1 = require('../backoff');
var serialize_1 = require('../serialize');
var tcp_1 = require('./transport/tcp');
var rpc_1 = require('../rpc');
var factory;
(function (factory) {
    var TcpSocket = (function (_super) {
        __extends(TcpSocket, _super);
        function TcpSocket() {
            _super.apply(this, arguments);
            this.router = new rpc_1.Router(this);
        }
        return TcpSocket;
    }(Socket));
    factory.TcpSocket = TcpSocket;
    var Tcp = (function (_super) {
        __extends(Tcp, _super);
        function Tcp(opts) {
            _super.call(this, {
                transport: new tcp_1.Transport(opts),
                serializer: new serialize_1.Msgpack,
                backoff: new backoff_1.BackoffExponential
            });
        }
        Tcp.prototype.createSocket = function (connection, serializer) {
            return new TcpSocket(connection, serializer);
        };
        return Tcp;
    }(Server));
    factory.Tcp = Tcp;
})(factory || (factory = {}));
exports.factory = factory;
