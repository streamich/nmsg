"use strict";
var log_1 = require('../log');
var writer = log_1.LineWriter.createFromFile(__dirname + '/out.json.log');
writer.write('test');
writer.write({ hello: "world", key: 123 });
