"use strict";
var tcp = require('../src/tcp');
var opts = {
    host: '127.0.0.1',
    port: 9999
};
var server = tcp.createServer(opts);
server.onstart = function () { console.log('started'); };
server.onsocket = function (socket) {
    socket.onmessage = function (msg) {
        console.log('msg', msg);
    };
};
server.start();
var client = tcp.createClient(opts);
client.onstart = function () {
    console.log('connected');
    client.send('test');
};
client.start();
