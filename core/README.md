# Node Messenger

> This is work in progress, use at YOUR own risk.

Inter-process communication (IPC) for Node.js, designed for easy
communication between two remote JavaScript processes.

Features include:

 - Client and server with bidirectional communication -- each can `.emit` and listen `.on` events.
 - Your can send callbacks as arguments for a remote call, like `router.emit('event', 'data', callback)`.
 - Multiple callbacks per event supported, if called on the remote host, arguments for those callbacks will be passed back, where arguments can themselves be callbacks, this nesting can be [arbitrarily deep](./examples/callbacks.ts).
 - You add event listeners using `router.on('event', callback)` and emit using `router.emit('event', 'data')`.
 - Wildcard event `*`.
 - `RouterBuffered` buffers outgoing messages for few milliseconds, then sends a bulk packet. This allows to combine many small messages into one.
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

## Reference

### `core.Server`

#### .onsocket = (socket: core.Socket) => void;

A mechanism for receiving new sockets, you have to implement this property method. 

### `core.Socket`



### `core.Client`


## Developing

Getting started:

    npm run start

Testing:

    npm run test
    
Generate `nmsg.d.ts` typing file:

    npm run typing
    
Publishing:

    npm run mypublish
    
## License

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
