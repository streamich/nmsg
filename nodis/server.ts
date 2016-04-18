import {TransportTcp} from '../nmsg-tcp/server';
import * as server from '../nmsg-core/server';
import {Msgpack as Serializer} from '../nmsg-tcp/serialize';
import {BackoffExponential as Backoff} from '../nmsg-core/backoff';
import * as core from './core';
import * as path from 'path';
import * as aol from './aol';
import {api} from './api';
import {extend} from './util';


export class NodisServer extends server.Server {

    core: core.Core;

    onEventBound = this.onEvent.bind(this);

    onsocket = (socket) => {
        socket.router.onevent = this.onEventBound;
    };

    onEvent(event: string, args: any[]) {
        this.core.exec(event, args);
        return true; // Stops any further routing.
    }
}


namespace builder {
    export interface IcreateServerOptions {
        transport: {
            host: string;
            port: number;
        },
        persistance: {
            dir: string;
            log: string;
        }
    }

    export var defaults: IcreateServerOptions = {
        transport: {
            host: '0.0.0.0',    // Listen to all hosts.
            port: 1337,
        },
        persistance: {
            dir: __dirname + '/data',
            log: 'data.json.log',
        }
    };

    export function createServer(options: IcreateServerOptions) {
        var opts = extend({} as IcreateServerOptions, defaults);
        if(options.transport)   opts.transport      = extend(opts.transport, options.transport);
        if(options.persistance) opts.persistance    = extend(opts.persistance, options.persistance);


        // Create storage engine.
        var engineOpts = {
            dir: path.resolve(opts.persistance.dir),
            log: opts.persistance.log,
        };
        var engine = new aol.StorageEngine.File(engineOpts);


        // Create Nodis core.
        var nodiscore = new core.Core({
            storageEngine: engine,
            api: api,
        });


        // Create transport.
        var topts = {
            host: opts.transport.host,
            port: opts.transport.port,
            serializer: new Serializer,
        };
        var transport = new TransportTcp(topts);


        // Create server.
        var sopts = {
            transport: transport,
            backoff: new Backoff,
        };
        var server = new NodisServer(sopts);
        server.core = nodiscore;
        return server;
    }
}

export var createServer = builder.createServer;
