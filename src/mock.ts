import * as transport from './transport';
import * as server from './server';
import * as client from './client';
import {BackoffRetry} from './backoff';
import {Json as Serializer} from './serialize';


class MockConnection extends transport.Connection {
    connectedTo: MockClientTransport;
    send(msg) {
        this.connectedTo.receive(msg);
    }
    receive(msg) {
        this.onmessage(msg);
    }
}


class MockTransport extends transport.Transport {
    start(success) {
        success();
    }
    stop() {}
    createConnection(clientTr) {
        var conn = new MockConnection();
        conn.connectedTo = clientTr;
        clientTr.connectedTo = conn;
        this.onconnection(conn);
    }
}


class MockClientTransport extends transport.ClientTransport {
    connectedTo: MockConnection;
    receive(msg) {
        this.onmessage(msg);
    }
    send(msg) {
        this.connectedTo.receive(msg);
    }
    start(success) {
        success();
    }
    stop() {}
}


export function createServer() {
    var s = new server.Server({
        backoff: new BackoffRetry,
        transport: new MockTransport({
            serializer: new Serializer,
        }),
    });
    return s;
}

export function createClient() {
    var c = new client.Client({
        backoff: new BackoffRetry,
        transport: new MockTransport({
            serializer: new Serializer,
        }),
    });
    return c;
}