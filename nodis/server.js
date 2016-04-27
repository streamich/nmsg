"use strict";
var server_1 = require('../nmsg-tcp/server');
var nmsg = require('../nmsg-core/server');
var serialize_1 = require('../nmsg-tcp/serialize');
var backoff_1 = require('../nmsg-core/backoff');
var Server = (function () {
    function Server(opts) {
        this.sockets = [];
        this.nmsg = new nmsg.Server(opts);
        this.nmsg.onsocket = this.onSocket.bind(this);
    }
    Server.create = function (port, host) {
        if (port === void 0) { port = 1337; }
        if (host === void 0) { host = '0.0.0.0'; }
        return new Server({
            transport: new server_1.TransportTcp({
                host: host,
                port: port,
                serializer: new serialize_1.Msgpack
            }),
            backoff: new backoff_1.BackoffExponential
        });
    };
    Server.prototype.onSocket = function (socket) {
        this.sockets.push(socket);
        socket.onstop = this.onSocketStop.bind(this);
    };
    Server.prototype.onSocketStop = function (socket) {
        for (var i = 0; i < this.sockets.length; i++) {
            var sock = this.sockets[i];
            if (sock == socket) {
                this.sockets.splice(i, 1);
                break;
            }
        }
    };
    Server.prototype.start = function () {
    };
    return Server;
}());
exports.Server = Server;
