import {TransportTcp} from '../nmsg-tcp/server';
import * as nmsg from '../nmsg-core/server';
import {Msgpack as Serializer} from '../nmsg-tcp/serialize';
import {BackoffExponential as Backoff} from '../nmsg-core/backoff';
import * as core from './core';


export class Server {

    static create(port = 1337, host = '0.0.0.0') {
        return new Server({
            transport: new TransportTcp({
                host: host,
                port: port,
                serializer: new Serializer,
            }),
            backoff: new Backoff,
        });
    }


    nmsg: nmsg.Server;

    sockets: nmsg.Socket[] = [];

    constructor(opts: nmsg.IServerOpts) {
        this.nmsg = new nmsg.Server(opts);
        this.nmsg.onsocket = this.onSocket.bind(this);
    }

    onSocket(socket) {
        this.sockets.push(socket);
        socket.onstop = this.onSocketStop.bind(this);
    }

    onSocketStop(socket) {
        for(var i = 0; i < this.sockets.length; i++) {
            var sock = this.sockets[i];
            if(sock == socket) {
                this.sockets.splice(i, 1);
                break;
            }
        }
    }

    start() {
        
    }

    // core: core.Core;
    //
    // onEventBound = this.onEvent.bind(this);
    //
    // onsocket = (socket) => {
    //     socket.router.onevent = this.onEventBound;
    // };

    // onEvent(event: string, args: any[]) {
    //     this.core.exec(event, args);
    //     return true; // Stops any further routing.
    // }

    // start() {
    //     this.core.start((err) => {
    //         if(!err) super.start();
    //     });
    //     return this;
    // }
}
