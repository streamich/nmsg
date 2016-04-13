import {EventEmitter} from 'events';
import {IClientTransport, TcallbackOnMessage} from './transport';


export interface IClientOpts {
    transport?: IClientTransport;
}


export interface IClient {
    onmessage: TcallbackOnMessage;
    send(data: string|Buffer|Blob|ArrayBuffer);
}


export class Client extends EventEmitter implements IClient {

    onmessage: TcallbackOnMessage = null;

    transport: IClientTransport;

    constructor(opts: IClientOpts) {
        super();

        if(opts.transport) this.transport = opts.transport;
    }

    send(data: string|Buffer) {
        this.transport.send(data);
    }

    start() {
        this.transport.start();
    }

    // Just a proxy for better naming.
    connect() {
        this.start();
    }
}
