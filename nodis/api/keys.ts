import {Core} from '../core';
import {Key} from '../store';
import {noop} from '../util';


export interface setOptions {
    ifExist?: boolean;      // Update key only if it already exists.
    ifNotExist?: boolean;   // Create key only if it does not exist.
    ttl?: number;           // Time to expiry in milliseconds.
    expire?: number;        // Expiration timestamp in milliseconds.
}

export var set = function(key: string, data: any, options?: setOptions, callback?: IApiCallback) {
    var opts: setOptions;
    if(typeof options === 'function') {
        callback = options as IApiCallback;
        opts = {};
    } else opts = options || {};
    if(typeof callback !== 'function') callback = noop as IApiCallback;

    var core = this as Core;
    var map = core.storage.keys.map;

    var mykey = map.get(key);
    if(mykey) { // Update.
        if(!opts.ifNotExist) {
            mykey.data = data;
        }
    } else { // Create new.
        if(!opts.ifExist) {
            mykey = Key.create(data);
            map.set([key, mykey]);
        }
    }

    return true; // Log this command.
};


export var get = function(key: string, callback: IApiCallback) {
    if(typeof callback !== 'function') return;

    var core = this as Core;
    var map = core.storage.keys.map;
    var mykey = map.get(key) as Key;
    if(!mykey) {
        callback({
            msg: 'Key does not exist.',
            code: 0,
        });
    } else {
        callback(null, mykey.data);
    }
};


export var del = function(key: string, callback: IApiCallback = noop) {
    if(typeof callback !== 'function') return;

    var core = this as Core;
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
