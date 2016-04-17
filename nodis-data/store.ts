import {Readable} from 'stream';
import * as speedr from 'speedr';


export type TSerializable = any;


export class Keys {
    map = new speedr.Map;
}


export class SortedSet {
}


export class Storage {
    key = new Keys;
    sortedSet = new SortedSet;
}


function noop() {}

export namespace commands {

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

        var storage = this as Storage;
        storage.key.map.set([key, value]);
    };
}


export class KeysExporter extends Readable {
    keys: Keys;

    step = 0;

    batch = 2;

    _read() {
        var map = this.keys.map;
        for (var i = 0; i < this.batch; i++) {
            var index = this.step + i;
            if(index >= map.length) continue;
            var [key, val] = map.iter(index);
            // console.log('step', this.step);
            // console.log('pushing', [key, val]);
            this.push(JSON.stringify([key, val]));
        }
        this.step += this.batch;
        if(this.step >= map.length) this.push(null);
    }
}


