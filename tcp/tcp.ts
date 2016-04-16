import {TransportTcp, ITransportTcpOpts} from './server';
import {ClientTransportTcp, IClientTransportTcpOpts} from './client';
import {Server} from '../core/server';
import {Client} from '../core/client';
import {ISerializer} from '../core/serialize';
import {Msgpack as Serializer} from './serialize';
import {BackoffExponential as Backoff, IBackoff} from '../core/backoff';


export interface IcreateServerOpts {
    host?: string,
    port?: number,
    serializer?: ISerializer;
    backoff?: IBackoff;
}

export interface IcreateClientOpts extends IcreateServerOpts {}

function fill_opts(opts: IcreateServerOpts | IcreateClientOpts, host = '0.0.0.0') {
    if(typeof opts === 'number')
        opts = {port: opts} as any as IcreateServerOpts;

    if(!opts.host)          opts.host = host;
    if(!opts.port)          opts.port = 8080;
    if(!opts.serializer)    opts.serializer = new Serializer;
    if(!opts.backoff)       opts.backoff = new Backoff;
    return opts;
} 


export function createServer(opts: IcreateServerOpts = {}): Server {
    opts = fill_opts(opts);
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
    opts = fill_opts(opts, '127.0.0.1');
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
// export var createConnection = createClient;
