import {noop} from './util';
import * as server from './server';
import * as transport from './transport';
import * as backoff from './backoff';


export interface IClientOpts extends server.IServerOpts {
    transport?: transport.IClientTransport;
    backoff?: backoff.IBackoff;
}

export interface IClient extends server.IServer, server.ISocket {}

export class Client extends server.Server implements IClient {

    protected transport: transport.ClientTransport;

    protected opts: IClientOpts;

    onmessage: server.TcallbackOnSocketMessage = noop;

    send(message: server.TMessage) {
        this.opts.transport.send(message);
    }
}
