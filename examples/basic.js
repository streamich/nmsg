var nmsg = require('../index');

var config = {
    host: '127.0.0.1',
    port: 8081
};

var server = new nmsg.server.factory.Tcp(config);
var client = new nmsg.client.factory.Tcp(config);
server.start().on('start', function() { console.log('Server started.'); });
client.start();

server.on('socket', function(socket) {
    socket.router.on('ping', function() {
        console.log('Ping received!');
    });
});

console.log('Sending ping.');
client.router.emit('ping');

// Outputs:
// Sending ping.
// Server started.
// Ping received!
