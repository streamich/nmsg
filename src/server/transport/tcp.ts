import * as net from 'net';
import * as transport from '../transport';
import {extend} from '../../util';
import * as message from '../../message';
import {Backoff} from '../../backoff';


export class Connection extends transport.ConnectionStream {
    in: message.LPDecoderStream;
    out: message.LPEncoderStream;

    constructor(socket: net.Socket) {
        super();

        this.in = new message.LPDecoderStream(socket);
        this.out = new message.LPEncoderStream(socket);
        this.pipe(this.out);
        this.in.pipe(this);

        this.in.on('data', (buf) => {
            if(this.onmessage) this.onmessage(buf);
        });
    }
}


export interface ITransportOpts extends transport.ITransportOpts {
    host?: string;
    port?: number;
}


export class Transport extends transport.Transport {

    static defaultOpts: ITransportOpts = {
        host: '127.0.0.1',
        port: 8080,
    };

    protected server: net.Server;

    opts: ITransportOpts;

    constructor(opts: ITransportOpts = {}) {
        super(extend({}, Transport.defaultOpts, opts));
    }

    start(backoff: Backoff) {
        backoff.attempt((success, error) => {
            this.server = net.createServer();

            this.server.on('connection', (socket: net.Socket) => {
                var conn = new Connection(socket);
                conn.resume();
                this.emit('connection', conn);
            });

            this.server.on('error', (err) => {
                this.server.close();
                this.emit('error', err);
                error();
            });
            this.server.on('stop', () => { this.emit('stop'); });

            this.server.listen({
                host: this.opts.host,
                port: this.opts.port,
            }, () => {
                this.emit('start');
                success();
            });
        });
    }

    stop() {
        this.server.close();
    }
}
