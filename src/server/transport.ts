import {Readable, Writable, Duplex, Transform} from 'stream';
import {EventEmitter} from 'events';
import {extend} from '../util';
import {Backoff} from '../backoff';


export type TcallbackOnMessage  = (chunk: Buffer|string) => void;
export type TcallbackOnStart    = () => void;
export type TcallbackOnStop     = () => void;


export interface IConnection {
    onmessage: TcallbackOnMessage;
    onstart?: TcallbackOnStart;
    onstop?: TcallbackOnStop;
    send(chunk: Buffer|string);
}


export interface ITransport {
    opts: ITransportOpts;
    start(backoff: Backoff);
    stop();
}


export abstract class Connection extends Duplex implements IConnection {
    onmessage: TcallbackOnMessage;

    send(chunk: Buffer|string) {
        this.write(chunk);
    }
}


export abstract class ConnectionStream extends Transform implements IConnection {
    'in': Readable | Duplex | Transform;

    out: Writable | Duplex | Transform;

    onmessage: TcallbackOnMessage;

    send(chunk: Buffer|string) {
        this.write(chunk);
    }

    _transform(data, encoding, callback) {
        callback(null, data);
    }
}


export interface ITransportOpts {

}


export abstract class Transport extends EventEmitter implements ITransport {

    static defaultOpts = {};

    abstract start(backoff: Backoff);
    abstract stop();

    opts: ITransportOpts;

    constructor(opts: ITransportOpts = {}) {
        super();
        this.opts = extend({}, Transport.defaultOpts, opts);
    }
}
