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
