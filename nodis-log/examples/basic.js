"use strict";
var log_1 = require('../log');
var file = __dirname + '/basic.json.log';
var writer = log_1.LineWriter.createFromFile(file);
writer.write(1234234);
writer.write({
    id: 123,
    name: "asdfasdf asdf",
    username: 'asdfasdf',
    tags: {
        key: 'value',
        'lolo': null
    }
});
writer.write(null);
writer.write([2, 4, 3423, 'asdf']);
var reader = log_1.LineReader.createFromFile(file);
reader.onLine = function (line) {
    console.log('-', line);
};
reader.start();
