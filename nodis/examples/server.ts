import * as server from '../server';
var config = require('../nodis.config');
import * as tcp from '../../nmsg-tcp/tcp';


var nodis = server.createServer(config).start();


var client = tcp.createClient(1337).start();
client.router.emit('ping', (response) => {
    console.log(response);
});


client.router.emit('set', 'counter', 3);
client.router.emit('get', 'counter', (err, data) => {
    console.log(err, data);
});


client.router.emit('set23', (res) => {
    console.log(res);
});

