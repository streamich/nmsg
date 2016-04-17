import {Readable, Writable} from 'stream';
import * as fs from 'fs';


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
        try {
            this.onLine(JSON.parse(line));
        } catch(e) {
            this.onLine(line);
        }
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


export class LineWriter {

    static createFromFile(path) {
        var writer = new LineWriter;
        writer.stream = fs.createWriteStream(path, {
            flags: 'a',
        });
        return writer;
    }

    stream: Writable;

    write(obj: any) {
        this.stream.write(JSON.stringify(obj) + "\n");
    }
}
