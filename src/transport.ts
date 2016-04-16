import {extend, noop} from './util';
import {ISerializer, TUnpacked} from './serialize';
import * as backoff from './backoff';


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
    serializer?: ISerializer;
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
    onmessage: TcallbackOnMessage = noop;
    abstract send(message: TUnpacked);
}

export abstract class Transport implements ITransport {

    opts: ITransportOpts = {};

    onconnection:   TcallbackOnConnection    = noop;
    onstart:        TcallbackOnStart         = noop;
    onstop:         TcallbackOnStop          = noop;
    onerror:        TcallbackOnError         = noop;

    constructor(opts: ITransportOpts) {
        this.opts = extend(this.opts, opts);
    }

    abstract start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError);
    abstract stop();
}

export abstract class ClientTransport extends Transport implements IClientTransport {
    onmessage: TcallbackOnMessage = noop;
    abstract send(message: TUnpacked);
}
