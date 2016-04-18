/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var server_1 = __webpack_require__(1);
	var server = __webpack_require__(7);
	var serialize_1 = __webpack_require__(10);
	var backoff_1 = __webpack_require__(12);
	var core = __webpack_require__(13);
	var path = __webpack_require__(16);
	var aol = __webpack_require__(17);
	var api = __webpack_require__(20);
	var util_1 = __webpack_require__(19);
	var NodisServer = (function (_super) {
	    __extends(NodisServer, _super);
	    function NodisServer() {
	        var _this = this;
	        _super.apply(this, arguments);
	        this.onEventBound = this.onEvent.bind(this);
	        this.onsocket = function (socket) {
	            socket.router.onevent = _this.onEventBound;
	        };
	    }
	    NodisServer.prototype.onEvent = function (event, args) {
	        this.core.exec(event, args);
	        return true; // Stops any further routing.
	    };
	    return NodisServer;
	}(server.Server));
	exports.NodisServer = NodisServer;
	var builder;
	(function (builder) {
	    builder.defaults = {
	        transport: {
	            host: '0.0.0.0',
	            port: 1337
	        },
	        persistance: {
	            dir: __dirname + '/data',
	            log: 'data.json.log'
	        }
	    };
	    function createServer(options) {
	        var opts = util_1.extend({}, builder.defaults);
	        if (options.transport)
	            opts.transport = util_1.extend(opts.transport, options.transport);
	        if (options.persistance)
	            opts.persistance = util_1.extend(opts.persistance, options.persistance);
	        // Create storage engine.
	        var engineOpts = {
	            dir: path.resolve(opts.persistance.dir),
	            log: opts.persistance.log
	        };
	        var engine = new aol.StorageEngine.File(engineOpts);
	        // Create Nodis core.
	        var nodiscore = new core.Core({
	            storageEngine: engine,
	            api: api
	        });
	        // Create transport.
	        var topts = {
	            host: opts.transport.host,
	            port: opts.transport.port,
	            serializer: new serialize_1.Msgpack
	        };
	        var transport = new server_1.TransportTcp(topts);
	        // Create server.
	        var sopts = {
	            transport: transport,
	            backoff: new backoff_1.BackoffExponential
	        };
	        var server = new NodisServer(sopts);
	        server.core = nodiscore;
	        return server;
	    }
	    builder.createServer = createServer;
	})(builder || (builder = {}));
	exports.createServer = builder.createServer;

	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(2);
	var transport = __webpack_require__(3);
	var stream = __webpack_require__(4);
	var net = __webpack_require__(6);
	var server_1 = __webpack_require__(7);
	var serialize_1 = __webpack_require__(10);
	var backoff_1 = __webpack_require__(12);
	var ConnectionTcp = (function (_super) {
	    __extends(ConnectionTcp, _super);
	    function ConnectionTcp() {
	        _super.apply(this, arguments);
	    }
	    ConnectionTcp.prototype.setSocket = function (socket) {
	        var _this = this;
	        this.out = new stream.LPEncoderStream(socket);
	        this.in = new stream.LPDecoderStream(socket);
	        this.in.on('data', function (buf) {
	            var message = _this.transport.unserialize(buf);
	            _this.onmessage(message);
	        });
	    };
	    ConnectionTcp.prototype.send = function (message) {
	        var data = this.transport.serialize(message);
	        this.out.write(data);
	    };
	    return ConnectionTcp;
	}(transport.Connection));
	exports.ConnectionTcp = ConnectionTcp;
	var TransportTcp = (function (_super) {
	    __extends(TransportTcp, _super);
	    function TransportTcp(opts) {
	        _super.call(this, util_1.extend({}, TransportTcp.defaults, opts));
	        this.ClassConnection = ConnectionTcp;
	    }
	    TransportTcp.prototype.start = function (success, error) {
	        var _this = this;
	        this.server = net.createServer();
	        this.server.on('connection', function (socket) {
	            var conn = _this.createConncetion();
	            conn.setSocket(socket);
	            _this.onconnection(conn);
	        });
	        this.server.on('error', function (err) {
	            _this.onerror(err);
	            _this.server.close();
	            error();
	        });
	        this.server.on('close', function () { _this.onstop(); });
	        this.server.listen({
	            host: this.opts.host,
	            port: this.opts.port
	        }, function () {
	            _this.onstart();
	            success();
	        });
	    };
	    TransportTcp.prototype.stop = function () {
	        this.server.close();
	    };
	    TransportTcp.defaults = {
	        host: '127.0.0.1',
	        port: 8080,
	        serializer: new serialize_1.Msgpack
	    };
	    return TransportTcp;
	}(transport.Transport));
	exports.TransportTcp = TransportTcp;
	function createServer(opts) {
	    if (opts === void 0) { opts = {}; }
	    var myopts = ((typeof opts === 'number') ? { port: opts } : opts);
	    // Transport options.
	    var topts = {
	        host: myopts.host || '0.0.0.0',
	        port: myopts.port || 8080,
	        serializer: myopts.serializer || new serialize_1.Msgpack
	    };
	    // Server options.
	    var sopts = {
	        transport: new TransportTcp(topts),
	        backoff: opts.backoff || new backoff_1.BackoffExponential
	    };
	    return new server_1.Server(sopts);
	}
	exports.createServer = createServer;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	function extend(obj1, obj2) {
	    var objs = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        objs[_i - 2] = arguments[_i];
	    }
	    if (typeof obj2 === 'object')
	        for (var i in obj2)
	            obj1[i] = obj2[i];
	    if (objs.length)
	        return extend.apply(null, [obj1].concat(objs));
	    else
	        return obj1;
	}
	exports.extend = extend;
	function noop() { }
	exports.noop = noop;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(2);
	var Connection = (function () {
	    function Connection() {
	        this.onmessage = util_1.noop;
	    }
	    return Connection;
	}());
	exports.Connection = Connection;
	var Transport = (function () {
	    function Transport(opts) {
	        this.opts = {
	            serializer: null
	        };
	        this.onconnection = util_1.noop;
	        this.onstart = util_1.noop;
	        this.onstop = util_1.noop;
	        this.onerror = util_1.noop;
	        this.opts = util_1.extend(this.opts, opts);
	    }
	    Transport.prototype.createConncetion = function () {
	        var connection = new this.ClassConnection;
	        connection.transport = this;
	        connection.serializer = this.opts.serializer;
	        return connection;
	    };
	    Transport.prototype.serialize = function (message) {
	        return this.opts.serializer.pack(message);
	    };
	    Transport.prototype.unserialize = function (data) {
	        return this.opts.serializer.unpack(data);
	    };
	    return Transport;
	}());
	exports.Transport = Transport;
	var ClientTransport = (function (_super) {
	    __extends(ClientTransport, _super);
	    function ClientTransport() {
	        _super.apply(this, arguments);
	        this.onmessage = util_1.noop;
	    }
	    return ClientTransport;
	}(Transport));
	exports.ClientTransport = ClientTransport;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var stream_1 = __webpack_require__(5);
	// Lenght-prefixed encoder, where each message gets prepended a 4-byte length value.
	var LPEncoder = (function () {
	    function LPEncoder() {
	    }
	    LPEncoder.prototype.encode = function (buf) {
	        var prefix = new Buffer(4);
	        prefix.writeInt32BE(buf.length, 0);
	        return Buffer.concat([prefix, buf]);
	    };
	    return LPEncoder;
	}());
	exports.LPEncoder = LPEncoder;
	var LPDecoder = (function () {
	    function LPDecoder() {
	        // Binary data stream with each packed prefixed by its length.
	        this.buf = new Buffer('');
	    }
	    LPDecoder.prototype.add = function (buf) {
	        this.buf = Buffer.concat([this.buf, buf]);
	        return this;
	    };
	    // Extract a packet if any.
	    LPDecoder.prototype.shift = function () {
	        if (this.buf.length < 5)
	            return null;
	        var length = this.buf.readInt32BE(0);
	        if (this.buf.length > length) {
	            var packet = this.buf.slice(4, length + 4);
	            this.buf = this.buf.slice(length + 4);
	            return packet;
	        }
	        else
	            return null;
	    };
	    return LPDecoder;
	}());
	exports.LPDecoder = LPDecoder;
	var LPEncoderStream = (function (_super) {
	    __extends(LPEncoderStream, _super);
	    function LPEncoderStream(destination) {
	        _super.call(this);
	        this.encoder = new LPEncoder;
	        if (destination)
	            this.pipe(destination);
	    }
	    LPEncoderStream.prototype._transform = function (chunk, encoding, callback) {
	        var buf = chunk;
	        if (typeof chunk === 'string')
	            buf = new Buffer(chunk, encoding);
	        var msg = this.encoder.encode(buf);
	        callback(null, msg);
	    };
	    return LPEncoderStream;
	}(stream_1.Transform));
	exports.LPEncoderStream = LPEncoderStream;
	// Splits stream into messages, which are prefixed by 4-byte length value.
	var LPDecoderStream = (function (_super) {
	    __extends(LPDecoderStream, _super);
	    function LPDecoderStream(source) {
	        _super.call(this);
	        this.decoder = new LPDecoder;
	        if (source)
	            source.pipe(this);
	    }
	    LPDecoderStream.prototype._transform = function (chunk, encoding, callback) {
	        var buf = chunk;
	        if (typeof chunk === 'string')
	            buf = new Buffer(chunk, encoding);
	        this.decoder.add(buf);
	        var msg;
	        while (msg = this.decoder.shift())
	            this.push(msg);
	        callback();
	    };
	    return LPDecoderStream;
	}(stream_1.Transform));
	exports.LPDecoderStream = LPDecoderStream;
	var Buffered = (function (_super) {
	    __extends(Buffered, _super);
	    function Buffered() {
	        _super.call(this);
	    }
	    Buffered.prototype._transform = function (chunk, encoding, callback) {
	        callback();
	    };
	    return Buffered;
	}(stream_1.Transform));
	exports.Buffered = Buffered;


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("net");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util_1 = __webpack_require__(2);
	var rpc = __webpack_require__(8);
	var Socket = (function () {
	    function Socket(connection) {
	        var _this = this;
	        this.router = new rpc.Router;
	        this.onmessage = util_1.noop;
	        this.connection = connection;
	        this.connection.onmessage = function (msg) {
	            _this.onmessage(msg, _this);
	            _this.router.onmessage(msg);
	        };
	        this.router.send = this.send.bind(this);
	    }
	    Socket.prototype.send = function (message) {
	        this.connection.send(message);
	        return this;
	    };
	    return Socket;
	}());
	exports.Socket = Socket;
	var Server = (function () {
	    function Server(opts) {
	        if (opts === void 0) { opts = {}; }
	        this.opts = {};
	        this.isStarted = false;
	        this.api = new rpc.Api;
	        this.onsocket = util_1.noop;
	        this.onstart = util_1.noop;
	        this.onstop = util_1.noop;
	        this.onerror = util_1.noop;
	        this.opts = util_1.extend(this.opts, opts);
	    }
	    Server.prototype.createSocket = function (connection) {
	        var socket = new Socket(connection);
	        socket.router.setApi(this.api);
	        return socket;
	    };
	    Server.prototype.onStart = function () {
	        this.isStarted = true;
	        this.onstart();
	    };
	    Server.prototype.onStop = function () {
	        this.isStarted = false;
	        this.onstop();
	    };
	    Server.prototype.onError = function (err) {
	        // TODO: handle various types of errors, start/stop/ reconnect logic, queue drain etc...
	        this.onerror(err);
	    };
	    Server.prototype.onConnection = function (connection) {
	        this.onsocket(this.createSocket(connection));
	    };
	    Server.prototype.tryStart = function (success, error) {
	        var transport = this.opts.transport;
	        transport.onconnection = this.onConnection.bind(this);
	        transport.onstart = this.onStart.bind(this);
	        transport.onstop = this.onStop.bind(this);
	        transport.onerror = this.onError.bind(this);
	        transport.start(success, error);
	    };
	    Server.prototype.start = function () {
	        this.opts.backoff.attempt(this.tryStart.bind(this));
	        return this;
	    };
	    Server.prototype.stop = function () {
	        this.opts.transport.stop();
	        return this;
	    };
	    return Server;
	}());
	exports.Server = Server;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(9);
	// export interface IFrameDataBuffered {
	// b: FrameList; // B for bulk.
	// [i: number]: FrameList;
	// }
	var Frame = (function () {
	    function Frame() {
	        this.data = null;
	        this.id = 0;
	        this.event = '';
	        this.args = [];
	        this.callbacks = [];
	        this.rid = 0; // Response ID.
	        this.func = 0; // Response callback position.
	        this.timeout = Frame.timeout; // Timeout in seconds for how long to wait for callbacks.
	    }
	    Frame.getNextId = function () {
	        return Frame.id = (Frame.id % 1000000000) + 1; // Always greater than 0.
	    };
	    Frame.prototype.hasCallbacks = function () {
	        for (var _i = 0, _a = this.args; _i < _a.length; _i++) {
	            var arg = _a[_i];
	            if (typeof arg === 'function')
	                return true;
	        }
	        return false;
	    };
	    Frame.prototype.isResponse = function () {
	        return !!this.rid;
	    };
	    Frame.id = 0;
	    Frame.timeout = 5000; // Default timeout (in milliseconds), so that we don't send timeout value with every request.
	    return Frame;
	}());
	exports.Frame = Frame;
	var FrameOutgoing = (function (_super) {
	    __extends(FrameOutgoing, _super);
	    function FrameOutgoing(args, event) {
	        if (args === void 0) { args = []; }
	        if (event === void 0) { event = ''; }
	        _super.call(this);
	        this.id = Frame.getNextId();
	        this.event = event;
	        this.args = args;
	    }
	    FrameOutgoing.createResponse = function (request, cb_pos, args) {
	        var response = new FrameOutgoing(args);
	        response.rid = request.id;
	        response.func = cb_pos;
	        return response;
	    };
	    // When a response to some callback is received.
	    FrameOutgoing.prototype.processResponse = function (response) {
	        var pos = response.func;
	        var callback = this.args[pos];
	        if (typeof callback !== 'function')
	            return; // Invalid response or function already called.
	        this.args[pos] = null; // Remove the function as, we will call it now.
	        callback.apply(null, response.args);
	    };
	    FrameOutgoing.prototype.serialize = function () {
	        var data = {
	            i: this.id,
	            e: this.event
	        };
	        if (this.args.length) {
	            data.a = [];
	            var cbs = [];
	            for (var i = 0; i < this.args.length; i++) {
	                var arg = this.args[i];
	                if (typeof arg === 'function') {
	                    // data.args.push(0);  // Just fill function spots with 0, they will be ignored anyways.
	                    cbs.push(i);
	                    this.callbacks.push(arg);
	                }
	                else {
	                    data.a.push(arg);
	                    if (Frame.timeout != this.timeout)
	                        data.t = this.timeout / 1000;
	                }
	            }
	            if (cbs.length) {
	                data.c = cbs;
	            }
	        }
	        // IFrameDataResponse
	        if (this.rid) {
	            data.r = this.rid;
	            data.f = this.func;
	        }
	        this.data = data;
	        return this.data;
	    };
	    return FrameOutgoing;
	}(Frame));
	exports.FrameOutgoing = FrameOutgoing;
	var FrameIncoming = (function (_super) {
	    __extends(FrameIncoming, _super);
	    function FrameIncoming() {
	        _super.apply(this, arguments);
	    }
	    FrameIncoming.prototype.unserialize = function (data, onCallback) {
	        this.data = data;
	        // IFrameData
	        if (typeof data.i === 'number')
	            this.id = data.i;
	        else
	            throw Error('Error parsing id');
	        if (data.t) {
	            if (typeof data.t == 'number')
	                this.timeout = data.t;
	            else
	                throw Error('Error parsing timeout');
	        }
	        else
	            this.timeout = Frame.timeout;
	        this.args = [];
	        if (data.a) {
	            if (data.a instanceof Array) {
	                for (var _i = 0, _a = data.a; _i < _a.length; _i++) {
	                    var arg = _a[_i];
	                    this.args.push(arg);
	                }
	            }
	            else
	                throw Error('Error parsing arguments');
	        }
	        else
	            data.a = [];
	        this.callbacks = [];
	        if (data.c) {
	            if (!(data.c instanceof Array))
	                throw Error('Error parsing callbacks');
	            for (var _b = 0, _c = data.c; _b < _c.length; _b++) {
	                var pos = _c[_b];
	                var callback = onCallback(this, pos);
	                this.callbacks.push(callback);
	                this.args.splice(pos, 0, callback);
	            }
	        }
	        this.event = '';
	        this.rid = 0;
	        this.func = 0;
	        if (data.e) {
	            // IFrameDataInitiation
	            if (typeof data.e === 'string')
	                this.event = data.e;
	            else
	                throw Error('Error parsing event');
	        }
	        else if (data.r) {
	            // IFrameDataResponse
	            if (typeof data.r === 'number')
	                this.rid = data.r;
	            else
	                throw Error('Error parsing resposne id');
	            if (typeof data.f === 'number')
	                this.func = data.f;
	            else
	                throw Error('Error parsing reponse position');
	        }
	    };
	    return FrameIncoming;
	}(Frame));
	exports.FrameIncoming = FrameIncoming;
	var Router = (function () {
	    function Router() {
	        this.latency = 500; // Client to server latency in milliseconds, expected.
	        // List of frames (by ID) which had callbacks, we keep track of them to send back responses to callbacks, if received.
	        this.frame = {};
	        this.timer = {};
	        this.onerror = function () { };
	        this.api = null;
	        this.subs = {};
	    }
	    Router.prototype.genCallack = function (frame, pos) {
	        var _this = this;
	        var called = false;
	        return function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            if (!called) {
	                called = true;
	                _this.dispatch(FrameOutgoing.createResponse(frame, pos, args));
	            }
	            else
	                throw Error("Already called: .on(\"" + frame.event + "\") " + pos + "th arg");
	        };
	    };
	    // protected getSubList(event: string): TeventCallbackList {
	    //     if(!this.subs[event]) this.subs[event] = [];
	    //     return this.subs[event];
	    // }
	    Router.prototype.pub = function (frame) {
	        var event = frame.event, args = frame.args;
	        if (!event)
	            return;
	        // `.onevent()` wiretaps on all events, if it returns true no further routing is done.
	        var stop_routing = false;
	        if (this.onevent)
	            stop_routing = !!this.onevent(event, args);
	        if (stop_routing)
	            return;
	        var method;
	        if (this.api)
	            method = this.api.get(event);
	        if (method) {
	            method.apply(this, args); // Set this to this Router, in case it has not been bound, so method could use `this.emit(...);`
	        }
	        else {
	            // var list = this.getSubList(event);
	            // for(var sub of list) sub.apply(null, args);
	            var func = this.subs[event];
	            if (func)
	                func.apply(null, args);
	            // list = this.getSubList('*');
	            // for(var sub of list) sub.apply(null, [event, ...args]);
	            func = this.subs['*'];
	            if (func)
	                func.apply(null, [event].concat(args));
	        }
	    };
	    Router.prototype.sendData = function (data) {
	        this.send(data);
	    };
	    Router.prototype.dispatch = function (frame) {
	        var _this = this;
	        if (frame.hasCallbacks()) {
	            this.frame[frame.id] = frame;
	            // Remove this frame after some timeout, if callbacks not called.
	            this.timer[frame.id] = setTimeout(function () { delete _this.frame[frame.id]; }, frame.timeout + this.latency);
	        }
	        var data = frame.serialize();
	        // console.log('dispatch', data);
	        this.sendData(data);
	    };
	    Router.prototype.processResponse = function (frame) {
	        var request = this.frame[frame.rid];
	        if (!request)
	            return; // Cannot find the original request.
	        request.processResponse(frame);
	        // Remove the original request frame, if all callbacks processed.
	        if (!request.hasCallbacks()) {
	            // console.log(this.frame, this.timer);
	            var id = request.id;
	            delete this.frame[id];
	            var timer = this.timer[id];
	            if (timer)
	                clearTimeout(timer);
	            delete this.timer[id];
	        }
	    };
	    Router.prototype.setApi = function (api) {
	        this.api = api;
	        return this;
	    };
	    // This function is called by user.
	    Router.prototype.onmessage = function (msg) {
	        var frame = new FrameIncoming;
	        try {
	            frame.unserialize(msg, this.genCallack.bind(this));
	        }
	        catch (e) {
	            this.onerror(e);
	            return;
	        }
	        if (frame.isResponse())
	            this.processResponse(frame);
	        else
	            this.pub(frame);
	    };
	    Router.prototype.on = function (event, callback) {
	        // var list: TeventCallbackList = this.getSubList(event);
	        // list.push(callback);
	        this.subs[event] = callback;
	        return this;
	    };
	    Router.prototype.emit = function (event) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        var frame = new FrameOutgoing(args, event);
	        this.dispatch(frame);
	        return this;
	    };
	    return Router;
	}());
	exports.Router = Router;
	// Same as `Router`, but buffers all frames for 5 milliseconds and then sends a list of all frames at once.
	var RouterBuffered = (function (_super) {
	    __extends(RouterBuffered, _super);
	    function RouterBuffered() {
	        _super.apply(this, arguments);
	        this.cycle = 10; // Milliseconds for how long to buffer requests.
	        this.timer = 0;
	        this.buffer = [];
	    }
	    RouterBuffered.prototype.flush = function () {
	        // var data: IFrameDataBuffered = {b: this.buffer};
	        this.send(this.buffer);
	        this.buffer = [];
	    };
	    RouterBuffered.prototype.sendData = function (data) {
	        this.buffer.push(data);
	        this.startTimer();
	    };
	    RouterBuffered.prototype.startTimer = function () {
	        var _this = this;
	        if (!this.timer) {
	            this.timer = setTimeout(function () {
	                _this.timer = 0;
	                _this.flush();
	            }, this.cycle);
	        }
	    };
	    RouterBuffered.prototype.onmessage = function (msg) {
	        // console.log('msg', msg);
	        if (typeof msg != 'object')
	            return;
	        if (msg instanceof Array) {
	            // if(!(msg.b instanceof Array)) return;
	            // for(var fmsg of msg.b) super.onmessage(fmsg);
	            for (var _i = 0, msg_1 = msg; _i < msg_1.length; _i++) {
	                var fmsg = msg_1[_i];
	                _super.prototype.onmessage.call(this, fmsg);
	            }
	        }
	        else
	            _super.prototype.onmessage.call(this, msg);
	    };
	    return RouterBuffered;
	}(Router));
	exports.RouterBuffered = RouterBuffered;
	// A collection of API functions.
	var Api = (function () {
	    function Api() {
	        this.methods = {};
	    }
	    Api.prototype.add = function (list) {
	        this.methods = util_1.extend(this.methods, list);
	        return this;
	    };
	    Api.prototype.get = function (method) {
	        return this.methods[method];
	    };
	    return Api;
	}());
	exports.Api = Api;


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	function extend(obj1, obj2) {
	    var objs = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        objs[_i - 2] = arguments[_i];
	    }
	    if (typeof obj2 === 'object')
	        for (var i in obj2)
	            obj1[i] = obj2[i];
	    if (objs.length)
	        return extend.apply(null, [obj1].concat(objs));
	    else
	        return obj1;
	}
	exports.extend = extend;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Msgpack = (function () {
	    function Msgpack() {
	    }
	    Msgpack.prototype.pack = function (data) {
	        var msgpack = __webpack_require__(11);
	        return msgpack.encode(data);
	    };
	    Msgpack.prototype.unpack = function (data) {
	        var msgpack = __webpack_require__(11);
	        return msgpack.decode(data);
	    };
	    return Msgpack;
	}());
	exports.Msgpack = Msgpack;


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("msgpack-lite");

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Backoff = (function () {
	    function Backoff() {
	        this.retryCount = 0;
	    }
	    Backoff.prototype.onSuccess = function () {
	        this.retryCount = 0;
	    };
	    Backoff.prototype.retry = function () {
	        this.retryCount++;
	        this.operation(this.onSuccess.bind(this), this.onError.bind(this));
	    };
	    Backoff.prototype.attempt = function (operation) {
	        this.operation = operation;
	        this.retry();
	    };
	    return Backoff;
	}());
	exports.Backoff = Backoff;
	var BackoffRetry = (function (_super) {
	    __extends(BackoffRetry, _super);
	    function BackoffRetry(max_retries) {
	        if (max_retries === void 0) { max_retries = 3; }
	        _super.call(this);
	        this.maxRetries = 3;
	        this.maxRetries = max_retries;
	    }
	    BackoffRetry.prototype.onError = function (err) {
	        if (this.retryCount < this.maxRetries)
	            this.retry();
	    };
	    return BackoffRetry;
	}(Backoff));
	exports.BackoffRetry = BackoffRetry;
	var BackoffExponential = (function (_super) {
	    __extends(BackoffExponential, _super);
	    function BackoffExponential() {
	        _super.apply(this, arguments);
	        this.minTimeout = 1000;
	        this.base = 2;
	        this.maxTimeout = 1000 * 60 * 60;
	    }
	    BackoffExponential.prototype.onError = function (err) {
	        var ms = this.minTimeout * (Math.pow(this.base, (this.retryCount - 1)));
	        if (ms < this.maxTimeout)
	            setTimeout(this.retry.bind(this), ms);
	    };
	    return BackoffExponential;
	}(Backoff));
	exports.BackoffExponential = BackoffExponential;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var store = __webpack_require__(14);
	var Core = (function () {
	    function Core(opts) {
	        this.storage = new store.Storage;
	        this.engine = opts.storageEngine;
	        this.setApi(opts.api);
	    }
	    Core.prototype.exec = function (event, args) {
	        var command = [event, args];
	        // `nmsg-rpc` ensures below type safety:
	        // if(typeof cmd !== 'string') return;
	        // if(!(args instanceof Array)) return;
	        var api = this.api;
	        if (!api[event]) {
	            if (args.length) {
	                var callback = args[args.length - 1];
	                if (typeof callback === 'function')
	                    callback({ msg: "Command \"" + event + "\" does not exit" });
	            }
	            return;
	        }
	        var do_log = api[event].apply(this, args);
	        // Remove the last callback argument, if any, as we don't need it anymore.
	        if (args.length && (typeof args[args.length - 1] === 'function'))
	            args.splice(args.length - 1, 1);
	        if (do_log)
	            this.log(command);
	    };
	    Core.prototype.setApi = function (api) {
	        this.api = {};
	        for (var cmd in api)
	            this.api[cmd] = api[cmd].bind(this);
	    };
	    Core.prototype.log = function (command) {
	        if (this.engine)
	            this.engine.write(command);
	    };
	    Core.prototype.timestamp = function () {
	        return +new Date;
	    };
	    return Core;
	}());
	exports.Core = Core;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var stream_1 = __webpack_require__(5);
	var stl_1 = __webpack_require__(15);
	var Key = (function () {
	    function Key() {
	    }
	    Key.create = function (data) {
	        var key = new Key;
	        key.data = data;
	        return key;
	    };
	    return Key;
	}());
	exports.Key = Key;
	var Keys = (function () {
	    function Keys() {
	        this.map = new stl_1.Map;
	    }
	    return Keys;
	}());
	exports.Keys = Keys;
	var SortedSet = (function () {
	    function SortedSet() {
	    }
	    return SortedSet;
	}());
	exports.SortedSet = SortedSet;
	var Storage = (function () {
	    function Storage() {
	        this.keys = new Keys;
	        this.sortedSet = new SortedSet;
	    }
	    return Storage;
	}());
	exports.Storage = Storage;
	var KeysExporter = (function (_super) {
	    __extends(KeysExporter, _super);
	    function KeysExporter() {
	        _super.apply(this, arguments);
	        this.step = 0;
	        this.batch = 2;
	    }
	    KeysExporter.prototype._read = function () {
	        var map = this.keys.map;
	        for (var i = 0; i < this.batch; i++) {
	            var index = this.step + i;
	            if (index >= map.length)
	                continue;
	            var _a = map.iter(index), key = _a[0], mykey = _a[1];
	            // console.log('step', this.step);
	            // console.log('pushing', [key, val]);
	            this.push(JSON.stringify([key, mykey.data]));
	        }
	        this.step += this.batch;
	        if (this.step >= map.length)
	            this.push(null);
	    };
	    return KeysExporter;
	}(stream_1.Readable));
	exports.KeysExporter = KeysExporter;


