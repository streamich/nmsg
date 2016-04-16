"use strict";
var util_1 = require('./util');
var Socket = (function () {
    function Socket(connection) {
        this.onmessage = util_1.noop;
        this.connection = connection;
    }
    Socket.prototype.send = function (message) {
        this.connection.send(message);
    };
    return Socket;
}());
exports.Socket = Socket;
var Server = (function () {
    function Server(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = {};
        this.onsocket = util_1.noop;
        this.onstart = util_1.noop;
        this.onstop = util_1.noop;
        this.onerror = util_1.noop;
        this.opts = util_1.extend(this.opts, opts);
    }
    Server.prototype.createSocket = function (connection) {
        return new Socket(connection);
    };
    Server.prototype.tryStart = function (success, error) {
        var _this = this;
        var transport = this.opts.transport;
        transport.onconnection = function (connection) {
            var socket = _this.createSocket(connection);
            _this.onsocket(socket);
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
