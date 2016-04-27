"use strict";
var store_1 = require('../store');
var util_1 = require('../util');
var debuglib = require('debug');
var debug = debuglib('nodis:api:keys');
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
    debug('set', key, data);
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
    callback();
    var ctx = this;
    var map = ctx.core.storage.keys.map;
    var mykey = map.get(key);
    if (mykey) {
        if (!opts.ifNotExist) {
            var ts = mykey.meta.ts || 0;
            var ts_ctx = ctx.meta.ts;
            var is_fresher = ts < ts_ctx;
            if (is_fresher) {
                mykey.data = data;
                mykey.meta.ts = ts_ctx;
                return true;
            }
        }
    }
    else {
        if (!opts.ifExist) {
            mykey = store_1.Key.create(data, ctx.meta.ts);
            map.set([key, mykey]);
            return true; // Log this command.
        }
    }
};
exports.get = function (key, callback) {
    debug('get', key);
    if (typeof callback !== 'function')
        return;
    if (stopIfInvalidKeyParam(key, 0, callback))
        return;
    var core = this.core;
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
    debug('del', key);
    if (typeof callback !== 'function')
        return;
    if (stopIfInvalidKeyParam(key, 0, callback))
        return;
    var core = this.core;
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
    var _this = this;
    debug('incr', key, options);
    if (typeof options === 'function')
        callback = options;
    if (typeof options !== 'object')
        options = {};
    if (typeof callback !== 'function')
        callback = util_1.noop;
    var core = this.core;
    core.api.get.call(this, key, function (err, value) {
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
            core.api.set.call(_this, key, newvalue, options, function (err) {
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
                core.api.set.call(_this, key, value, options, function (err) {
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
    debug('decr', key, options);
    var core = this.core;
    switch (typeof options) {
        case 'number': return core.api.incr.call(this, key, -options, callback);
        case 'object':
            var opts = options;
            if (typeof opts.by !== 'undefined')
                opts.by = -opts.by;
            else
                opts.by = -1;
            return core.api.incr.call(this, key, opts, callback);
        case 'function': return core.api.incr.call(this, key, { by: -1 }, options);
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
    debug('inc', key);
    if (stopIfInvalidKeyParam(key, 0, callback))
        return;
    if (typeof callback !== 'function')
        callback = util_1.noop;
    var core = this.core;
    var mykey = core.storage.keys.map.get(key);
    if (mykey) {
        if (typeof mykey.data === 'number')
            callback(null, ++mykey.data);
        else
            callback({ msg: 'Key is NaN', code: 0 });
    }
    else
        core.api.set.call(this, key, 1, function (err) { callback(err, 1); });
    return true;
};
exports.dec = function (key, callback) {
    debug('dec', key);
    if (stopIfInvalidKeyParam(key, 0, callback))
        return;
    if (typeof callback !== 'function')
        callback = util_1.noop;
    var core = this.core;
    var mykey = core.storage.keys.map.get(key);
    if (mykey) {
        if (typeof mykey.data === 'number')
            callback(null, --mykey.data);
        else
            callback({ msg: 'Key is NaN', code: 0 });
    }
    else
        core.api.set.call(this, key, -1, function (err) { callback(err, -1); });
    return true;
};
