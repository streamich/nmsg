"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var transport = require('./transport');
var server = require('./server');
var client = require('./client');
var backoff_1 = require('./backoff');
var serialize_1 = require('./serialize');
var MockConnection = (function (_super) {
    __extends(MockConnection, _super);
    function MockConnection() {
        _super.apply(this, arguments);
    }
    MockConnection.prototype.send = function (msg) {
        this.connectedTo.receive(msg);
    };
    MockConnection.prototype.receive = function (msg) {
        this.onmessage(msg);
    };
    return MockConnection;
}(transport.Connection));
var MockTransport = (function (_super) {
    __extends(MockTransport, _super);
    function MockTransport() {
        _super.apply(this, arguments);
    }
    MockTransport.prototype.start = function (success) {
        success();
    };
    MockTransport.prototype.stop = function () { };
    MockTransport.prototype.createConnection = function (clientTr) {
        var conn = new MockConnection();
        conn.connectedTo = clientTr;
        clientTr.connectedTo = conn;
        this.onconnection(conn);
    };
    return MockTransport;
}(transport.Transport));
var MockClientTransport = (function (_super) {
    __extends(MockClientTransport, _super);
    function MockClientTransport() {
        _super.apply(this, arguments);
    }
    MockClientTransport.prototype.receive = function (msg) {
        this.onmessage(msg);
    };
    MockClientTransport.prototype.send = function (msg) {
        this.connectedTo.receive(msg);
    };
    MockClientTransport.prototype.start = function (success) {
        success();
    };
    MockClientTransport.prototype.stop = function () { };
    return MockClientTransport;
}(transport.ClientTransport));
function createServer() {
    var s = new server.Server({
        backoff: new backoff_1.BackoffRetry,
        transport: new MockTransport({
            serializer: new serialize_1.Json
        })
    });
    return s;
}
exports.createServer = createServer;
function createClient() {
    var c = new client.Client({
        backoff: new backoff_1.BackoffRetry,
        transport: new MockTransport({
            serializer: new serialize_1.Json
        })
    });
    return c;
}
exports.createClient = createClient;
