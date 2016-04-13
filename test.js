"use strict";
var server_1 = require('./src/server/server');
var tcp_1 = require('./src/server/transport/tcp');
var client_1 = require('./src/client/client');
var tcp_2 = require('./src/client/transport/tcp');
var serialize_1 = require('./src/serialize');
var rpc = require('./src/rpc');
var conf = {
    host: '127.0.0.1',
    port: 8081
};
function create_server(done) {
    var server = new server_1.Server({
        transport: new tcp_1.Transport(conf),
        serializer: new serialize_1.Json
    });
    server.on('socket', function (socket) {
        var manager = new rpc.Manager();
        manager.send = function (msg) { socket.send(msg); };
        socket.onmessage = function (msg) {
            manager.onmessage(msg);
        };
        manager.on('test', function (name, user, cb, cb2) {
            console.log('on test', name, user);
            cb(null, 'Hi thre');
            cb2('lol it works');
        });
    });
    server.on('start', done);
    server.start();
}
create_server(function () {
    var client = new client_1.Client({
        transport: new tcp_2.Transport(conf),
        serializer: new serialize_1.Json
    });
    client.onmessage = function (msg) {
        console.log('client', msg);
    };
    client.onstart = function () {
        var manager = new rpc.Manager();
        manager.send = function (msg) { client.send(msg); };
        client.onmessage = function (msg) { manager.onmessage(msg); };
        // manager.emit('test', 1, 2, 3);
        manager.emit('test', 'asdf', 2, function (err, res) {
            console.log('response from server:', err, res);
        }, function (more) {
            console.log(more);
        });
    };
    client.start();
});
