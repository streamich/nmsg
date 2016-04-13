import {Readable, Writable, Duplex, Transform} from 'stream';
import {EventEmitter} from 'events';
import {extend} from '../util';


export type TcallbackOnMessage  = (chunk: Buffer|string) => void;
export type TcallbackOnClose    = () => void;


export interface IConnection {
    onmessage: TcallbackOnMessage;
    send(chunk: Buffer|string);
}


export interface ITransport {
    opts: ITransportOpts;
    start();
}


export abstract class Connection extends Duplex implements IConnection {
    onmessage: TcallbackOnMessage;

    send(chunk: Buffer|string) {
        this.write(chunk);
    }
}


export abstract class ConnectionStream extends Duplex implements IConnection {
    'in': Readable | Duplex | Transform;

    out: Writable | Duplex | Transform;

    onmessage: TcallbackOnMessage;

    send(chunk: Buffer|string) {
        this.write(chunk);
    }

    _read() {
        this.in.on('data', (buf: Buffer) => {
            this.push(buf);
            if(this.onmessage) this.onmessage(buf);
        });
    }

    _write(chunk: string|Buffer, encoding?: string, callback?: (err?) => void) {
        this.out.write(chunk, encoding, callback);
    }
}


export interface ITransportOpts {

}


export abstract class Transport extends EventEmitter implements ITransport {

    static defaultOpts = {};

    abstract start();

    opts: ITransportOpts;

    constructor(opts: ITransportOpts = {}) {
        super();
        this.opts = extend({}, Transport.defaultOpts, opts);
    }
}
