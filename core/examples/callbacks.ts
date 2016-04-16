import {factory as server} from '../src/server/server';
import {factory as client} from '../src/client/client';


var config = {
    host: '127.0.0.1',
    port: 8081,
};

var myserver = new server.Tcp(config).start();
var myclient = new client.Tcp(config).start();


myserver.on('socket', (socket) => {
    socket.router.on('ping', (data, err, done) => {
        console.log(data);
        err('This is error message');
        done('pong', (cb) => {
            console.log('Inner callback called');
            cb('You can have as many levels as you want...');
        });
    });
});


myclient.router.emit('ping', {key: 'value'}, (err) => {
    console.log('Error:', err);
}, (msg, cb) => {
    console.log('Done:', msg);
    cb((msg) => {
        console.log('Even deeper callback: ' + msg);
    });
});

// Outputs:
// { key: 'value' }
// Error: This is error message
// Done: pong
// Inner callback called
// Even deeper callback: You can have as many levels as you want...
