"use strict";
var server_1 = require('../src/server/server');
var client_1 = require('../src/client/client');
var config = {
    host: '127.0.0.1',
    port: 8081
};
var myserver = new server_1.factory.Tcp(config).start();
var myclient = new client_1.factory.Tcp(config).start();
myserver.on('socket', function (socket) {
    socket.router.on('ping', function (data, err, done) {
        console.log(data);
        err('This is error message');
        done('pong', function (cb) {
            console.log('Inner callback called');
            cb('You can have as many levels as you want...');
        });
    });
});
myclient.router.emit('ping', { key: 'value' }, function (err) {
    console.log('Error:', err);
}, function (msg, cb) {
    console.log('Done:', msg);
    cb(function (msg) {
        console.log('Even deeper callback: ' + msg);
    });
});
// Outputs:
// { key: 'value' }
// Error: This is error message
// Done: pong
// Inner callback called
// Even deeper callback: You can have as many levels as you want...
