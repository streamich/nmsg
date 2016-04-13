import * as transport from './transport';
import {EventEmitter} from 'events';
import {Serializer} from '../serialize';
import {extend} from '../util';


export class Socket {

    server: Server;

    conn: transport.Connection;

    onmessage = (msg) => {};

    constructor(connection: transport.Connection) {
        this.conn = connection;
        connection.onmessage = (data) => {
            this.onmessage(data);
        };
    }

    send(msg: string|Buffer) {
        this.conn.send(msg);
    }
}


export interface IServerOpts {
    transport?: transport.Transport;
    serializer?: Serializer;
}


export class Server extends EventEmitter {

    static defaultOpts: IServerOpts = {};

    protected transport: transport.Transport;

    protected opts: IServerOpts;

    constructor(opts: IServerOpts = {}) {
        super();
        this.opts = extend({}, Server.defaultOpts, opts);
    }

    start() {
        this.opts.transport.on('connection', (connection) => {
            // connection.on('data', (d) => {
            //     console.log('conn data', d);
            // });
            var socket = new Socket(connection);
            socket.server = this;
            this.emit('connection', socket);
            this.emit('socket', socket);
        });

        this.opts.transport.start();
    }

}
