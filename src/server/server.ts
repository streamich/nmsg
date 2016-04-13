import * as transport from './transport';
import {EventEmitter} from 'events';
import {Serializer} from '../serialize';
import {extend} from '../util';


export type TMessage = string|number|any;
export type TcallbackOnMessage = (msg: TMessage) => void;


export interface ISocket {
    onmessage: TcallbackOnMessage;
    send(msg: TMessage);
}


export class Socket implements ISocket {

    protected conn: transport.Connection;

    protected serializer: Serializer;

    onmessage = (msg) => {};

    constructor(connection: transport.Connection, serializer: Serializer) {
        this.conn = connection;
        this.serializer = serializer;
        connection.onmessage = (buf: Buffer) => {
            var msg = this.serializer.unpack(buf);
            this.onmessage(msg);
        };
    }

    send(msg: TMessage) {
        var buf = this.serializer.pack(msg);
        this.conn.send(buf);
    }
}


export interface IServerOpts {
    transport?: transport.Transport;
    serializer?: Serializer;
}


export interface IServer {
    start();
    stop();
}


export class Server extends EventEmitter implements IServer {

    static defaultOpts: IServerOpts = {};

    protected transport: transport.Transport;

    protected opts: IServerOpts;

    constructor(opts: IServerOpts = {}) {
        super();
        this.opts = extend({}, Server.defaultOpts, opts);
    }

    start() {
        var transport = this.opts.transport;
        transport.on('connection', (connection) => {
            var socket = new Socket(connection, this.opts.serializer);
            this.emit('connection', socket);
            this.emit('socket', socket);
        });

        transport.on('start',   () => { this.emit('start'); });
        transport.on('stop',    () => { this.emit('stop'); });
        transport.start();
    }

    stop() {
        this.opts.transport.stop();
    }
}
