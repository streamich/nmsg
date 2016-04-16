import {TransportTcp, ITransportTcpOpts} from './server';
import {ClientTransportTcp, IClientTransportTcpOpts} from './client';
import {Server} from '../node_modules/nmsg/src/server';
import {Client} from '../node_modules/nmsg/src/client';
import {ISerializer} from '../node_modules/nmsg/src/serialize';
import {Msgpack as Serializer} from './serialize';
import {BackoffExponential as Backoff, IBackoff} from '../node_modules/nmsg/src/backoff';


export interface IcreateServerOpts {
    host?: string,
    port?: number,
    serializer?: ISerializer;
    backoff?: IBackoff;
}

export interface IcreateClientOpts extends IcreateServerOpts {}

function fill_opts(opts: IcreateServerOpts) {
    if(!opts.host)          opts.host = '127.0.0.1';
    if(!opts.port)          opts.port = 8080;
    if(!opts.serializer)    opts.serializer = new Serializer;
    if(!opts.backoff)       opts.backoff = new Backoff;
} 


export function createServer(opts: IcreateServerOpts = {}): Server {
    fill_opts(opts);
    var topts: ITransportTcpOpts = {
        host: opts.host, 
        port: opts.port,
        serializer: opts.serializer,
    };
    var myserver = new Server({
        transport: new TransportTcp(topts),
        backoff: opts.backoff,
    });
    return myserver;
}


export function createClient(opts: IcreateClientOpts = {}): Client {
    fill_opts(opts);
    var topts: IClientTransportTcpOpts = {
        host: opts.host,
        port: opts.port,
        serializer: opts.serializer,
    };
    var myclient = new Client({
        transport: new ClientTransportTcp(topts),
        backoff: opts.backoff,
    });
    return myclient;
}
export var createConnection = createClient;
