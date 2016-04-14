import {EventEmitter} from 'events';
import {IClientTransport} from './transport';
import {ISocket, IServer} from '../server/server';
import {Serializer} from '../serialize';
import {extend} from '../util';
import {Backoff} from '../backoff';


export interface IClientOpts {
    transport?: IClientTransport;
    serializer?: Serializer;
    backoff?: Backoff;
}


export class Client extends EventEmitter implements ISocket, IServer {

    static defaultOpts: IClientOpts = {};

    onmessage: TcallbackOnMessage;
    onstart: TcallbackOnStart;
    onstop: TcallbackOnStop;

    protected opts: IClientOpts = {};

    constructor(opts: IClientOpts = {}) {
        super();
        this.opts = extend({}, Client.defaultOpts, opts);
    }

    send(msg) {
        var buf = this.opts.serializer.pack(msg);
        this.opts.transport.send(buf);
    }

    start(): this {
        var transport = this.opts.transport;
        transport.onmessage = (buf: string|Buffer) => {
            var msg = this.opts.serializer.unpack(buf);
            if(this.onmessage) this.onmessage(msg);
        };
        transport.onstart   = () => { if(this.onstart) this.onstart(); };
        transport.onstop    = () => { if(this.onstop) this.onstop(); };
        transport.start(this.opts.backoff);
        return this;
    }

    stop() {
        this.opts.transport.stop();
    }
}


import {BackoffExponential} from '../backoff';
import {Msgpack as MsgpackSerializer} from '../serialize';
import {Transport as TcpTransport, ITransportOpts} from './transport/tcp';
import {Router} from '../rpc';

module factory {
    export interface ITcpOpts extends ITransportOpts {}

    export class Tcp extends Client {
        router = new Router(this);

        constructor(opts: ITcpOpts) {
            super({
                transport: new TcpTransport(opts),
                serializer: new MsgpackSerializer,
                backoff: new BackoffExponential,
            });
        }
    }
}

export import factory = factory;
