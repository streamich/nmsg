import {IClientTransport} from '../transport';
import {Duplex} from 'stream';
import * as net from 'net';
import * as message from '../../message';
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

    protected socket: net.Socket;

    protected 'in': message.LPDecoderStream;

    protected out: message.LPEncoderStream;

    onmessage: TcallbackOnMessage = null;
    onstart: TcallbackOnStart = null;
    onstop: TcallbackOnStop = null;

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

        this.in = new message.LPDecoderStream(this.socket);
        this.out = new message.LPEncoderStream(this.socket);
        this.resume();

        this.socket.connect(this.opts.port, this.opts.host, () => { if(this.onstart) this.onstart(); });
        this.socket.on('close', () => { if(this.onstop) this.onstop(); });
    }

    stop() {
        this.socket.end();
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
