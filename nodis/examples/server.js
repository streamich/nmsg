"use strict";
var server = require('../server');
// var server = require('../dist/nodis.min');
var config = require('../nodis.config');
var client_1 = require('../client');
var nodis = server.createServer(config).start();
var client = client_1.createClient(1337).start();
client.cmd('ping', function (response) {
    console.log(response);
});
// client.cmd('set', 'counter', 3);
// client.cmd('get', 'counter', (err, data) => {
//     console.log(err, data);
//
//     console.log(nodis.core.storage.keys.map.items);
// });
//
// client.cmd('incr', 'counter2', {by: 3, def: 400}, (err, value) => {
//     console.log('incremented', value);
//     client.cmd('dec', 'counter2', (err, value) => {
//         console.log('decremented', value);
//     })
// });
//
//
// client.cmd('set23', (res) => {
//     console.log(res);
// });
//
//
// client.cmd('api', (list) => {
//     console.log(list);
// });
