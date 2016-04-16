import {TMessage} from '../node_modules/nmsg/src/server';
import * as transport from '../node_modules/nmsg/src/transport';
import * as backoff from '../node_modules/nmsg/src/backoff';
import * as stream from './stream';
import * as net from 'net';



export interface IClientTransportTcpOpts extends transport.ITransportOpts {
    host?: string;
    port?: number;
}

export class ClientTransportTcp extends transport.ClientTransport {

    protected socket: net.Socket;

    protected 'in': stream.LPDecoderStream;
    protected out:  stream.LPEncoderStream;

    opts: IClientTransportTcpOpts = {
        host: '127.0.0.1',
        port: 8080,
        serializer: null,
    };

    start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError) {
        this.socket = new net.Socket;
        this.out = new stream.LPEncoderStream(this.socket);
        this.in = new stream.LPDecoderStream(this.socket);
        this.in.on('data', this.onMessage.bind(this));
        this.socket
            .on('error', (err) => {
                this.onerror(err);
                error();
            })
            .on('close', () => { this.onstop(); })
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
        this.out.write(data);
    }
}
