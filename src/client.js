"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('./util');
var server = require('./server');
var Client = (function (_super) {
    __extends(Client, _super);
    function Client() {
        _super.apply(this, arguments);
        this.onmessage = util_1.noop;
    }
    Client.prototype.send = function (message) {
        this.opts.transport.send(message);
    };
    return Client;
}(server.Server));
exports.Client = Client;
