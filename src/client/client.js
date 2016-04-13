"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var util_1 = require('../util');
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(opts) {
        if (opts === void 0) { opts = {}; }
        _super.call(this);
        this.opts = {};
        this.opts = util_1.extend({}, Client.defaultOpts, opts);
    }
    Client.prototype.send = function (msg) {
        var buf = this.opts.serializer.pack(msg);
        this.opts.transport.send(buf);
    };
    Client.prototype.start = function () {
        var _this = this;
        var transport = this.opts.transport;
        transport.onmessage = function (buf) {
            var msg = _this.opts.serializer.unpack(buf);
            if (_this.onmessage)
                _this.onmessage(msg);
        };
        transport.onstart = function () { if (_this.onstart)
            _this.onstart(); };
        transport.onstop = function () { if (_this.onstop)
            _this.onstop(); };
        transport.start();
    };
    Client.prototype.stop = function () {
        this.opts.transport.stop();
    };
    Client.defaultOpts = {};
    return Client;
}(events_1.EventEmitter));
exports.Client = Client;