/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var isArray = Array.isArray || (function (obj) { return toString.call(obj) == '[object Array]'; });
	function isFunction(obj) {
	    return toString.call(obj) == '[object Function]';
	}
	function isObjectList(obj) {
	    if (isArray(obj) || isFunction(obj))
	        return false;
	    return obj == Object(obj);
	}
	function toArrayPairs(obj) {
	    var tempItems = [];
	    for (var k in obj)
	        tempItems[tempItems.length] = [k, obj[k]];
	    return tempItems;
	}
	function binarySearch(arr, val, exactMatch) {
	    if (exactMatch === void 0) { exactMatch = false; }
	    var h = arr.length;
	    var l = -1;
	    while (h - l > 1) {
	        var m = (h + l) >> 1;
	        if (arr[m] > val)
	            l = m;
	        else
	            h = m;
	    }
	    if (exactMatch)
	        return (arr[h] == val) ? h : -1;
	    else
	        return h;
	}
	var Base = (function () {
	    function Base() {
	        this.keys = [];
	    }
	    Base.prototype.updateLength = function () {
	        return this.length = this.keys.length;
	    };
	    Base.prototype.each = function (f, start, end, step) {
	        if (start === void 0) { start = 0; }
	        if (end === void 0) { end = this.length; }
	        if (step === void 0) { step = 1; }
	        for (var i = start; i < end; i += step) {
	            var k = this.iterKey(i);
	            var v = this.iterVal(i);
	            f(k, v);
	        }
	    };
	    Base.prototype.eachKey = function (f, start, end, step) {
	        if (start === void 0) { start = 0; }
	        if (end === void 0) { end = this.length; }
	        if (step === void 0) { step = 1; }
	        for (var i = start; i < end; i += step)
	            f(this.iterKey(i));
	    };
	    Base.prototype.eachVal = function (f, start, end, step) {
	        if (start === void 0) { start = 0; }
	        if (end === void 0) { end = this.length; }
	        if (step === void 0) { step = 1; }
	        for (var i = start; i < end; i += step)
	            f(this.iterVal(i));
	    };
	    return Base;
	}());
	exports.Base = Base;
	// Unsorted map with unique keys.
	var Map = (function (_super) {
	    __extends(Map, _super);
	    function Map() {
	        var items = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            items[_i - 0] = arguments[_i];
	        }
	        _super.call(this);
	        this.revKeys = {};
	        this.items = {};
	        this.set(items);
	        this.updateLength();
	    }
	    Map.prototype.get = function (key) {
	        // if(typeof key !== 'string') throw 'Invalid key.';
	        return this.items[key];
	    };
	    Map.prototype.set = function () {
	        var items = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            items[_i - 0] = arguments[_i];
	        }
	        if (!(items[0] != null))
	            return this.length;
	        if (isObjectList(items[0]))
	            items = toArrayPairs(items[0]); // TODO: We never use object list, do we?
	        var list = items;
	        for (var _a = 0, list_1 = list; _a < list_1.length; _a++) {
	            var item = list_1[_a];
	            // if(!isArray(item)) throw 'Attempted set of invalid item.';
	            var key = item[0], val = item[1];
	            if (!(this.items[key] != null)) {
	                this.revKeys[key] = this.keys.length;
	                this.keys[this.keys.length] = key;
	            }
	            this.items[key] = val;
	        }
	        return this.updateLength();
	    };
	    Map.prototype.iterKey = function (counter) {
	        return this.keys[counter];
	    };
	    Map.prototype.iterVal = function (counter) {
	        return this.items[this.keys[counter]];
	    };
	    Map.prototype.remove = function (key) {
	        // if(typeof key !== 'string') throw 'Invalid key.';
	        if (typeof this.items[key] != 'undefined') {
	            delete this.items[key];
	            this.keys.splice(this.revKeys[key], 1);
	            delete this.revKeys[key];
	        }
	        return this.updateLength();
	    };
	    Map.prototype.iter = function (counter) {
	        return [this.keys[counter], this.items[this.keys[counter]]];
	    };
	    Map.prototype.has = function (key) {
	        return typeof this.items[key] !== 'undefined';
	    };
	    Map.prototype.clear = function () {
	        this.items = {};
	        this.revKeys = {};
	        this.keys = [];
	        return this.updateLength();
	    };
	    return Map;
	}(Base));
	exports.Map = Map;
	//
	//
	// # a map that is sorted upon insertion.
	// # keys must be unique
	// class speedr.SortedMap extends BaseMap
	// 	constructor: (items...) ->
	// 		@keys = []
	// 		@vals = []
	// 		@set(items...)
	// 		@updateLength()
	//
	// 	get: (key) ->
	// 		if not key? then return null
	// 		i = speedr.binarySearch(@keys, key, true)
	// 		if i == -1 then return null
	// 		return @vals[i]
	//
	// 	set: (items...) ->
	// 		if not items[0]? then return @length
	// 		# passed object
	// 		if isObjectLit(items[0]) then items = toArrayPairs(items[0])
	// 		for item in items
	// 			if not isArray(item)
	// 				throw 'Attempted set of invalid item.'
	// 			key = item[0]
	// 			val = item[1]
	// 			i = speedr.binarySearch(@keys, key)
	//
	// 			# if the key already exists in the map
	// 			if @keys[i] == key
	// 				# replace the key's associated value
	// 				@vals[i] = val
	// 			else
	// 				# insert a new item
	// 				@keys.splice(i, 0, key)
	// 				@vals.splice(i, 0, val)
	//
	// 		return @updateLength()
	//
	// 	remove: (key) ->
	// 		if not key? then return @length
	// 		i = speedr.binarySearch(@keys, key)
	// 		@keys.splice(i, 1)
	// 		@vals.splice(i, 1)
	// 		return @updateLength()
	//
	// 	pop: ->
	// 		@keys.pop()
	// 		@vals.pop()
	// 		return @updateLength()
	//
	// 	# note that these iterate from the top down
	// 	# (from smaller to larger)
	// 	iter: (counter) ->
	// 		return [@keys[@length - 1 - counter], @vals[@length - 1 - counter]]
	// 	iterKey: (counter) -> return @keys[@length - 1 - counter]
	// 	iterVal: (counter) -> return @vals[@length - 1 - counter]
	//
	// 	hasKey: (key) ->
	// 		if speedr.binarySearch(@keys, key, true) == -1
	// 			return false
	// 		else
	// 			return true
	//
	// 	clear: ->
	// 		@keys = []
	// 		@vals = []
	// 		@updateLength()
	// 		return null
	//
	//
	// # a map that is sorted upon insertion.  multiple values can be
	// # stored under a single key.  thus, item removal requires both
	// # the key *and* the value for if the value is something like a
	// # class instance.
	// class speedr.SortedMultiMap extends speedr.SortedMap
	// 	constructor: (items...) ->
	// 		# can't do super(items...) as it would call super many times
	// 		# so, just repeat the constructor
	// 		@keys = []
	// 		@vals = []
	// 		@insert(items...)
	// 		@updateLength()
	//
	// 	get: -> return null # in order to get something, we'd have to return a range
	// 	set: -> return null
	//
	// 	insert: (items...) ->
	// 		if not items[0]? then return @length
	// 		# passed object
	// 		if isObjectLit(items[0]) then items = toArrayPairs(items[0])
	// 		for item in items
	// 			if not isArray(item)
	// 				throw 'Attempted insert of invalid item.'
	// 			key = item[0]
	// 			val = item[1]
	// 			i = speedr.binarySearch(@keys, key)
	// 			@keys.splice(i, 0, key)
	// 			@vals.splice(i, 0, val)
	// 		return @updateLength()
	//
	// 	remove: (key, val) ->
	// 		# if we have multiple items with the same key,
	// 		# we also need to match the value to remove an item.
	// 		# note that not passing a value when you have copied keys
	// 		# will result in a random matching entry getting removed
	// 		if not key? then return @length
	// 		i = speedr.binarySearch(@keys, key)
	// 		if val?
	// 			j = i - 1
	// 			while true
	// 				if val == @vals[i] then break
	// 				if val == @vals[j]
	// 					i = j
	// 					break
	// 				i++
	// 				j--
	// 		@keys.splice(i, 1)
	// 		@vals.splice(i, 1)
	// 		return @updateLength()
	//
	//
	// # export functions
	// if module? and exports?
	// 	module.exports = speedr
	// else
	// 	window.speedr = speedr


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var fs = __webpack_require__(18);
	var util_1 = __webpack_require__(19);
	var LineReader = (function () {
	    function LineReader() {
	        this.onLine = function () { };
	        this.reminder = '';
	    }
	    LineReader.createFromFile = function (path) {
	        var reader = new LineReader;
	        reader.stream = fs.createReadStream(path);
	        return reader;
	    };
	    LineReader.prototype.sendLine = function (line) {
	        this.onLine(line);
	        // try {
	        //     this.onLine(JSON.parse(line));
	        // } catch(e) {
	        //     this.onLine(line);
	        // }
	    };
	    LineReader.prototype.start = function () {
	        var _this = this;
	        this.stream.on('data', function (chunk, encoding) {
	            var str = chunk instanceof Buffer ? chunk.toString() : chunk;
	            var lines = str.split('\n');
	            if (lines.length) {
	                _this.sendLine(_this.reminder + lines[0]);
	                for (var i = 1; i < lines.length - 1; i++)
	                    _this.sendLine(lines[i]);
	                _this.reminder = lines[lines.length - 1]; // Save last item as a possible reminder.
	            }
	        });
	        this.stream.on('end', function () {
	            if (_this.reminder)
	                _this.sendLine(_this.reminder);
	            _this.reminder = '';
	        });
	    };
	    return LineReader;
	}());
	exports.LineReader = LineReader;
	var AolStore = (function () {
	    function AolStore() {
	    }
	    return AolStore;
	}());
	exports.AolStore = AolStore;
	var AolStoreFork = (function (_super) {
	    __extends(AolStoreFork, _super);
	    function AolStoreFork() {
	        _super.apply(this, arguments);
	        this.stores = {};
	    }
	    AolStoreFork.prototype.write = function (obj) {
	        for (var name in this.stores)
	            this.stores[name].write(obj);
	    };
	    AolStoreFork.prototype.set = function (name, store) {
	        this.stores[name] = store;
	    };
	    AolStoreFork.prototype.remove = function (name) {
	        delete this.stores[name];
	    };
	    return AolStoreFork;
	}(AolStore));
	exports.AolStoreFork = AolStoreFork;
	var AolFile = (function (_super) {
	    __extends(AolFile, _super);
	    function AolFile() {
	        _super.apply(this, arguments);
	    }
	    AolFile.createFromFile = function (path) {
	        var writer = new AolFile;
	        writer.stream = fs.createWriteStream(path, {
	            flags: 'a'
	        });
	        return writer;
	    };
	    // write(line: string) {
	    AolFile.prototype.write = function (obj) {
	        // this.stream.write(line + "\n");
	        this.stream.write(JSON.stringify(obj) + "\n");
	    };
	    return AolFile;
	}(AolStore));
	exports.AolFile = AolFile;
	var StorageEngine;
	(function (StorageEngine) {
	    var Base = (function () {
	        function Base() {
	        }
	        return Base;
	    }());
	    StorageEngine.Base = Base;
	    var File = (function (_super) {
	        __extends(File, _super);
	        function File(opts) {
	            _super.call(this);
	            this.opts = util_1.extend({}, File.defaults, opts);
	            var aof = AolFile.createFromFile(this.opts.dir + "/" + this.opts.log);
	            this.fork = new AolStoreFork;
	            this.fork.set('aof', aof);
	        }
	        File.prototype.write = function (obj) {
	            this.fork.write(obj);
	        };
	        File.prototype.runCompaction = function () {
	        };
	        File.defaults = {
	            dir: '.',
	            log: 'data.json.log'
	        };
	        return File;
	    }(Base));
	    StorageEngine.File = File;
	})(StorageEngine = exports.StorageEngine || (exports.StorageEngine = {}));


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";
	function extend(obj1, obj2) {
	    var objs = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        objs[_i - 2] = arguments[_i];
	    }
	    if (typeof obj2 === 'object')
	        for (var i in obj2)
	            obj1[i] = obj2[i];
	    if (objs.length)
	        return extend.apply(null, [obj1].concat(objs));
	    else
	        return obj1;
	}
	exports.extend = extend;
	function noop() { }
	exports.noop = noop;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// import * as keys from './api/keys';
	// import * as sys from './api/sys';
	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(21));
	__export(__webpack_require__(22));


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var store_1 = __webpack_require__(14);
	var util_1 = __webpack_require__(19);
	function stopIfInvalidKeyParam(key, code, callback) {
	    if (code === void 0) { code = 0; }
	    if (!key || (typeof key !== 'string')) {
	        if (typeof callback == 'function')
	            callback({
	                msg: 'Invalid key.',
	                code: code
	            });
	        return true;
	    }
	    return false;
	}
	exports.set = function (key, data, options, callback) {
	    var opts;
	    if (typeof options === 'function') {
	        callback = options;
	        opts = {};
	    }
	    else
	        opts = options || {};
	    if (typeof callback !== 'function')
	        callback = util_1.noop;
	    if (stopIfInvalidKeyParam(key, 0, callback))
	        return;
	    var core = this;
	    var map = core.storage.keys.map;
	    var mykey = map.get(key);
	    if (mykey) {
	        if (!opts.ifNotExist) {
	            mykey.data = data;
	        }
	    }
	    else {
	        if (!opts.ifExist) {
	            mykey = store_1.Key.create(data);
	            map.set([key, mykey]);
	        }
	    }
	    callback();
	    return true; // Log this command.
	};
	exports.get = function (key, callback) {
	    if (typeof callback !== 'function')
	        return;
	    if (stopIfInvalidKeyParam(key, 0, callback))
	        return;
	    var core = this;
	    var map = core.storage.keys.map;
	    var mykey = map.get(key);
	    if (!mykey) {
	        callback(null, null);
	    }
	    else {
	        callback(null, mykey.data);
	    }
	};
	exports.del = function (key, callback) {
	    if (callback === void 0) { callback = util_1.noop; }
	    if (typeof callback !== 'function')
	        return;
	    if (stopIfInvalidKeyParam(key, 0, callback))
	        return;
	    var core = this;
	    var map = core.storage.keys.map;
	    var mykey = map.get(key);
	    if (!mykey) {
	        callback({
	            msg: 'Key does not exist.',
	            code: 0
	        });
	        return false;
	    }
	    else {
	        // TODO: stop TTL timers.
	        callback(null, map.length != map.remove(key));
	        return true;
	    }
	};
	exports.incr = function (key, options, callback) {
	    if (typeof options === 'function')
	        callback = options;
	    if (typeof options !== 'object')
	        options = {};
	    if (typeof callback !== 'function')
	        callback = util_1.noop;
	    var core = this;
	    core.api.get(key, function (err, value) {
	        if (err)
	            return callback(err);
	        if (value === null) {
	            var _a = options.by, by = _a === void 0 ? 1 : _a, _b = options.def, def = _b === void 0 ? 0 : _b;
	            if ((typeof by !== 'number') || (typeof def !== 'number'))
	                return callback({
	                    msg: 'Increment or default value are NaN.',
	                    code: 2
	                });
	            var newvalue = by + def;
	            core.api.set(key, newvalue, options, function (err) {
	                if (err)
	                    callback(err);
	                else
	                    callback(null, newvalue);
	            });
	        }
	        else {
	            if (typeof value === 'number') {
	                var _c = options.by, by = _c === void 0 ? 1 : _c;
	                if (typeof by !== 'number')
	                    return callback({
	                        msg: 'Increment is NaN.',
	                        code: 1
	                    });
	                value += by;
	                core.api.set(key, value, options, function (err) {
	                    if (err)
	                        callback(err);
	                    else
	                        callback(null, value);
	                });
	            }
	            else {
	                callback({
	                    msg: 'Key is NaN.',
	                    code: 0
	                });
	            }
	        }
	    });
	    return true;
	};
	exports.decr = function (key, options, callback) {
	    var core = this;
	    switch (typeof options) {
	        case 'number': return core.api.incr(key, -options, callback);
	        case 'object':
	            var opts = options;
	            if (typeof opts.by !== 'undefined')
	                opts.by = -opts.by;
	            else
	                opts.by = -1;
	            return core.api.incr(key, opts, callback);
	        case 'function': return core.api.incr(key, { by: -1 }, options);
	        default:
	            if (typeof callback === 'function')
	                callback({
	                    msg: 'Invalid arguments.',
	                    code: 0
	                });
	            return false;
	    }
	};
	exports.inc = function (key, callback) {
	    if (stopIfInvalidKeyParam(key, 0, callback))
	        return;
	    if (typeof callback !== 'function')
	        callback = util_1.noop;
	    var core = this;
	    var mykey = core.storage.keys.map.get(key);
	    if (mykey) {
	        if (typeof mykey.data === 'number')
	            callback(null, ++mykey.data);
	        else
	            callback({ msg: 'Key is NaN', code: 0 });
	    }
	    else
	        core.api.set(key, 1, function (err) { callback(err, 1); });
	    return true;
	};
	exports.dec = function (key, callback) {
	    if (stopIfInvalidKeyParam(key, 0, callback))
	        return;
	    if (typeof callback !== 'function')
	        callback = util_1.noop;
	    var core = this;
	    var mykey = core.storage.keys.map.get(key);
	    if (mykey) {
	        if (typeof mykey.data === 'number')
	            callback(null, --mykey.data);
	        else
	            callback({ msg: 'Key is NaN', code: 0 });
	    }
	    else
	        core.api.set(key, -1, function (err) { callback(err, -1); });
	    return true;
	};


/***/ },
/* 22 */
/***/ function(module, exports) {

	"use strict";
	exports.ping = function (callback) {
	    if (typeof callback === 'function')
	        callback('pong');
	};
	exports.api = function (callback) {
	    if (typeof callback !== 'function')
	        return;
	    var core = this;
	    callback(Object.keys(core.api));
	};


/***/ }
/******/ ]);