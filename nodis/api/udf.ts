import {Core, ICommandContext as Context} from '../core';
import {Key, KeyUdf} from '../store';
import {noop} from '../util';
import {Iapi} from '../api';
import debuglib = require('debug');
var debug = debuglib('nodis:api:udf');


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


export var udfSet: Iapi.udfSet = function(key, script, callback?) {
    debug('set', key);

    if(typeof callback !== 'function') callback = noop as IApiCallback;
    if(stopIfInvalidKeyParam(key, 0, callback)) return;
    if(!script || (typeof script !== 'string')) {
        callback({
            msg: 'Invalid script argument.',
            code: 1,
        });
        return;
    }

    var core = this.core as Core;
    var map = core.storage.keys.map;
    var handle = map.get(key);

    if(handle) {
        if(handle instanceof KeyUdf) {
            handle.data = script;
            handle.meta.ts = this.meta.ts;
            callback(null, false); // False for update.
            return true;
        } else {
            callback({
                msg: 'Key in use by different type.',
                code: 2,
            });
            return false;
        }
    } else {
        var handle = new KeyUdf;
        handle.data = script;
        handle.meta = {ts: this.meta.ts};
        map.set([key, handle]);

        core.storage.udfs[key] = null; // Remember that we have this udf.
        core.storage.udfCount++;

        callback(null, true); // True for new.
        return true;
    }
};
