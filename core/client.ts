import {noop} from './util';
import * as server from './server';
import * as transport from './transport';
import * as backoff from './backoff';
import * as rpc from '../rpc/rpc';


export interface IClientOpts extends server.IServerOpts {
    transport?: transport.IClientTransport;
    backoff?: backoff.IBackoff;
}

export interface IClient extends server.IServer, server.ISocket {}

export class Client extends server.Server implements IClient {

    protected transport: transport.ClientTransport;

    protected opts: IClientOpts;

    router = new rpc.Router;

    onmessage: server.TcallbackOnSocketMessage = noop;

    constructor(opts: IClientOpts = {}) {
        super(opts);
        this.opts.transport.onmessage = (msg) => {
            this.onmessage(msg);
            this.router.onmessage(msg);
        };
        this.router.send = this.send.bind(this);
    }

    send(message: server.TMessage): this {
        this.opts.transport.send(message);
        return this;
    }
}
