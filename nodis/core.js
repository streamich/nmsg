"use strict";
var store = require('./store');
var debuglib = require('debug');
var debug = debuglib('nodis:core');
var Core = (function () {
    function Core(opts) {
        this.storage = new store.Storage;
        this.context = {
            core: this
        };
        this.engine = opts.storageEngine;
        this.err = opts.err;
        this.setApi(opts.api);
    }
    Core.prototype.start = function (done) {
        var _this = this;
        var onCommand = function (cmd) {
            var event = cmd[0], args = cmd[1], meta = cmd[2];
            // TODO: Validate incoming data.
            _this.exec(event, args, meta);
        };
        var onParseError = function (err) {
            _this.logError(err);
        };
        this.engine.replay(onCommand, onParseError, function (err) {
            if (err)
                _this.logError(err);
            done(err);
        });
    };
    Core.prototype.exec = function (event, args, meta) {
        var command = [event, args];
        var api = this.api;
        if (!api[event]) {
            if (args.length) {
                var callback = args[args.length - 1];
                if (typeof callback === 'function')
                    callback({ msg: "Command \"" + event + "\" does not exit" });
                this.logError({ msg: 'Invalid command', cmd: event });
            }
            return;
        }
        if (!meta)
            meta = { ts: this.ts() };
        var ctx = {
            core: this,
            meta: meta
        };
        var do_log = api[event].apply(ctx, args);
        if (do_log)
            this.log(command, ctx.meta);
    };
    Core.prototype.setApi = function (api) {
        this.api = {};
        for (var cmd in api)
            this.api[cmd] = api[cmd];
    };
    Core.prototype.log = function (command, meta) {
        // Remove the last callback argument, if any, as we don't need it anymore.
        var args = command[1];
        if (args && args.length && (typeof args[args.length - 1] === 'function'))
            args.splice(args.length - 1, 1);
        if (meta)
            command.push(meta);
        if (this.engine)
            this.engine.write(command);
    };
    Core.prototype.ts = function () {
        return +new Date;
    };
    Core.prototype.logError = function (obj) {
        debug('ERROR', obj);
        if (obj instanceof Error) {
            console.log(obj.stack);
            this.err.write({ msg: obj.message });
        }
        else
            this.err.write(obj);
    };
    return Core;
}());
exports.Core = Core;
