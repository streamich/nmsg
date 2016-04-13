"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var util_1 = require('../util');
var Socket = (function () {
    function Socket(connection) {
        var _this = this;
        this.onmessage = function (msg) { };
        this.conn = connection;
        connection.onmessage = function (data) {
            _this.onmessage(data);
        };
    }
    Socket.prototype.send = function (msg) {
        this.conn.send(msg);
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
    Server.prototype.start = function () {
        var _this = this;
        this.opts.transport.on('connection', function (connection) {
            // connection.on('data', (d) => {
            //     console.log('conn data', d);
            // });
            var socket = new Socket(connection);
            socket.server = _this;
            _this.emit('connection', socket);
            _this.emit('socket', socket);
        });
        this.opts.transport.start();
    };
    Server.defaultOpts = {};
    return Server;
}(events_1.EventEmitter));
exports.Server = Server;
