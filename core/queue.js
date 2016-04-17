"use strict";
// Allows to queue outgoing messages, while transports are connecting.
var Queue = (function () {
    function Queue(max) {
        if (max === void 0) { max = 1000; }
        this.data = [];
        this.max = max;
    }
    Queue.prototype.add = function (obj) {
        this.data.push(obj);
        if (this.data.length > this.max)
            this.shift();
    };
    Queue.prototype.shift = function () {
        return this.data.shift();
    };
    return Queue;
}());
exports.Queue = Queue;
