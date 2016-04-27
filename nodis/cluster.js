"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var server_1 = require('./server');
var client_1 = require('./client');
var core = require('./core');
var aol = require('./aol');
var api = require('./api');
var path = require('path');
var util = require('./util');
var Partition = (function () {
    function Partition(min, max) {
        // A list of peer nodes that have partitions overlapping with this partition.
        // But the overlap does not have to be complete, i.e. only part of the partition may overlap.
        this.replicas = [];
        this.min = min;
        this.max = max;
    }
    Partition.prototype.getReplicaNodes = function (hash) {
        var nodes = [];
        for (var _i = 0, _a = this.replicas; _i < _a.length; _i++) {
            var replica = _a[_i];
            var partition = replica[0], node = replica[1];
            if ((hash >= partition.min) && (hash < partition.max)) {
                nodes.push(node);
            }
        }
        return nodes;
    };
    Partition.prototype.addToReplicaList = function (node) {
        for (var _i = 0, _a = node.hashspace.partitions; _i < _a.length; _i++) {
            var partition = _a[_i];
            if ((partition.min >= this.min) && (partition.min < this.max)) {
                this.replicas.push([partition, node]);
                return;
            }
            if ((partition.max <= this.max) && (partition.max > this.min)) {
                this.replicas.push([partition, node]);
            }
        }
    };
    return Partition;
}());
exports.Partition = Partition;
var Hashspace = (function () {
    function Hashspace() {
        this.partitions = [];
    }
    Hashspace.hash = function (key) {
        return util.MurmurHashV3(key) % Hashspace.MAX;
    };
    Hashspace.createFromTuples = function (tuples) {
        var hashspace = new Hashspace;
        for (var _i = 0, tuples_1 = tuples; _i < tuples_1.length; _i++) {
            var tuple = tuples_1[_i];
            if (!(tuple instanceof Array))
                throw Error('Invalid partition tuple.');
            if (tuple.length != 2)
                throw Error('Invalid partition tuple.');
            var min = tuple[0], max = tuple[1];
            if (typeof min != 'number')
                throw Error("Partition limits must be numbers \"" + min + "\".");
            if (typeof max != 'number')
                throw Error("Partition limits must be numbers \"" + max + "\".");
            if ((min < Hashspace.MIN) || (min > Hashspace.MAX))
                throw Error("Partition limit \"" + max + "\" out of bounds [" + Hashspace.MIN + ", " + Hashspace.MAX + "].");
            if ((max < Hashspace.MIN) || (max > Hashspace.MAX))
                throw Error("Partition limit \"" + max + "\" out of bounds [" + Hashspace.MIN + ", " + Hashspace.MAX + "].");
            if (min > max)
                throw Error("Invalid partition interval [" + min + ", " + max + "].");
            hashspace.partitions.push(new Partition(min, max));
        }
        return hashspace;
    };
    Hashspace.prototype.findPartition = function (hash) {
        // TODO: make this binomial search.
        for (var _i = 0, _a = this.partitions; _i < _a.length; _i++) {
            var partition = _a[_i];
            if ((hash >= partition.min) && (hash < partition.max))
                return partition;
        }
        return null;
    };
    Hashspace.prototype.hasHash = function (hash) {
        return !!this.findPartition(hash);
    };
    Hashspace.prototype.addToReplicaList = function (node) {
        for (var _i = 0, _a = this.partitions; _i < _a.length; _i++) {
            var partition = _a[_i];
            partition.addToReplicaList(node);
        }
    };
    Hashspace.MIN = 0; // Inclusive.
    Hashspace.MAX = 1000000; // Not inclusive.
    return Hashspace;
}());
exports.Hashspace = Hashspace;
// Represents a node in a cluster.
var Node = (function () {
    function Node(name, opts) {
        if (!name || (typeof name != 'string'))
            throw Error('Invalid node name.');
        this.name = name;
        if (!opts.ip || (typeof opts.ip != 'string'))
            throw Error("Invalid IP for node \"" + name + "\".");
        this.ip = opts.ip;
        if (!opts.port || (typeof opts.port != 'number'))
            throw Error("Invalid port for node \"" + name + "\".");
        this.port = opts.port;
        if (!opts.partition || !(opts.partition instanceof Array))
            throw Error("Invalid partition for node \"" + name + "\".");
        this.hashspace = Hashspace.createFromTuples(opts.partition);
    }
    return Node;
}());
exports.Node = Node;
// Represents a node that is on the this server.
var NodeLocal = (function (_super) {
    __extends(NodeLocal, _super);
    function NodeLocal(name, opts) {
        _super.call(this, name, opts);
        this['interface'] = '0.0.0.0'; // Interface to which this node's TCP server will bind.
        if (opts.interface) {
            if (typeof opts.interface == 'string')
                this.interface = opts.interface;
            else
                throw Error('Invalid TCP interface: ' + opts.interface);
        }
    }
    NodeLocal.prototype.createCore = function (opts) {
        if (!opts.dir || (typeof opts.dir != 'string'))
            throw Error('Data folder not set.');
        if (!opts.data || (typeof opts.data != 'string'))
            throw Error('Data file not set.');
        if (!opts.error || (typeof opts.error != 'string'))
            throw Error('Error file not set.');
        var dir = path.resolve(opts.dir);
        this.core = new core.Core({
            storageEngine: new aol.StorageEngine.File({
                dir: dir,
                data: opts.data
            }),
            api: api,
            err: aol.AolFile.createFromFile(dir + "/" + opts.error)
        });
    };
    NodeLocal.prototype.createServer = function () {
        this.server = server_1.Server.create(this.port, this.interface);
    };
    NodeLocal.prototype.start = function (done) {
        this.startServer(function (err) {
        });
    };
    NodeLocal.prototype.startServer = function (done) {
        this.server.onerror = function (err) {
            done(err);
        };
        this.server.onstart = function () {
            done();
        };
        this.server.start();
    };
    return NodeLocal;
}(Node));
exports.NodeLocal = NodeLocal;
// Represents a node on a different server.
var NodeRemote = (function (_super) {
    __extends(NodeRemote, _super);
    function NodeRemote() {
        _super.apply(this, arguments);
    }
    NodeRemote.prototype.createClient = function () {
        this.client = new client_1.Client(this.port, this.ip);
    };
    NodeRemote.prototype.start = function () {
    };
    return NodeRemote;
}(Node));
exports.NodeRemote = NodeRemote;
var Cluster = (function () {
    function Cluster() {
        this.nodes = {};
    }
    Cluster.prototype.addNode = function (node) {
        this.nodes[node.name] = node;
        return this;
    };
    Cluster.prototype.setLocalNode = function (node) {
        this.addNode(node);
        this.me = node;
        node.server.onsocket = this.onSocket.bind(this);
        return this;
    };
    Cluster.prototype.start = function (done) {
        if (done === void 0) { done = util.noop; }
        this.me.start(function (err) {
            done(err);
        });
    };
    Cluster.prototype.onSocket = function (socket) {
    };
    Cluster.Factory = (function () {
        function class_1() {
        }
        class_1.createCluster = function (options) {
            if (typeof options != 'object')
                throw Error('Invalid options, not an object.');
            if (typeof options.core != 'object')
                throw Error('Options "core" not specified.');
            if (typeof options.cluster != 'object')
                throw Error('Options "cluster" not specified.');
            if (typeof options.cluster.name != 'string')
                throw Error('Cluster name not specified.');
            if (typeof options.cluster.me != 'string')
                throw Error('Cluster self node not specified.');
            if (typeof options.cluster.nodes != 'object')
                throw Error('Cluster nodes not specified.');
            var mycluster = new Cluster;
            mycluster.name = options.cluster.name;
            for (var node_name in options.cluster.nodes) {
                var is_local = node_name === options.cluster.me;
                var nodeopts = options.cluster.nodes[node_name];
                var node;
                if (is_local) {
                    node = new NodeLocal(node_name, nodeopts);
                    node.createCore(options.core);
                    node.createServer();
                    mycluster.me = node;
                    mycluster.setLocalNode(node);
                }
                else {
                    node = new NodeRemote(node_name, nodeopts);
                    node.createClient();
                    mycluster.addNode(node);
                }
            }
            return mycluster;
        };
        class_1.defaults = {
            core: {
                dir: process.cwd() + '/data',
                data: 'data.json.log',
                error: 'error.json.log'
            },
            cluster: {
                name: 'default',
                me: 'dc1_rack1_node1',
                nodes: {
                    'dc1_rack1_node1': {
                        'interface': '0.0.0.0',
                        ip: '127.0.0.1',
                        port: 1337,
                        partition: [[Hashspace.MIN, Hashspace.MAX]]
                    }
                }
            }
        };
        return class_1;
    }());
    return Cluster;
}());
exports.Cluster = Cluster;
