"use strict";
var server_1 = require('./src/server/server');
var tcp = require('./src/server/transport/tcp');
var client_1 = require('./src/client/client');
var tcp_1 = require('./src/client/transport/tcp');
var conf = {
    host: '127.0.0.1',
    port: 8081
};
function create_server(done) {
    var mytransport = new tcp.Transport(conf);
    mytransport.on('started', function () {
        console.log('server started');
        done();
    });
    var opts = {
        transport: mytransport
    };
    var server = new server_1.Server(opts);
    server.on('socket', function (socket) {
        socket.onmessage = function (msg) {
            console.log('received', msg);
        };
    });
    server.start();
}
create_server(function () {
    var clienttransport = new tcp_1.Transport(conf);
    var clientopts = {
        transport: clienttransport
    };
    var client = new client_1.Client(clientopts);
    clienttransport.on('started', function () {
        console.log('client started');
        client.send('teset');
    });
    client.connect();
});
