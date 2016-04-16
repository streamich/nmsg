"use strict";
var util_1 = require('./util');
var rpc = require('../rpc/rpc');
var Socket = (function () {
    function Socket(connection) {
        var _this = this;
        this.router = new rpc.Router;
        this.onmessage = util_1.noop;
        this.connection = connection;
        this.connection.onmessage = function (msg) {
            _this.onmessage(msg, _this);
            _this.router.onmessage(msg);
        };
        this.router.send = this.send.bind(this);
    }
    Socket.prototype.send = function (message) {
        this.connection.send(message);
        return this;
    };
    return Socket;
}());
exports.Socket = Socket;
var Server = (function () {
    function Server(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = {};
        this.api = new rpc.Api;
        this.onsocket = util_1.noop;
        this.onstart = util_1.noop;
        this.onstop = util_1.noop;
        this.onerror = util_1.noop;
        this.opts = util_1.extend(this.opts, opts);
    }
    Server.prototype.createSocket = function (connection) {
        var socket = new Socket(connection);
        socket.router.setApi(this.api);
        return socket;
    };
    Server.prototype.tryStart = function (success, error) {
        var _this = this;
        var transport = this.opts.transport;
        transport.onconnection = function (connection) {
            _this.onsocket(_this.createSocket(connection));
        };
        // Do NOT do just `transport.onstart = this.onstart;`
        transport.onstart = function () { _this.onstart(); };
        transport.onstop = function () { _this.onstop(); };
        transport.onerror = function (err) { _this.onerror(err); };
        transport.start(success, error);
    };
    Server.prototype.start = function () {
        this.opts.backoff.attempt(this.tryStart.bind(this));
        return this;
    };
    Server.prototype.stop = function () {
        this.opts.transport.stop();
        return this;
    };
    return Server;
}());
exports.Server = Server;
