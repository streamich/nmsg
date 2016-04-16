import {extend, noop} from './util';
import {ISerializer, TUnpacked, TPacked} from './serialize';
import * as backoff from './backoff';
import {TMessage} from "./server";


export type TcallbackOnConnection   = (connection: IConnection) => void;
export type TcallbackOnMessage      = (message: TUnpacked) => void;
export type TcallbackOnStart        = () => void;
export type TcallbackOnStop         = () => void;
export type TcallbackOnError        = (err: Error) => void;


export interface IConnection {
    onmessage: TcallbackOnMessage;
    send(message: TUnpacked);
}

export interface ITransportOpts {
    serializer: ISerializer;
}

export interface ITransport {
    onconnection:   TcallbackOnConnection;
    onstart:        TcallbackOnStart;
    onstop:         TcallbackOnStop;
    onerror:        TcallbackOnError;

    opts: ITransportOpts;
    start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError);
    stop();
}

// Client's transport is both: a transport (server) and a connection (socket).
export interface IClientTransport extends ITransport, IConnection {}


export abstract class Connection implements IConnection {
    serializer: ISerializer;

    transport: Transport;

    onmessage: TcallbackOnMessage = noop;

    abstract send(message: TUnpacked);
}

export abstract class Transport implements ITransport {

    opts: ITransportOpts = {
        serializer: null,
    };

    ClassConnection;

    onconnection:   TcallbackOnConnection    = noop;
    onstart:        TcallbackOnStart         = noop;
    onstop:         TcallbackOnStop          = noop;
    onerror:        TcallbackOnError         = noop;

    constructor(opts: ITransportOpts) {
        this.opts = extend(this.opts, opts);
    }

    abstract start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError);
    abstract stop();

    protected createConncetion(): Connection {
        var connection = new this.ClassConnection;
        connection.transport = this;
        return connection as Connection;
    }

    serialize(message: TMessage): TPacked {
        return this.opts.serializer.pack(message);
    }

    unserialize(data: TPacked): TMessage {
        return this.opts.serializer.unpack(data);
    }
}

export abstract class ClientTransport extends Transport implements IClientTransport {
    onmessage: TcallbackOnMessage = noop;
    abstract send(message: TUnpacked);
}
