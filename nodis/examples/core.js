"use strict";
var core = require('../core');
var api_1 = require('../api');
var aol = require('../aol');
var dbopts = {
    dir: __dirname + '/../data/',
    log: 'data.json.log'
};
console.log(dbopts);
var engine = new aol.StorageEngine.File(dbopts);
var opts = {
    storageEngine: engine
};
var nodis = new core.Core(opts);
nodis.setApi(api_1.api);
nodis.exec(['ping', [function (res) {
            console.log(res);
        }]]);
nodis.exec(['set', ['123', '456', function (res) {
            console.log(res);
        }]]);
nodis.exec(['set', ['g3dsf2', { id: 'g3dssf', 'name': 'troller' }, function (res) {
            console.log(res);
        }]]);
nodis.exec(['get', ['123', function (err, res) {
            console.log('get', res);
        }]]);
nodis.exec(['del', ['123']]);
console.log(nodis, nodis.storage.keys.map);
