import {extend, noop} from './util';
import * as transport from './transport';
import * as serialize from './serialize';
import * as backoff from './backoff';


export type TMessage                    = serialize.TUnpacked;
export type TcallbackOnSocketMessage    = (message: TMessage, socket: ISocket) => void;
export type TcallbackOnSocket           = (socket: ISocket) => void;
export type TcallbackWiretapServer      = (message: TMessage, socket: ISocket) => void;


export interface ISocket {
    onmessage: TcallbackOnSocketMessage;
    send(msg: TMessage);
}

export interface IServerOpts {
    backoff?: backoff.IBackoff;
    transport?: transport.ITransport;
}

export interface IServer {
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

    onmessage: TcallbackOnSocketMessage = noop;

    constructor(connection: transport.Connection) {
        this.connection = connection;
    }

    send(message: TMessage) {
        this.connection.send(message);
    }
}

export class Server implements IServer {

    protected transport: transport.Transport;

    protected opts: IServerOpts = {};

    onsocket:   TcallbackOnSocket = noop;
    onstart:    transport.TcallbackOnStart = noop;
    onstop:     transport.TcallbackOnStop = noop;
    onerror:    transport.TcallbackOnError = noop;

    constructor(opts: IServerOpts = {}) {
        this.opts = extend(this.opts, opts);
    }

    protected createSocket(connection) {
        return new Socket(connection)
    }

    protected tryStart(success: backoff.TcallbackSuccess, error: backoff.TcallbackError) {
        var transport = this.opts.transport;
        transport.onconnection = (connection) => {
            var socket = this.createSocket(connection);
            this.onsocket(socket);
        };

        // Do NOT do just `transport.onstart = this.onstart;`
        transport.onstart   = () => { this.onstart(); };
        transport.onstop    = () => { this.onstop(); };
        transport.onerror   = (err) => { this.onerror(err); };
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
