# Node Messenger

> This is work in progress, use at YOUR own risk.

Inter-process communication (IPC) for Node.js, designed for easy
communication between two remote JavaScript processes.

Features include:

 - Client and server with bidirectional communication -- each can `.emit` and listen `.on` events.
 - Evented router, you add events using: `router.on('event', callback)`.
 - Your can send callbacks as arguments for a remote call, like `router.emit('event', 'data', callback)`.
 - Multiple callbacks per event supported, if called on the remote host, arguments for those callbacks will be passed back, where arguments can themselves be callbacks, this nesting can be [arbitrarily deep](./examples/callbacks.ts).
 - Pluggable transports (currently implemented `TCP`).
 - Pluggable data serializers (currently implemented `JSON` and `MsgPack`).
 - Exponential backoff for client and server to retry connection.
 - Stream buffering -- even if server is temporarily down, your messages will still likely be delivered, see example below:
 
For examples see [`./examples`](./examples) folder, here is one:

```js
var nmsg = require('nmsg');

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
```

In this example we send the `ping` event even before the server has been started, yet the event is received, here is console output:

    Sending ping.
    Server started.
    Ping received!

*TypeScript* type definitions available in [./nmsg.d.ts](./nmsg.d.ts).

Getting started:

    npm run start

Testing

    npm run test
    
Generate `nmsg.d.ts` typing file:

    npm run typing
    
    