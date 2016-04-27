"use strict";
exports.ping = function (callback) {
    if (typeof callback === 'function')
        callback('pong2');
};
exports.api = function (callback) {
    if (typeof callback !== 'function')
        return;
    var core = this.core;
    callback(Object.keys(core.api));
};
exports.fsync = function (callback) {
};
