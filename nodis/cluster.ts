import {Server} from './server';
import {Client} from './client';
import {Core} from './core';
import * as core from './core';
import * as aol from './aol';
import * as api from './api';
import * as path from 'path';
import * as util from './util';


export class Partition {

    min: number;    // Inclusive
    max: number;    // Not inclusive

    // A list of peer nodes that have partitions overlapping with this partition.
    // But the overlap does not have to be complete, i.e. only part of the partition may overlap.
    replicas: [Partition, Node][] = [];

    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    getReplicaNodes(hash: number): Node[] {
        var nodes = [];
        for(var replica of this.replicas) {
            var [partition, node] = replica;
            if((hash >= partition.min) && (hash < partition.max)) {
                nodes.push(node);
            }
        }
        return nodes;
    }

    addToReplicaList(node: Node) {
        for(var partition of node.hashspace.partitions) {
            if((partition.min >= this.min) && (partition.min < this.max)) {
                this.replicas.push([partition, node]);
                return;
            }
            if((partition.max <= this.max) && (partition.max > this.min)) {
                this.replicas.push([partition, node]);
            }
        }
    }
}


export class Hashspace {
    static MIN = 0;             // Inclusive.
    static MAX = 1000000;       // Not inclusive.

    static hash(key: string): number {
        return util.MurmurHashV3(key) % Hashspace.MAX;
    }

    static createFromTuples(tuples: [number, number][]): Hashspace {
        var hashspace = new Hashspace;
        for(var tuple of tuples) {
            if(!(tuple instanceof Array)) throw Error('Invalid partition tuple.');
            if(tuple.length != 2) throw Error('Invalid partition tuple.');
            var [min, max] = tuple;
            if(typeof min != 'number') throw Error(`Partition limits must be numbers "${min}".`);
            if(typeof max != 'number') throw Error(`Partition limits must be numbers "${max}".`);
            if((min < Hashspace.MIN) || (min > Hashspace.MAX)) throw Error(`Partition limit "${max}" out of bounds [${Hashspace.MIN}, ${Hashspace.MAX}].`);
            if((max < Hashspace.MIN) || (max > Hashspace.MAX)) throw Error(`Partition limit "${max}" out of bounds [${Hashspace.MIN}, ${Hashspace.MAX}].`);
            if(min > max) throw Error(`Invalid partition interval [${min}, ${max}].`);
            hashspace.partitions.push(new Partition(min, max));
        }
        return hashspace;
    }

    partitions: Partition[] = [];

    findPartition(hash: number) {
        // TODO: make this binomial search.
        for(var partition of this.partitions) {
            if((hash >= partition.min) && (hash < partition.max)) return partition;
        }
        return null;
    }

    hasHash(hash: number): boolean {
        return !!this.findPartition(hash);
    }

    addToReplicaList(node: Node) {
        for(var partition of this.partitions) partition.addToReplicaList(node);
    }
}


export interface INodeOpts {
    'interface'?: string;           // Interface to which to bind for the local node.
    ip: string;                     // Public IP.
    port: number;                   // Port to bind to.
    partition: [number, number][];   // List of tuples representing partition ranges.
}


// Represents a node in a cluster.
export abstract class Node {
    name: string;

    ip: string;

    port: number;

    hashspace: Hashspace;

    constructor(name: string, opts: INodeOpts) {
        if(!name || (typeof name != 'string')) throw Error('Invalid node name.');
        this.name = name;

        if(!opts.ip || (typeof opts.ip != 'string')) throw Error(`Invalid IP for node "${name}".`);
        this.ip = opts.ip;

        if(!opts.port || (typeof opts.port != 'number')) throw Error(`Invalid port for node "${name}".`);
        this.port = opts.port;

        if(!opts.partition || !(opts.partition instanceof Array)) throw Error(`Invalid partition for node "${name}".`);
        this.hashspace = Hashspace.createFromTuples(opts.partition);
    }

    abstract start(done: ICallback);
}

// Represents a node that is on the this server.
export class NodeLocal extends Node {

    'interface': string = '0.0.0.0'; // Interface to which this node's TCP server will bind.

