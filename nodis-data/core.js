"use strict";
var store = require('./store');
// export interface ICommand {
//     cmd: string;
//     args: any[];
// }
var Core = (function () {
    function Core() {
        this.storage = new store.Storage;
    }
    Core.prototype.exec = function (command) {
        var cmd = command[0], args = command[1];
        // if(typeof cmd !== 'string') return;
        // if(!(args instanceof Array)) return;
        if (!this.api[cmd]) {
            if (args.length) {
                var callback = args[args.length - 1];
                if (typeof callback === 'function')
                    callback({ msg: "Command \"" + cmd + "\" does not exit" });
            }
            return;
        }
        var do_log = this.api[cmd].apply(this, args);
        if (do_log)
            this.log(command);
    };
    Core.prototype.setApi = function (api) {
        for (var cmd in api)
            api[cmd] = api[cmd].bind(this);
        this.api = api;
    };
    Core.prototype.log = function (command) {
    };
    return Core;
}());
exports.Core = Core;
