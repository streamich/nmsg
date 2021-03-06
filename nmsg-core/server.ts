import {extend, noop} from './util';
import * as transport from './transport';
import * as serialize from './serialize';
import * as backoff from './backoff';
import * as rpc from '../nmsg-rpc/rpc';
import {TcallbackOnStart} from "./transport";
import {TcallbackOnError} from "./transport";


export type TMessage                    = serialize.TUnpacked;
export type TcallbackOnSocketMessage    = (message: TMessage, socket?: ISocket) => void;
export type TcallbackOnSocket           = (socket: ISocket) => void;
export type TcallbackOnSocketStop       = (socket: ISocket) => void;
// export type TcallbackWiretapServer      = (message: TMessage, socket: ISocket) => void;


export interface ISocket {
    router: rpc.Router;
    onmessage:  TcallbackOnSocketMessage;
    onstop:     TcallbackOnSocketStop;
    onerror:    transport.TcallbackOnError;
    send(msg: TMessage): this;
    stop(): this;
}

export interface IServerOpts {
    backoff?: backoff.IBackoff;
    transport?: transport.ITransport;
}

export interface IServer {
    api: rpc.Api;
    onsocket:   TcallbackOnSocket;
    onstart:    transport.TcallbackOnStart;
    onstop:     transport.TcallbackOnStop;
    onerror:    transport.TcallbackOnError;
    // wiretap:    TcallbackWiretapServer;
    start(): this;
    stop(): this;
}


export class Socket implements ISocket {

    protected connection: transport.Connection;

    router = new rpc.Router;

    onmessage:  TcallbackOnSocketMessage    = noop as TcallbackOnSocketMessage;
    onstop:     TcallbackOnSocketStop       = noop as TcallbackOnSocketStop;
    onerror:    transport.TcallbackOnError  = noop as transport.TcallbackOnError;

    constructor(connection: transport.Connection) {
        this.connection = connection;
        this.connection.onmessage = (msg) => {
            this.onmessage(msg, this);
            this.router.onmessage(msg);
        };
        this.connection.onerror = (err) => { this.onerror(err); };
        this.connection.onstop = () => { this.onstop(this); };
        this.router.send = this.send.bind(this);
    }

    stop(): this {
        this.connection.stop();
        return this;
    }

    send(message: TMessage): this {
        this.connection.send(message);
        return this;
    }
}

export class Server implements IServer {

    protected transport: transport.Transport;

    protected opts: IServerOpts = {};

    isStarted = false;

    api = new rpc.Api;

    onsocket:   TcallbackOnSocket = noop as TcallbackOnSocket;
    onstart:    transport.TcallbackOnStart = noop as transport.TcallbackOnStart;
    onstop:     transport.TcallbackOnStop = noop as transport.TcallbackOnStop;
    onerror:    transport.TcallbackOnError = noop as transport.TcallbackOnError;

    constructor(opts: IServerOpts = {}) {
        this.opts = extend(this.opts, opts);
    }

    protected createSocket(connection) {
        var socket = new Socket(connection);
        socket.router.setApi(this.api);
        return socket;
    }

    protected onStart() {
        this.isStarted = true;
        this.onstart();
    }

    protected onStop() {
        this.isStarted = false;
        this.onstop();
    }

    protected onError(err) {
        // TODO: handle various types of errors, start/stop/ reconnect logic, queue drain etc...
        this.onerror(err);
    }

    protected onConnection(connection) {
        this.onsocket(this.createSocket(connection));
    }

    protected tryStart(success: backoff.TcallbackSuccess, error: backoff.TcallbackError) {
        var transport = this.opts.transport;
        transport.onconnection  = this.onConnection.bind(this);
        transport.onstart       = this.onStart.bind(this);
        transport.onstop        = this.onStop.bind(this);
        transport.onerror       = this.onError.bind(this);
        transport.start(success, error);
    }

    start(): this {
        this.opts.backoff.attempt(this.tryStart.bind(this));
        return this;
    }

    stop(): this {
        this.opts.transport.stop();
        return this;
    }

    // wiretap() {
    //
    // }
}
