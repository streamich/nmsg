"use strict";
var store_1 = require('../store');
var util_1 = require('../util');
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
    return true; // Log this command.
};
exports.get = function (key, callback) {
    if (typeof callback !== 'function')
        return;
    var core = this;
    var map = core.storage.keys.map;
    var mykey = map.get(key);
    if (!mykey) {
        callback({
            msg: 'Key does not exist.',
            code: 0
        });
    }
    else {
        callback(null, mykey.data);
    }
};
exports.del = function (key, callback) {
    if (callback === void 0) { callback = util_1.noop; }
    if (typeof callback !== 'function')
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
