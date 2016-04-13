import * as net from 'net';
import * as transport from '../transport';
import {extend} from '../../util';
import * as message from '../../message';


export class Connection extends transport.ConnectionStream {
    in: message.LPDecoderStream;
    out: message.LPEncoderStream;
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

    start() {
        this.server = net.createServer();

        this.server.on('connection', (socket: net.Socket) => {
            var conn = new Connection;
            conn.in = new message.LPDecoderStream(socket);
            conn.out = new message.LPEncoderStream(socket);
            conn.resume();
            this.emit('connection', conn);
        });

        this.server.on('error',     (err) => { this.emit('error', err); });
        this.server.on('stop',      () => { this.emit('stop'); });

        this.server.listen({
            host: this.opts.host,
            port: this.opts.port,
        }, () => { this.emit('start'); });
    }

    stop() {
        this.server.close();
    }
}
