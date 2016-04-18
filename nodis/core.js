"use strict";
var store = require('./store');
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
    return Core;
}());
exports.Core = Core;
