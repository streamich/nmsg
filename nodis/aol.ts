// AOL (append-only-log)
import {Readable, Writable} from 'stream';
import * as fs from 'fs';
import {extend} from './util';


export class LineReader {

    static createFromFile(path) {
        var reader = new LineReader;
        reader.stream = fs.createReadStream(path);
        return reader;
    }

    stream: Readable;

    onLine: (line: string) => void = () => {};

    reminder = '';

    protected sendLine(line) {
        this.onLine(line);
        // try {
        //     this.onLine(JSON.parse(line));
        // } catch(e) {
        //     this.onLine(line);
        // }
    }

    start() {
        this.stream.on('data', (chunk: string|Buffer, encoding: string) => {
            var str: string = chunk instanceof Buffer ? chunk.toString() : chunk;
            var lines = str.split('\n');
            if(lines.length) {
                this.sendLine(this.reminder + lines[0]);
                for(var i = 1; i < lines.length - 1; i++) this.sendLine(lines[i]);
                this.reminder = lines[lines.length - 1]; // Save last item as a possible reminder.
            }
        });
        this.stream.on('end', () => {
            if(this.reminder) this.sendLine(this.reminder);
            this.reminder = '';
        });
    }
}


export interface IAolStore {
    write(obj: any);
}


export abstract class AolStore implements IAolStore {
    abstract write(obj: any);
}


export class AolStoreFork extends AolStore {
    stores: {[name: string]: AolStore} = {};

    write(obj: any) {
        for(var name in this.stores) this.stores[name].write(obj);
    }

    set(name: string, store: AolStore) {
        this.stores[name] = store;
    }

    remove(name: string) {
        delete this.stores[name];
    }
}


export class AolFile extends AolStore {

    static createFromFile(path) {
        var writer = new AolFile;
        writer.stream = fs.createWriteStream(path, {
            flags: 'a',
        });
        return writer;
    }

    stream: Writable;

    // write(line: string) {
    write(obj: any) {
        // this.stream.write(line + "\n");
        this.stream.write(JSON.stringify(obj) + "\n");
    }
}


export namespace StorageEngine {
    export interface IBaseOptions {

    }

    export interface IBase {
        write(obj: any);
        runCompaction();
    }

    export abstract class Base implements IBase {
        opts: IBaseOptions;
        abstract write(obj: any);
        abstract runCompaction();
    }

    export interface IFileOptions extends IBaseOptions {
        dir: string;    // Directory where files are written.
        log: string;    // Databse file name. e.g., `data.json.log`
    }

    export class File extends Base {

        static defaults: IFileOptions = {
            dir: '.',
            log: 'data.json.log',
        };

        opts: IFileOptions;

        fork: AolStoreFork;

        newStore: AolStore;

        constructor(opts: IFileOptions) {
            super();
            this.opts = extend({} as any, File.defaults, opts);

            var aof = AolFile.createFromFile(`${this.opts.dir}/${this.opts.log}`);
            this.fork = new AolStoreFork;
            this.fork.set('aof', aof);
        }

        write(obj: any) {
            this.fork.write(obj);
        }

        runCompaction() {

        }
    }
}








