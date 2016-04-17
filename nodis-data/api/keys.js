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
