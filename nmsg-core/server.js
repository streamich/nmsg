"use strict";
var util_1 = require('./util');
var rpc = require('../nmsg-rpc/rpc');
var Socket = (function () {
    function Socket(connection) {
        var _this = this;
        this.router = new rpc.Router;
        this.onmessage = util_1.noop;
        this.onstop = util_1.noop;
        this.onerror = util_1.noop;
        this.connection = connection;
        this.connection.onmessage = function (msg) {
            _this.onmessage(msg, _this);
            _this.router.onmessage(msg);
        };
        this.connection.onerror = function (err) { _this.onerror(err); };
        this.connection.onstop = function () { _this.onstop(_this); };
        this.router.send = this.send.bind(this);
    }
    Socket.prototype.stop = function () {
        this.connection.stop();
        return this;
    };
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
        this.isStarted = false;
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
    Server.prototype.onStart = function () {
        this.isStarted = true;
        this.onstart();
    };
    Server.prototype.onStop = function () {
        this.isStarted = false;
        this.onstop();
    };
    Server.prototype.onError = function (err) {
        // TODO: handle various types of errors, start/stop/ reconnect logic, queue drain etc...
        this.onerror(err);
    };
    Server.prototype.onConnection = function (connection) {
        this.onsocket(this.createSocket(connection));
    };
    Server.prototype.tryStart = function (success, error) {
        var transport = this.opts.transport;
        transport.onconnection = this.onConnection.bind(this);
        transport.onstart = this.onStart.bind(this);
        transport.onstop = this.onStop.bind(this);
        transport.onerror = this.onError.bind(this);
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
