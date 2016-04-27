import {Key} from './store';


export const enum STATUS {
    NOSWAP = 1,     // We have plenty of memory, nothing is being swapped.
    BG,             // We swap data in background.
    ONWRITE,        // We are out of memory, we swap data on every write, in addition to background swapping.
}


export function SWAPPED() {}


// Swap will swap data to disk.
// This `Swap` class has to be lightweight, so that we don't create
// more data than we swap while swapping.
export class Swap {

    // Memory limit below which not to swap anything to disk.
    // If we are above this memory limit `Swap` will begin swapping
    // keys to disk in the background.
    memMin = 100 * 1e6; // In bytes

    // Maximum allowed memory usage: if we go above this limit,
    // `Swap` will swap twice the amount of data to be written on
    // every write before allowing the write to proceed.
    memMax = 500 * 1e6; // In bytes

    status: STATUS = STATUS.NOSWAP;

    dir = './swap';

    swappedCount = 0; // Number of keys in swap.

    onWriteSwapFactor = 2.0;

    private intervalCheckMemory;
    private cycleCheckMemory = 3000;

    start() {
        // TODO: Remove the whole `./swap` folder on start.
        // TODO: Or create a mechanism to clean the swap folder in the backgrond on startup.
        // TODO: Or for performance reasons don't do any of that.
        this.intervalCheckMemory = setInterval(this.checkMemory.bind(this), this.cycleCheckMemory);
    }

    stop() {
        clearInterval(this.intervalCheckMemory);
    }

    onEachWrite(key: Key, done) {
        if(this.status == STATUS.ONWRITE) {
            // Swap twice the amount of data.
            // We don't know exactly if that key was modified or created new,
            // nor we really know the overhead of each key, but we still swap
            // twice the data of key's size.
            var bytes_to_swap = JSON.stringify(key.data).length * this.onWriteSwapFactor;



        } else return done();
    }

    checkMemory() {
        var usage = process.memoryUsage().heapUsed;
        if(usage < this.memMin) this.status = STATUS.NOSWAP;
        else {
            this.startBackgroundSwapping();
            if(usage > this.memMax) this.status = STATUS.ONWRITE;
            else this.status = STATUS.BG;
        }
    }

    startBackgroundSwapping() {

    }

    getFilePath(name: string, key: Key): string {
        var hash;
        var step1 = '' + Math.round(hash / 1000);
        var step2 = '' + (hash % 1000);
        // if(step1.length < 3) step1 = (new Array(3 - step1.length)).join('0') + step1;
        // if(step2.length < 3) step2 = (new Array(3 - step2.length)).join('0') + step2;
        var filename = new Buffer(name).toString('base64');
        return `${this.dir}/${step1}/${step2}/${filename}.json`;
    }

    swapKey(key: Key) {
        var hash;


    }
}

