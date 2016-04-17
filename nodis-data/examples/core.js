"use strict";
var core = require('../core');
var api_1 = require('../api');
var nodis = new core.Core;
nodis.setApi(api_1.api);
nodis.exec(['ping', [function (res) {
            console.log(res);
        }]]);
nodis.exec(['set', ['123', '456', function (res) {
            console.log(res);
        }]]);
console.log(nodis, nodis.storage.key.map);
