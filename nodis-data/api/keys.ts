import {Core} from '../core';
import {noop} from '../util';


export interface IsetOpts {
    overwrite?: boolean;
    ttl?: number;
    exp?: number;
}

export var set = function(key: string, value: any, opts?: IsetOpts, callback?: IApiCallback) {
    var mopts: IsetOpts;
    if(typeof opts === 'function') {
        callback = opts as IApiCallback;
        mopts = {};
    } else mopts = opts || {};
    if(typeof callback !== 'function') callback = noop as IApiCallback;

    var core = this as Core;
    core.storage.key.map.set([key, value]);
    return true; // Log this command.
};


export var get = function(key: string, callback: IApiCallback) {
    if(typeof callback !== 'function') return;

    var core = this as Core;
    callback(null, core.storage.key.map.get(key));
};


export var del = function(key: string, callback: IApiCallback = noop) {
    if(typeof callback !== 'function') return;

    var core = this as Core;
    var map = core.storage.key.map;
    callback(null, map.length != map.remove(key));
    return true;
};
