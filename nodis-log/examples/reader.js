"use strict";
var log_1 = require('../log');
var fs = require('fs');
var path = __dirname + '/test.json.log';
var stream = fs.createReadStream(path);
var liner = new log_1.LineReader;
stream.pipe(liner);
liner.on('data', function (data) {
    console.log('-', data.toString());
});
