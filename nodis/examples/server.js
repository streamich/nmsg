"use strict";
var server = require('../server');
var config = require('../nodis.config');
var tcp = require('../../nmsg-tcp/tcp');
var nodis = server.createServer(config).start();
var client = tcp.createClient(1337).start();
client.router.emit('ping', function (response) {
    console.log(response);
});
client.router.emit('set', 'counter', 3);
client.router.emit('get', 'counter', function (err, data) {
    console.log(err, data);
});
client.router.emit('set23', function (res) {
    console.log(res);
});
