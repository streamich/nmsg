"use strict";
var tcp = require('../nmsg-tcp/client');
var Client = (function () {
    function Client(port, host) {
        if (port === void 0) { port = 1337; }
        if (host === void 0) { host = '127.0.0.1'; }
        this.tcp = tcp.createClient({
            port: port,
            host: host
        });
    }
    Client.prototype.cmd = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this.tcp.router.emit.apply(this.tcp.router, args);
    };
    Client.prototype.on = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this.tcp.router.on.apply(this.tcp.router, args);
    };
    Client.prototype.start = function () {
        this.tcp.start();
        return this;
    };
    return Client;
}());
exports.Client = Client;
function createClient(port, host) {
    return new Client(port, host);
}
exports.createClient = createClient;
