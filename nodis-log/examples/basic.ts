import {LineWriter, LineReader} from '../log';


var file = __dirname + '/basic.json.log';
var writer = LineWriter.createFromFile(file);

writer.write(1234234);
writer.write({
    id: 123,
    name: "asdfasdf asdf",
    username: 'asdfasdf',
    tags: {
        key: 'value',
        'lolo': null,
    }
});
writer.write(null);
writer.write([2, 4, 3423, 'asdf']);


var reader = LineReader.createFromFile(file);
reader.onLine = (line) => {
    console.log('-', line);
};
reader.start();

