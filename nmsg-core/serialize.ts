

export type TUnpacked = any|string|number|Array<any>;   // Unpacked data.
export type TBufferable = any|string|Buffer;            // Types that can be converted to Buffer.
export type TPacked = string|Buffer;                    // Normally Buffer, but for browser-only environment use string, e.g. JSON.stringify()


export interface ISerializer {
    pack(data: TUnpacked): TPacked;
    unpack(data: TPacked): TUnpacked;
}


export abstract class Serializer implements ISerializer {

    static toBuffer(data: TBufferable): TPacked {
        if(data instanceof Buffer) return data;
        if(typeof data === 'string') return new Buffer(data);
        if((typeof data === 'object') && (typeof data.toString === 'function')) return new Buffer(data.toString());
        throw Error('Invalid unpacked data');
    }

    static toString(data: TPacked): string {
        if(typeof data === 'string') return data;
        else return data.toString();
    }

    abstract pack(data: TUnpacked): TPacked;
    abstract unpack(data: TPacked): TUnpacked;
}


export class Json extends Serializer {
    pack(data: TUnpacked): TPacked {
        var json = JSON.stringify(data);
        return json;
        // return Serializer.toBuffer(json);
    }

    unpack(data: TPacked): TUnpacked {
        var json = Serializer.toString(data);
        return JSON.parse(json);
    }
}
