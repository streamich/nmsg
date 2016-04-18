import * as tcp from '../nmsg-tcp/tcp';
import {Client} from '../nmsg-core/client';


export class NodisClient {
    tcp: Client;

    constructor(port = 1337, host = '127.0.0.1') {
        this.tcp = tcp.createClient({
            port: port,
            host: host,
        });
    }

    cmd(...args: any[]) {
        this.tcp.router.emit.apply(this.tcp.router, args);
    }

    on(...args: any[]) {
        this.tcp.router.on.apply(this.tcp.router, args);
    }

    start() {
        this.tcp.start();
        return this;
    }
}


export function createClient(port?, host?) {
    return new NodisClient(port, host);
}
