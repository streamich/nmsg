import {LineWriter} from '../log';


var writer = LineWriter.createFromFile(__dirname + '/out.json.log');
writer.write('test');
writer.write({hello: "world", key: 123});

