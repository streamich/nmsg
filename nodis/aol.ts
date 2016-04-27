// AOL (append-only-log)
import {Readable, Writable} from 'stream';
import * as fs from 'fs';
import {extend, noop} from './util';


export class LineReader {

    static createFromFile(path) {
        var reader = new LineReader;
        reader.stream = fs.createReadStream(path);
        return reader;
    }

    stream: Readable;

    onLine: (line: string) => void = noop;

    onStop: () => void = noop;

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
            this.onStop();
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
        replay(onCommand: (cmd) => void, onParseError: (err) => void, done: (err?) => void);
    }

    export abstract class Base implements IBase {
        opts: IBaseOptions;
        abstract write(obj: any);
        abstract runCompaction();
        abstract replay(onCommand: (cmd) => void, onParseError: (err) => void, done: (err?) => void);
    }

    export interface IFileOptions extends IBaseOptions {
        dir: string;    // Directory where files are written.
        data: string;   // Database file name. e.g., `data.json.log`
    }

    export class File extends Base {

        static defaults: IFileOptions = {
            dir: '.',
            data: 'data.json.log',
        };

        aof: AolFile;

        opts: IFileOptions;

        fork: AolStoreFork;

        newStore: AolStore;

        constructor(opts: IFileOptions) {
            super();
            this.opts = extend({} as any, File.defaults, opts);

            this.aof = AolFile.createFromFile(this.getFileName());
            this.fork = new AolStoreFork;
            this.fork.set('aof', this.aof);
        }

        getFileName() {
            return `${this.opts.dir}/${this.opts.data}`;
        }

        write(obj: any) {
            this.fork.write(obj);
        }

        runCompaction() {

        }

        replay(onCommand: (cmd) => void, onParseError: (err) => void, done: (err?) => void) {
            // While reading, stop writing to the same file.
            this.fork.remove('aof');

            var reader = LineReader.createFromFile(this.getFileName());
            reader.onLine = (line: string) => {
                try {
                    var obj = JSON.parse(line);
                    onCommand(obj);
                } catch(e) {
                    onParseError(e);
                }
            };
            reader.onStop = () => {
                this.fork.set('aof', this.aof);
                done();
            };
            reader.start();
        }
    }
}








