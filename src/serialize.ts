

export type TUnpacked = any;
export type TBufferable = any|string|Buffer;
export type TPacked = Buffer;


export interface ISerializer {
    pack(data: TUnpacked): TPacked;
    unpack(data: TPacked): TUnpacked;
}


abstract class Serializer implements ISerializer {

    static toBuffer(data: TBufferable): TPacked {
        if(data instanceof Buffer) return data;
        if(typeof data === 'string') return new Buffer(data);
        if((typeof data === 'object') && (typeof data.toString === 'function')) return new Buffer(data.toString());
        throw Error('Invalid unpacked data');
    }

    static toString(data: TPacked): string {
        if(data instanceof Buffer) return data.toString();
        else throw Error('Invalid packed data');
    }

    abstract pack(data: TUnpacked): TPacked;
    abstract unpack(data: TPacked): TUnpacked;
}


module Serializer {

    export class Json extends Serializer {
        pack(data: TUnpacked): TPacked {
            var json = JSON.stringify(data);
            return Serializer.toBuffer(json);
        }

        unpack(data: TPacked): TUnpacked {
            var json = Serializer.toString(data);
            return JSON.parse(json);
        }
    }


    export class Msgpack extends Serializer {
        pack(data: TUnpacked): TPacked {
            var msgpack = require('msgpack-lite');
            return msgpack.encode(data);
        }

        unpack(data: TPacked): TUnpacked {
            var msgpack = require('msgpack-lite');
            return msgpack.decode(data);
        }
    }

}

export import Serializer = Serializer;
