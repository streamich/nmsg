"use strict";
var serverlib = require('./src/server/server');
var clientlib = require('./src/client/client');
var nmsg;
(function (nmsg) {
    nmsg.server = serverlib;
    nmsg.client = clientlib;
})(nmsg || (nmsg = {}));
module.exports = nmsg;
