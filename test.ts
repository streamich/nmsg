import {factory as server} from './src/server/server';
import {factory as client} from './src/client/client';


var conf = {
    host: '127.0.0.1',
    port: 8081,
};


var myserver = new server.Tcp(conf).start();

myserver.on('socket', (socket) => {
    socket.router.on('test', (name, user, cb, cb2) => {
        console.log('on test', name, user);
        cb(null, 'Hi thre!!!!!!!');
        cb2('lol it works');
    });

    socket.router.on('ping', (cb) => {
        cb('pong');
    });
});



var myclient = new client.Tcp(conf).start();

myclient.router.emit('test', 'hihi', 2, (err, res) => {
        console.log('response from server:', err, res);
    }, (more) => {
        console.log(more);
    });

myclient.router.emit('ping', (res) => {
    console.log(`ping > ${res}`);
});

