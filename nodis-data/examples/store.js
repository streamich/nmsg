"use strict";
var store = require('../store');
var storage = new store.Storage();
var myset = store.commands.set.bind(storage);
myset('a', 'b');
myset('key', 'value');
myset('interesting', { cool: 'data' });
var exporter = new store.KeysExporter;
exporter.keys = storage.key;
exporter.on('data', function (data) {
    console.log('data', data.toString());
});
console.log(storage);
console.log(storage.key.map.get('a'));
