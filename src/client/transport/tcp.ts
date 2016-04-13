import {IClientTransport, TcallbackOnMessage} from '../transport';
import {Duplex} from 'stream';
import * as net from 'net';
import * as transform from '../../stream/transform';
import {extend} from '../../util';


export interface ITransportOpts {
    host?: string;
    port?: number;
}


export class Transport extends Duplex implements IClientTransport {

    static defaultOpts: ITransportOpts = {
        host: '127.0.0.1',
        port: 8080,
    };

    socket: net.Socket;

    'in': transform.LPDecoderStream;

    out: transform.LPEncoderStream;

    onmessage: TcallbackOnMessage = null;

    opts: ITransportOpts;

    constructor(opts: ITransportOpts = {}) {
        super();
        this.opts = extend({}, Transport.defaultOpts, opts);
    }

    send(chunk: Buffer|string) {
        this.write(chunk);
    }

    start() {
        this.socket = new net.Socket;

        this.in = new transform.LPDecoderStream(this.socket);
        this.out = new transform.LPEncoderStream(this.socket);

        this.socket.connect(this.opts.port, this.opts.host, () => {
            this.emit('started');
        });

        this.socket.on('close', () => { this.emit('close'); });
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
