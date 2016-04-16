import * as tcp from '../src/tcp';


var opts = {
    host: '127.0.0.1',
    port: 9999,
};

var server = tcp.createServer(opts);
server.onstart = () => { console.log('started'); };
server.onsocket = (socket) => {
    socket.onmessage = (msg) => {
        console.log('msg', msg);
    };
};
server.start();

var client = tcp.createClient(opts);
client.onstart = () => {
    console.log('connected');
    client.send('test');
};
client.start();




