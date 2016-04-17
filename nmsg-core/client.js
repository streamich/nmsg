"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('./util');
var server = require('./server');
var rpc = require('../rpc/rpc');
var queue_1 = require('./queue');
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(opts) {
        var _this = this;
        if (opts === void 0) { opts = {}; }
        _super.call(this, opts);
        this.router = new rpc.Router;
        this.onmessage = util_1.noop;
        this.queue = new queue_1.Queue(opts.queue);
        this.opts.transport.onmessage = function (msg) {
            _this.onmessage(msg);
            _this.router.onmessage(msg);
        };
        this.router.send = this.send.bind(this);
    }
    Client.prototype.onStart = function () {
        _super.prototype.onStart.call(this);
        this.drainQueue();
    };
    Client.prototype.drainQueue = function () {
        var msg;
        var transport = this.opts.transport;
        while (msg = this.queue.shift())
            transport.send(msg);
    };
    Client.prototype.send = function (message) {
        if (this.isStarted)
            this.opts.transport.send(message);
        else
            this.queue.add(message);
        return this;
    };
    return Client;
}(server.Server));
exports.Client = Client;
