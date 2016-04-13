"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(opts) {
        _super.call(this);
        this.onmessage = null;
        if (opts.transport)
            this.transport = opts.transport;
    }
    Client.prototype.send = function (data) {
        this.transport.send(data);
    };
    Client.prototype.start = function () {
        this.transport.start();
    };
    // Just a proxy for better naming.
    Client.prototype.connect = function () {
        this.start();
    };
    return Client;
}(events_1.EventEmitter));
exports.Client = Client;
