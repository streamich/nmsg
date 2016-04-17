import {noop} from './util';
import * as server from './server';
import * as transport from './transport';
import * as backoff from './backoff';
import * as rpc from '../nmsg-rpc/rpc';
import {Queue} from './queue';


export interface IClientOpts extends server.IServerOpts {
    transport?: transport.IClientTransport;
    backoff?: backoff.IBackoff;
    queue?: number;
}

export interface IClient extends server.IServer, server.ISocket {}

export class Client extends server.Server implements IClient {

    protected transport: transport.ClientTransport;

    protected opts: IClientOpts;

    protected queue: Queue;

    router = new rpc.Router;

    onmessage: server.TcallbackOnSocketMessage = noop;

    constructor(opts: IClientOpts = {}) {
        super(opts);
        this.queue = new Queue(opts.queue);
        this.opts.transport.onmessage = (msg) => {
            this.onmessage(msg);
            this.router.onmessage(msg);
        };
        this.router.send = this.send.bind(this);
    }

    protected onStart() {
        super.onStart();
        this.drainQueue();
    }

    protected drainQueue() {
        var msg;
        var transport = this.opts.transport;
        while(msg = this.queue.shift()) transport.send(msg);
    }

    send(message: server.TMessage): this {
        if(this.isStarted) this.opts.transport.send(message);
        else this.queue.add(message);
        return this;
    }
}
