"use strict";
var fs = require('fs');
var LineReader = (function () {
    function LineReader() {
        this.onLine = function () { };
        this.reminder = '';
    }
    LineReader.createFromFile = function (path) {
        var reader = new LineReader;
        reader.stream = fs.createReadStream(path);
        return reader;
    };
    LineReader.prototype.sendLine = function (line) {
        try {
            this.onLine(JSON.parse(line));
        }
        catch (e) {
            this.onLine(line);
        }
    };
    LineReader.prototype.start = function () {
        var _this = this;
        this.stream.on('data', function (chunk, encoding) {
            var str = chunk instanceof Buffer ? chunk.toString() : chunk;
            var lines = str.split('\n');
            if (lines.length) {
                _this.sendLine(_this.reminder + lines[0]);
                for (var i = 1; i < lines.length - 1; i++)
                    _this.sendLine(lines[i]);
                _this.reminder = lines[lines.length - 1]; // Save last item as a possible reminder.
            }
        });
        this.stream.on('end', function () {
            if (_this.reminder)
                _this.sendLine(_this.reminder);
            _this.reminder = '';
        });
    };
    return LineReader;
}());
exports.LineReader = LineReader;
var LineWriter = (function () {
    function LineWriter() {
    }
    LineWriter.createFromFile = function (path) {
        var writer = new LineWriter;
        writer.stream = fs.createWriteStream(path);
        return writer;
    };
    LineWriter.prototype.write = function (obj) {
        this.stream.write(JSON.stringify(obj) + "\n");
    };
    return LineWriter;
}());
exports.LineWriter = LineWriter;
