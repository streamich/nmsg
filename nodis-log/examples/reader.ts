import {LineReader} from '../log';
import * as fs from 'fs';


var path = __dirname + '/test.json.log';
var stream = fs.createReadStream(path);
var liner = new LineReader;
stream.pipe(liner);

liner.on('data', (data) => {
    console.log('-', data.toString());
});