    server: Server;

    core: Core;

    constructor(name: string, opts: INodeOpts) {
        super(name, opts);
        if(opts.interface) {
            if(typeof opts.interface == 'string') this.interface = opts.interface;
            else throw Error('Invalid TCP interface: ' + opts.interface);
        }
    }

    createCore(opts: IcoreOptions) {
        if(!opts.dir || (typeof opts.dir != 'string')) throw Error('Data folder not set.');
        if(!opts.data || (typeof opts.data != 'string')) throw Error('Data file not set.');
        if(!opts.error || (typeof opts.error != 'string')) throw Error('Error file not set.');

        var dir = path.resolve(opts.dir);
        this.core = new core.Core({
            storageEngine: new aol.StorageEngine.File({
                dir: dir,
                data: opts.data,
            }),
            api: api as any as api.Iapi.Interface,
            err: aol.AolFile.createFromFile(`${dir}/${opts.error}`),
        });
    }
    
    createServer() {
        this.server = Server.create(this.port, this.interface);
    }

    start(done) {
        this.startServer((err) => {

        });
    }

    startServer(done) {
        this.server.onerror = (err) => {
            done(err);
        };
        this.server.onstart = () => {
            done();
        };
        this.server.start();
    }
}

// Represents a node on a different server.
export class NodeRemote extends Node {

    client: Client;

    createClient() {
        this.client = new Client(this.port, this.ip);
    }

    start() {

    }
}


export interface INodeHeartbeat {
    latency: number;
    keys: number;
    ts: number;
}

export interface IcoreOptions {
    dir: string;
    data: string;
    error: string;
}

export interface IcreateClusterOptions {
    core: IcoreOptions,
    cluster: {
        name: string;
        me: string;
        nodes: {
            [s: string]: INodeOpts;
        };
    }
}

export class Cluster {

    static Factory = class {

        static defaults: IcreateClusterOptions = {
            core: {
                dir: process.cwd() + '/data',
                data: 'data.json.log',
                error: 'error.json.log',
            },
            cluster: {
                name: 'default',
                me: 'dc1_rack1_node1',
                nodes: {
                    'dc1_rack1_node1': {
                        'interface': '0.0.0.0',
                        ip: '127.0.0.1',
                        port: 1337,
                        partition: [[Hashspace.MIN, Hashspace.MAX]],
                    }
                }
            }
        };

        static createCluster(options: IcreateClusterOptions) {
            if(typeof options != 'object') throw Error('Invalid options, not an object.');
            if(typeof options.core != 'object') throw Error('Options "core" not specified.');
            if(typeof options.cluster != 'object') throw Error('Options "cluster" not specified.');

            if(typeof options.cluster.name != 'string') throw Error('Cluster name not specified.');
            if(typeof options.cluster.me != 'string') throw Error('Cluster self node not specified.');
            if(typeof options.cluster.nodes != 'object') throw Error('Cluster nodes not specified.');

            var mycluster = new Cluster;
            mycluster.name = options.cluster.name;

            for(var node_name in options.cluster.nodes) {
                var is_local = node_name === options.cluster.me;
                var nodeopts = options.cluster.nodes[node_name];
                var node;
                if(is_local) {
                    node = new NodeLocal(node_name, nodeopts);
                    node.createCore(options.core);
                    node.createServer();
                    mycluster.me = node;
                    mycluster.setLocalNode(node);
                } else {
                    node = new NodeRemote(node_name, nodeopts);
                    node.createClient();
                    mycluster.addNode(node);
                }
            }

            return mycluster;
        }
    };

    name: string;

    me: NodeLocal;

    nodes: {[s: string]: Node} = {};

    addNode(node: Node): this {
        this.nodes[node.name] = node;
        return this;
    }

    setLocalNode(node: NodeLocal): this {
        this.addNode(node);
        this.me = node;
        node.server.onsocket = this.onSocket.bind(this);
        return this;
    }

    start(done = util.noop as ICallback) {
        this.me.start((err) => {
            done(err);
        });
    }

    onSocket(socket) {

    }
}

