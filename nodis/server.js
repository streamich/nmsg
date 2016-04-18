"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var server_1 = require('../nmsg-tcp/server');
var server = require('../nmsg-core/server');
var serialize_1 = require('../nmsg-tcp/serialize');
var backoff_1 = require('../nmsg-core/backoff');
var core = require('./core');
var path = require('path');
var aol = require('./aol');
var api = require('./api');
var util_1 = require('./util');
var NodisServer = (function (_super) {
    __extends(NodisServer, _super);
    function NodisServer() {
        var _this = this;
        _super.apply(this, arguments);
        this.onEventBound = this.onEvent.bind(this);
        this.onsocket = function (socket) {
            console.log(socket);
            socket.router.onevent = _this.onEventBound;
        };
    }
    NodisServer.prototype.onEvent = function (event, args) {
        this.core.exec(event, args);
        return true; // Stops any further routing.
    };
    return NodisServer;
}(server.Server));
exports.NodisServer = NodisServer;
var builder;
(function (builder) {
    builder.defaults = {
        transport: {
            host: '0.0.0.0',
            port: 1337
        },
        persistance: {
            dir: '',
            log: 'data.json.log'
        }
    };
    function createServer(options) {
        var opts = util_1.extend({}, builder.defaults);
        if (options.transport)
            opts.transport = util_1.extend(opts.transport, options.transport);
        if (options.persistance)
            opts.persistance = util_1.extend(opts.persistance, options.persistance);
        // Create storage engine.
        if (!opts.persistance.dir)
            throw Error('Data folder not set.');
        var engineOpts = {
            dir: path.resolve(opts.persistance.dir),
            log: opts.persistance.log
        };
        var engine = new aol.StorageEngine.File(engineOpts);
        // Create Nodis core.
        var nodiscore = new core.Core({
            storageEngine: engine,
            api: api
        });
        // Create transport.
        var topts = {
            host: opts.transport.host,
            port: opts.transport.port,
            serializer: new serialize_1.Msgpack
        };
        var transport = new server_1.TransportTcp(topts);
        // Create server.
        var sopts = {
            transport: transport,
            backoff: new backoff_1.BackoffExponential
        };
        var server = new NodisServer(sopts);
        server.core = nodiscore;
        return server;
    }
    builder.createServer = createServer;
})(builder || (builder = {}));
exports.createServer = builder.createServer;
