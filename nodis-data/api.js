"use strict";
var util_1 = require('./util');
var keys = require('./api/keys');
var sys = require('./api/sys');
var list = util_1.extend({}, keys, sys);
exports.api = list;
