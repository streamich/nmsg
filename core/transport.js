"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('./util');
var Connection = (function () {
    function Connection() {
        this.onmessage = util_1.noop;
    }
    return Connection;
}());
exports.Connection = Connection;
var Transport = (function () {
    function Transport(opts) {
        this.opts = {
            serializer: null
        };
        this.onconnection = util_1.noop;
        this.onstart = util_1.noop;
        this.onstop = util_1.noop;
        this.onerror = util_1.noop;
        this.opts = util_1.extend(this.opts, opts);
    }
    Transport.prototype.createConncetion = function () {
        var connection = new this.ClassConnection;
        connection.transport = this;
        connection.serializer = this.opts.serializer;
        return connection;
    };
    Transport.prototype.serialize = function (message) {
        return this.opts.serializer.pack(message);
    };
    Transport.prototype.unserialize = function (data) {
        return this.opts.serializer.unpack(data);
    };
    return Transport;
}());
exports.Transport = Transport;
var ClientTransport = (function (_super) {
    __extends(ClientTransport, _super);
    function ClientTransport() {
        _super.apply(this, arguments);
        this.onmessage = util_1.noop;
    }
    return ClientTransport;
}(Transport));
exports.ClientTransport = ClientTransport;
