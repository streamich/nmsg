import {extend} from '../core/util';
import {TMessage} from '../core/server';
import * as transport from '../core/transport';
import * as backoff from '../core/backoff';
import * as stream from './stream';
import * as net from 'net';


export interface IClientTransportTcpOpts extends transport.ITransportOpts {
    host?: string;
    port?: number;
}

export class ClientTransportTcp extends transport.ClientTransport {

    static defaults: IClientTransportTcpOpts = {
        host: '127.0.0.1',
        port: 8080,
        serializer: null,
    };

    protected socket: net.Socket;
    protected out: stream.LPEncoderStream;
    protected 'in': stream.LPDecoderStream;

    opts: IClientTransportTcpOpts;
    
    constructor(opts: IClientTransportTcpOpts = {}) {
        super(extend<any>({}, ClientTransportTcp.defaults, opts));

        // This allows to "write" to socket, even before its connected.
        this.createStreams();
    }

    protected createStreams() {
        this.socket = new net.Socket;
        this.out = new stream.LPEncoderStream;
        this.in = new stream.LPDecoderStream;
        this.out.on('error', (err) => { this.onerror(err); });
        this.in.on('error', (err) => { this.onerror(err); });
    }

    start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError) {
        if(!this.socket) this.createStreams();
        this.out.pipe(this.socket);
        this.socket.pipe(this.in);

        this.in.on('data', this.onMessage.bind(this));
        this.socket
            .on('error', (err) => {
                this.socket = null;
                this.onerror(err);
                error();
            })
            .on('close', () => {
                this.socket = null;
                this.onstop();
            })
            .connect(this.opts.port, this.opts.host, () => {
                this.onstart();
                success();
            });
    }

    stop() {
        this.socket.end();
    }

    protected onMessage(buf: Buffer) {
        var message = this.unserialize(buf);
        this.onmessage(message);
    }

    send(message: TMessage) {
        var data = this.serialize(message);
        try {
            this.out.write(data);
        } catch(err) {
            this.onerror(err);
        }
    }
}
