"use strict";
var server_1 = require('../nmsg-tcp/server');
var NodisServer = (function () {
    function NodisServer() {
    }
    NodisServer.prototype.start = function () {
        var sopts = {};
        this.server = server_1.createServer(sopts);
    };
    return NodisServer;
}());
exports.NodisServer = NodisServer;
function createServer(options) {
}
exports.createServer = createServer;
