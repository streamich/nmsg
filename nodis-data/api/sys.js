"use strict";
exports.ping = function (callback) {
    if (typeof callback !== 'function')
        return;
    callback('pong');
};
