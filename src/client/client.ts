import {EventEmitter} from 'events';
import {IClientTransport} from './transport';
import {ISocket, IServer} from '../server/server';
import {Serializer} from '../serialize';
import {extend} from '../util';


export interface IClientOpts {
    transport?: IClientTransport;
    serializer?: Serializer;
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

    start() {
        var transport = this.opts.transport;
        transport.onmessage = (buf: string|Buffer) => {
            var msg = this.opts.serializer.unpack(buf);
            if(this.onmessage) this.onmessage(msg);
        };
        transport.onstart   = () => { if(this.onstart) this.onstart(); };
        transport.onstop    = () => { if(this.onstop) this.onstop(); };
        transport.start();
    }

    stop() {
        this.opts.transport.stop();
    }
}
