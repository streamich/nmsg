"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Frame = (function () {
    function Frame() {
        this.data = null;
        this.id = 0;
        this.event = '';
        this.args = [];
        this.callbacks = [];
        this.timeout = Frame.timeout; // Timeout in seconds for how long to wait for callbacks.
    }
    Frame.getNextId = function () {
        return Frame.id = (Frame.id++) % 1000000000;
    };
    Frame.prototype.hasCallbacks = function () {
        return !!this.callbacks.length;
    };
    Frame.id = 0;
    Frame.timeout = 5; // Default timeout, so that we don't send timeout value with every request.
    return Frame;
}());
exports.Frame = Frame;
var FrameOutgoing = (function (_super) {
    __extends(FrameOutgoing, _super);
    function FrameOutgoing(event, args) {
        if (args === void 0) { args = []; }
        _super.call(this);
        this.id = Frame.getNextId();
        this.event = event;
        this.args = args;
    }
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
                        data.t = this.timeout;
                }
            }
            if (cbs.length) {
                data.c = cbs;
            }
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
    FrameIncoming.prototype.reply = function (index, args) {
    };
    FrameIncoming.prototype.createTimedFunction = function (index) {
        var _this = this;
        var timed_out = false;
        var ms = this.timeout * 1000;
        var func = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (timed_out) {
            }
            else {
                // Send response frame with args.
                _this.reply(index, args);
            }
        };
        var timeout = setTimeout(function () {
            timed_out = true;
        }, ms);
    };
    FrameIncoming.prototype.unserialize = function () {
        var data = this.data;
        this.id = data.i;
        if (data.t)
            this.timeout = data.t;
        if (data.c) {
            for (var _i = 0, _a = data.c; _i < _a.length; _i++) {
                var pos = _a[_i];
                this.callbacks = [];
                this.callbacks.push(function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    // Create new response frame and send.
                });
            }
        }
        if (data.r) {
        }
    };
    return FrameIncoming;
}(Frame));
exports.FrameIncoming = FrameIncoming;
var Manager = (function () {
    function Manager() {
        this.latency = 500; // Client to server latency in milliseconds.
        this.frame = {};
        this.timer = {};
    }
    Manager.prototype.receive = function (data) {
        var frame = this.unpack(data);
        if (!frame)
            return;
    };
    Manager.prototype.dispatch = function (frame) {
        var _this = this;
        if (frame.hasCallbacks()) {
            var id = frame.data.i;
            this.frame[id] = frame;
            var wait_time = (1000 * frame.timeout) + this.latency;
            this.timer[id] = setTimeout(function () {
                delete _this.frame[id];
                delete _this.timer[id];
            }, wait_time); // 2 is heuristic
        }
        this.onOutgoing(this.pack(frame));
    };
    Manager.prototype.pack = function (frame) {
        return JSON.stringify(frame.data);
    };
    Manager.prototype.unpack = function (msg) {
        try {
            var data = JSON.parse(msg);
            var frame = new FrameIncoming();
            frame.data = data;
            return frame;
        }
        catch (e) {
            return null;
        }
    };
    return Manager;
}());
exports.Manager = Manager;
var ManagerBuffered = (function (_super) {
    __extends(ManagerBuffered, _super);
    function ManagerBuffered() {
        _super.apply(this, arguments);
        this.cycle = 5; // Milliseconds for how long to buffer requests.
        this.buffer = [];
    }
    ManagerBuffered.prototype.flush = function () {
    };
    return ManagerBuffered;
}(Manager));
exports.ManagerBuffered = ManagerBuffered;
