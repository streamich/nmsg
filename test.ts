import {Server} from './src/server/server';
import {Transport as ServerTransport} from './src/server/transport/tcp';
import {Client} from './src/client/client';
import {Transport as ClientTransport} from './src/client/transport/tcp';
import {Json as SerializerJson} from './src/serialize';
import * as rpc from './src/rpc';


var conf = {
    host: '127.0.0.1',
    port: 8081,
};


function create_server(done) {
    var server = new Server({
        transport: new ServerTransport(conf),
        serializer: new SerializerJson,
    });

    server.on('socket', (socket) => {

        var manager = new rpc.Manager();

        manager.send = (msg) => { socket.send(msg); };
        socket.onmessage = (msg) => {
            manager.onmessage(msg);
        };

        manager.on('test', (name, user, cb, cb2) => {
            console.log('on test', name, user);
            cb(null, 'Hi thre');
            cb2('lol it works');
        });

    });
    server.on('start', done);
    server.start();
}



create_server(() => {
    var client = new Client({
        transport: new ClientTransport(conf),
        serializer: new SerializerJson,
    });

    client.onmessage = (msg) => {
        console.log('client', msg);
    };

    client.onstart = () => {
        var manager = new rpc.Manager();

        manager.send = (msg) => { client.send(msg); };
        client.onmessage = (msg) => { manager.onmessage(msg); };

        // manager.emit('test', 1, 2, 3);
        manager.emit('test', 'asdf', 2, (err, res) => {
            console.log('response from server:', err, res);
        }, (more) => {
            console.log(more);
        });
    };

    client.start();



});




