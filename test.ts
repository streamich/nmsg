import {Server} from './src/server/server';
import * as tcp from './src/server/transport/tcp';
import {Client} from './src/client/client';
import {Transport as ClientTransport} from './src/client/transport/tcp';


var conf = {
    host: '127.0.0.1',
    port: 8081,
};


function create_server(done) {
    var mytransport = new tcp.Transport(conf);
    mytransport.on('started', () => {
        console.log('server started');
        done();
    });
    var opts = {
        transport: mytransport,
    };

    var server = new Server(opts);

    server.on('socket', (socket) => {
        socket.onmessage = (msg) => {
            console.log('received', msg);
        };
    });

    server.start();
}



create_server(() => {
    var clienttransport = new ClientTransport(conf);

    var clientopts = {
        transport: clienttransport,
    };
    var client = new Client(clientopts);

    clienttransport.on('started', () => {
        console.log('client started');
        client.send('teset');
    });

    client.connect();
});
