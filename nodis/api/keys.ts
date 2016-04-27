import {Core, ICommandContext as Context} from '../core';
import {Key} from '../store';
import {noop} from '../util';
import {Iapi} from '../api';
import debuglib = require('debug');
var debug = debuglib('nodis:api:keys');


function stopIfInvalidKeyParam(key: string, code = 0, callback?) {
    if(!key || (typeof key !== 'string')) {
        if(typeof callback == 'function') callback({
            msg: 'Invalid key.',
            code: code,
        });
        return true;
    }
    return false;
}


export var set: Iapi.set = function(key, data, options?, callback?) {
    debug('set', key, data);

    var opts: Iapi.setOptions;
    if(typeof options === 'function') {
        callback = options as IApiCallback;
        opts = {};
    } else opts = options || {};
    if(typeof callback !== 'function') callback = noop as IApiCallback;

    if(stopIfInvalidKeyParam(key, 0, callback)) return;
    callback();

    var ctx = this as Context;
    var map = ctx.core.storage.keys.map;

    var mykey = map.get(key);
    if(mykey) { // Update.
        if(!opts.ifNotExist) {
            var ts = mykey.meta.ts || 0;
            var ts_ctx = ctx.meta.ts;
            var is_fresher = ts < ts_ctx;
            if(is_fresher) {
                mykey.data = data;
                mykey.meta.ts = ts_ctx;
                return true;
            }
        }
    } else { // Create new.
        if(!opts.ifExist) {
            mykey = Key.create(data, ctx.meta.ts);
            map.set([key, mykey]);
            return true; // Log this command.
        }
    }
};


export var get: Iapi.get = function(key, callback) {
    debug('get', key);

    if(typeof callback !== 'function') return;
    if(stopIfInvalidKeyParam(key, 0, callback)) return;

    var core = this.core as Core;
    var map = core.storage.keys.map;
    var mykey = map.get(key) as Key;
    if(!mykey) {
        callback(null, null);
        // callback({
        //     msg: 'Key does not exist.',
        //     code: 1,
        // });
    } else {
        callback(null, mykey.data);
    }
};


export var del: Iapi.del = function(key, callback = noop) {
    debug('del', key);

    if(typeof callback !== 'function') return;
    if(stopIfInvalidKeyParam(key, 0, callback)) return;

    var core = this.core as Core;
    var map = core.storage.keys.map;
    var mykey = map.get(key) as Key;
    if(!mykey) {
        callback({
            msg: 'Key does not exist.',
            code: 0,
        });
        return false;
    } else {
        // TODO: stop TTL timers.
        callback(null, map.length != map.remove(key));
        return true;
    }
};


export var incr: Iapi.incr = function(key, options?: Iapi.incrOptions, callback?) {
    debug('incr', key, options);

    if(typeof options === 'function')   callback = options as any as IApiCallback;
    if(typeof options !== 'object')     options = {} as Iapi.incrOptions;
    if(typeof callback !== 'function')  callback = noop as IApiCallback;

    var core = this.core as Core;
    core.api.get.call(this, key, (err, value) => {
        if(err) return callback(err);
        if(value === null) { // Key does not exist.
            var {by = 1, def = 0} = options;
            if ((typeof by !== 'number') || (typeof def !== 'number')) return callback({
                msg: 'Increment or default value are NaN.',
                code: 2,
            });
            var newvalue = by + def;
            core.api.set.call(this, key, newvalue, options, (err) => {
                if(err) callback(err);
                else callback(null, newvalue);
            });
        } else {
            if (typeof value === 'number') {
                var {by = 1} = options;
                if (typeof by !== 'number') return callback({
                    msg: 'Increment is NaN.',
                    code: 1,
                });
                value += by;
                core.api.set.call(this, key, value, options, (err) => {
                    if (err) callback(err);
                    else callback(null, value);
                });
            } else {
                callback({
                    msg: 'Key is NaN.',
                    code: 0,
                });
            }
        }
    });
    return true;
};


export var decr: Iapi.decr = function(key, options?: number|Iapi.incrOptions, callback?) {
    debug('decr', key, options);

    var core = this.core as Core;
    switch(typeof options) {
        case 'number': return core.api.incr.call(this, key, -options, callback);
        case 'object':
            var opts = options as Iapi.incrOptions;
            if(typeof opts.by !== 'undefined') opts.by = -opts.by;
            else opts.by = -1;
            return core.api.incr.call(this, key, opts, callback);
        case 'function': return core.api.incr.call(this, key, {by: -1}, options as IApiCallback);
        default:
            if(typeof callback === 'function') callback({
                msg: 'Invalid arguments.',
                code: 0,
            });
            return false;
    }
};


export var inc: Iapi.inc = function(key, callback?) {
    debug('inc', key);

    if(stopIfInvalidKeyParam(key, 0, callback)) return;
    if(typeof callback !== 'function') callback = noop as IApiCallback;

    var core = this.core as Core;
    var mykey = core.storage.keys.map.get(key) as Key;
    if(mykey) {
        if(typeof mykey.data === 'number') callback(null, ++mykey.data);
        else callback({msg: 'Key is NaN', code: 0});
    } else core.api.set.call(this, key, 1, (err) => { callback(err, 1); });
    return true;
};


export var dec: Iapi.dec = function(key, callback?) {
    debug('dec', key);

    if(stopIfInvalidKeyParam(key, 0, callback)) return;
    if(typeof callback !== 'function') callback = noop as IApiCallback;

    var core = this.core as Core;
    var mykey = core.storage.keys.map.get(key) as Key;
    if(mykey) {
        if(typeof mykey.data === 'number') callback(null, --mykey.data);
        else callback({msg: 'Key is NaN', code: 0});
    } else core.api.set.call(this, key, -1, (err) => { callback(err, -1); });
    return true;
};


