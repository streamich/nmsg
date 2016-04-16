import * as serialize from '../node_modules/nmsg/src/serialize';


export class Msgpack implements serialize.ISerializer {
    pack(data: TUnpacked): TPacked {
        var msgpack = require('msgpack-lite');
        return msgpack.encode(data);
    }

    unpack(data: TPacked): TUnpacked {
        var msgpack = require('msgpack-lite');
        return msgpack.decode(data);
    }
}
