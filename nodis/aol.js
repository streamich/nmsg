"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fs = require('fs');
var util_1 = require('./util');
var LineReader = (function () {
    function LineReader() {
        this.onLine = util_1.noop;
        this.onStop = util_1.noop;
        this.reminder = '';
    }
    LineReader.createFromFile = function (path) {
        var reader = new LineReader;
        reader.stream = fs.createReadStream(path);
        return reader;
    };
    LineReader.prototype.sendLine = function (line) {
        this.onLine(line);
        // try {
        //     this.onLine(JSON.parse(line));
        // } catch(e) {
        //     this.onLine(line);
        // }
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
            _this.onStop();
        });
    };
    return LineReader;
}());
exports.LineReader = LineReader;
var AolStore = (function () {
    function AolStore() {
    }
    return AolStore;
}());
exports.AolStore = AolStore;
var AolStoreFork = (function (_super) {
    __extends(AolStoreFork, _super);
    function AolStoreFork() {
        _super.apply(this, arguments);
        this.stores = {};
    }
    AolStoreFork.prototype.write = function (obj) {
        for (var name in this.stores)
            this.stores[name].write(obj);
    };
    AolStoreFork.prototype.set = function (name, store) {
        this.stores[name] = store;
    };
    AolStoreFork.prototype.remove = function (name) {
        delete this.stores[name];
    };
    return AolStoreFork;
}(AolStore));
exports.AolStoreFork = AolStoreFork;
var AolFile = (function (_super) {
    __extends(AolFile, _super);
    function AolFile() {
        _super.apply(this, arguments);
    }
    AolFile.createFromFile = function (path) {
        var writer = new AolFile;
        writer.stream = fs.createWriteStream(path, {
            flags: 'a'
        });
        return writer;
    };
    // write(line: string) {
    AolFile.prototype.write = function (obj) {
        // this.stream.write(line + "\n");
        this.stream.write(JSON.stringify(obj) + "\n");
    };
    return AolFile;
}(AolStore));
exports.AolFile = AolFile;
var StorageEngine;
(function (StorageEngine) {
    var Base = (function () {
        function Base() {
        }
        return Base;
    }());
    StorageEngine.Base = Base;
    var File = (function (_super) {
        __extends(File, _super);
        function File(opts) {
            _super.call(this);
            this.opts = util_1.extend({}, File.defaults, opts);
            this.aof = AolFile.createFromFile(this.getFileName());
            this.fork = new AolStoreFork;
            this.fork.set('aof', this.aof);
        }
        File.prototype.getFileName = function () {
            return this.opts.dir + "/" + this.opts.data;
        };
        File.prototype.write = function (obj) {
            this.fork.write(obj);
        };
        File.prototype.runCompaction = function () {
        };
        File.prototype.replay = function (onCommand, onParseError, done) {
            var _this = this;
            // While reading, stop writing to the same file.
            this.fork.remove('aof');
            var reader = LineReader.createFromFile(this.getFileName());
            reader.onLine = function (line) {
                try {
                    var obj = JSON.parse(line);
                    onCommand(obj);
                }
                catch (e) {
                    onParseError(e);
                }
            };
            reader.onStop = function () {
                _this.fork.set('aof', _this.aof);
                done();
            };
            reader.start();
        };
        File.defaults = {
            dir: '.',
            data: 'data.json.log'
        };
        return File;
    }(Base));
    StorageEngine.File = File;
})(StorageEngine = exports.StorageEngine || (exports.StorageEngine = {}));
