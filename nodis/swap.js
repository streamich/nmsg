"use strict";
function SWAPPED() { }
exports.SWAPPED = SWAPPED;
// Swap will swap data to disk.
// This `Swap` class has to be lightweight, so that we don't create
// more data than we swap while swapping.
var Swap = (function () {
    function Swap() {
        // Memory limit below which not to swap anything to disk.
        // If we are above this memory limit `Swap` will begin swapping
        // keys to disk in the background.
        this.memMin = 100 * 1e6; // In bytes
        // Maximum allowed memory usage: if we go above this limit,
        // `Swap` will swap twice the amount of data to be written on
        // every write before allowing the write to proceed.
        this.memMax = 500 * 1e6; // In bytes
        this.status = 1 /* NOSWAP */;
        this.dir = './swap';
        this.swappedCount = 0; // Number of keys in swap.
        this.onWriteSwapFactor = 2.0;
        this.cycleCheckMemory = 3000;
    }
    Swap.prototype.start = function () {
        // TODO: Remove the whole `./swap` folder on start.
        // TODO: Or create a mechanism to clean the swap folder in the backgrond on startup.
        // TODO: Or for performance reasons don't do any of that.
        this.intervalCheckMemory = setInterval(this.checkMemory.bind(this), this.cycleCheckMemory);
    };
    Swap.prototype.stop = function () {
        clearInterval(this.intervalCheckMemory);
    };
    Swap.prototype.onEachWrite = function (key, done) {
        if (this.status == 3 /* ONWRITE */) {
            // Swap twice the amount of data.
            // We don't know exactly if that key was modified or created new,
            // nor we really know the overhead of each key, but we still swap
            // twice the data of key's size.
            var bytes_to_swap = JSON.stringify(key.data).length * this.onWriteSwapFactor;
        }
        else
            return done();
    };
    Swap.prototype.checkMemory = function () {
        var usage = process.memoryUsage().heapUsed;
        if (usage < this.memMin)
            this.status = 1 /* NOSWAP */;
        else {
            this.startBackgroundSwapping();
            if (usage > this.memMax)
                this.status = 3 /* ONWRITE */;
            else
                this.status = 2 /* BG */;
        }
    };
    Swap.prototype.startBackgroundSwapping = function () {
    };
    Swap.prototype.getFilePath = function (name, key) {
        var hash;
        var step1 = '' + Math.round(hash / 1000);
        var step2 = '' + (hash % 1000);
        // if(step1.length < 3) step1 = (new Array(3 - step1.length)).join('0') + step1;
        // if(step2.length < 3) step2 = (new Array(3 - step2.length)).join('0') + step2;
        var filename = new Buffer(name).toString('base64');
        return this.dir + "/" + step1 + "/" + step2 + "/" + filename + ".json";
    };
    Swap.prototype.swapKey = function (key) {
        var hash;
    };
    return Swap;
}());
exports.Swap = Swap;
