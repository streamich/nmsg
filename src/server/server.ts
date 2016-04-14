import * as transport from './transport';
import {EventEmitter} from 'events';
import {Serializer} from '../serialize';
import {extend} from '../util';
import {Backoff} from '../backoff';


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
    backoff?: Backoff;
}


export interface IServer {
    start(): this;
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

    protected createSocket(connection, serializer) {
        return new Socket(connection, serializer)
    }

    start(): this {
        var transport = this.opts.transport;
        transport.on('connection', (connection) => {
            var socket = this.createSocket(connection, this.opts.serializer);
            this.emit('connection', socket);
            this.emit('socket', socket);
        });

        transport.on('start',   () => { this.emit('start'); });
        transport.on('stop',    () => { this.emit('stop'); });
        transport.start(this.opts.backoff);
        return this;
    }

    stop() {
        this.opts.transport.stop();
    }
}


import {BackoffExponential} from '../backoff';
import {Msgpack as MsgpackSerializer} from '../serialize';
import {Transport as TcpTransport, ITransportOpts} from './transport/tcp';
import {RouterBuffered} from '../rpc';

module factory {
    export class TcpSocket extends Socket {
        router = new RouterBuffered(this);
    }

    export interface ITcpOpts extends ITransportOpts {}

    export class Tcp extends Server {
        constructor(opts: ITcpOpts) {
            super({
                transport: new TcpTransport(opts),
                serializer: new MsgpackSerializer,
                backoff: new BackoffExponential,
            });
        }

        protected createSocket(connection, serializer) {
            return new TcpSocket(connection, serializer)
        }
    }
}

export import factory = factory;
