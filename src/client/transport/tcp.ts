import {IClientTransport} from '../transport';
import {Transform} from 'stream';
import * as net from 'net';
import * as message from '../../message';
import {extend} from '../../util';
import {Backoff} from '../../backoff';


export interface ITransportOpts {
    host?: string;
    port?: number;
}


export class Transport extends Transform implements IClientTransport {

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

    start(backoff: Backoff) {
        backoff.attempt((success, error) => {
            this.socket = new net.Socket;
            this.in = new message.LPDecoderStream(this.socket);
            this.out = new message.LPEncoderStream(this.socket);
            this.pipe(this.out);
            // this.in.pipe(this);

            this.in.on('data', (buf) => {
                if(this.onmessage) this.onmessage(buf);
            });

            this.socket.on('error', error);

            this.socket.on('close', () => { if(this.onstop) this.onstop(); });

            this.socket.connect(this.opts.port, this.opts.host, () => {
                if(this.onstart) this.onstart();
                success();
            });
        });
    }

    stop() {
        this.socket.end();
    }

    _transform(data, encoding, callback) {
        callback(null, data);
    }
}
