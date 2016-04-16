"use strict";
var server_1 = require('./src/server/server');
var client_1 = require('./src/client/client');
var conf = {
    host: '127.0.0.1',
    port: 8081
};
var myserver = new server_1.factory.Tcp(conf).start();
myserver.on('socket', function (socket) {
    socket.router.on('test', function (name, user, cb, cb2) {
        console.log('on test', name, user);
        cb(null, 'Hi thre!!!!!!!');
        cb2('lol it works');
    });
    socket.router.on('ping', function (cb) {
        cb('pong');
    });
});
var myclient = new client_1.factory.Tcp(conf).start();
myclient.router.emit('test', 'hihi', 2, function (err, res) {
    console.log('response from server:', err, res);
}, function (more) {
    console.log(more);
});
myclient.router.emit('ping', function (res) {
    console.log("ping > " + res);
});
