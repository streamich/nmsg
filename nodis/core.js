"use strict";
var store = require('./store');
var Core = (function () {
    function Core(opts) {
        this.storage = new store.Storage;
        this.context = {
            core: this
        };
        this.engine = opts.storageEngine;
        this.setApi(opts.api);
    }
    Core.prototype.exec = function (event, args) {
        var command = [event, args];
        var api = this.api;
        if (!api[event]) {
            if (args.length) {
                var callback = args[args.length - 1];
                if (typeof callback === 'function')
                    callback({ msg: "Command \"" + event + "\" does not exit" });
            }
            return;
        }
        var ctx = {
            core: this,
            meta: {
                ts: this.ts()
            }
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
    return Core;
}());
exports.Core = Core;
