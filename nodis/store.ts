import {Readable} from 'stream';
import {Map} from './stl';
import {extend} from './util';



// Optional object that associates meta data with keys, such as TTL, expiry timers.
interface IKeyMeta {
    ts: number;     // Timestamp when the entry was modified.
    ttl?: number;
}

export class Key {

    static create(data) {
        var key = new Key;
        key.data = data;
        return key;
    }

    data: any;
    meta: IKeyMeta;
}

export class Keys {
    map = new Map;
}

export class SortedSet {
}


export class Storage {
    keys = new Keys;
    sortedSet = new SortedSet;
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
            var [key, mykey] = map.iter(index);
            // console.log('step', this.step);
            // console.log('pushing', [key, val]);
            this.push(JSON.stringify([key, mykey.data]));
        }
        this.step += this.batch;
        if(this.step >= map.length) this.push(null);
    }
}


