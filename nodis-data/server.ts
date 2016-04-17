import {Server} from '../nmsg-core/server';
import {createServer} from '../nmsg-tcp/server';


export class NodisServer {
    server: Server;

    start() {
        var sopts = {};
        this.server = createServer(sopts);
    }
}


export interface IcreateServerOpts {
    port: number;
    host: string;
    aof: string;
}

export function createServer(options: IcreateServerOpts) {


}

