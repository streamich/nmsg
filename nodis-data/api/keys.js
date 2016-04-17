"use strict";
var util_1 = require('../util');
exports.set = function (key, value, opts, callback) {
    var mopts;
    if (typeof opts === 'function') {
        callback = opts;
        mopts = {};
    }
    else
        mopts = opts || {};
    if (typeof callback !== 'function')
        callback = util_1.noop;
    var core = this;
    core.storage.key.map.set([key, value]);
    return true; // Log this command.
};
exports.get = function (key, callback) {
    if (typeof callback !== 'function')
        return;
    var core = this;
    callback(null, core.storage.key.map.get(key));
};
exports.del = function (key, callback) {
    if (callback === void 0) { callback = util_1.noop; }
    if (typeof callback !== 'function')
        return;
    var core = this;
    var map = core.storage.key.map;
    callback(null, map.length != map.remove(key));
    return true;
};
