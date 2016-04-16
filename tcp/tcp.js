"use strict";
var server_1 = require('./server');
var client_1 = require('./client');
var server_2 = require('../node_modules/nmsg/src/server');
var client_2 = require('../node_modules/nmsg/src/client');
var serialize_1 = require('./serialize');
var backoff_1 = require('../node_modules/nmsg/src/backoff');
function fill_opts(opts) {
    if (!opts.host)
        opts.host = '127.0.0.1';
    if (!opts.port)
        opts.port = 8080;
    if (!opts.serializer)
        opts.serializer = new serialize_1.Msgpack;
    if (!opts.backoff)
        opts.backoff = new backoff_1.BackoffExponential;
}
function createServer(opts) {
    if (opts === void 0) { opts = {}; }
    fill_opts(opts);
    var topts = {
        host: opts.host,
        port: opts.port,
        serializer: opts.serializer
    };
    var myserver = new server_2.Server({
        transport: new server_1.TransportTcp(topts),
        backoff: opts.backoff
    });
    return myserver;
}
exports.createServer = createServer;
function createClient(opts) {
    if (opts === void 0) { opts = {}; }
    fill_opts(opts);
    var topts = {
        host: opts.host,
        port: opts.port,
        serializer: opts.serializer
    };
    var myclient = new client_2.Client({
        transport: new client_1.ClientTransportTcp(topts),
        backoff: opts.backoff
    });
    return myclient;
}
exports.createClient = createClient;
exports.createConnection = createClient;
