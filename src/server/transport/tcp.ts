import * as net from 'net';
import * as transport from '../transport';
import {extend} from '../../util';
import * as transform from '../../stream/transform';


export class Connection extends transport.ConnectionStream {
    in: transform.LPDecoderStream;
    out: transform.LPEncoderStream;
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

    server: net.Server;

    opts: ITransportOpts;

    constructor(opts: ITransportOpts = {}) {
        super(extend({}, Transport.defaultOpts, opts));
    }

    start() {
        this.server = net.createServer();

        this.server.on('connection', (socket: net.Socket) => {
            var conn = new Connection;
            conn.in = new transform.LPDecoderStream(socket);
            conn.out = new transform.LPEncoderStream(socket);
            conn.resume();
            this.emit('connection', conn);
        });

        this.server.on('error', (err) => { this.emit('error', err); });

        this.server.listen({
            host: this.opts.host,
            port: this.opts.port,
        }, () => { this.emit('started'); });
    }
}
