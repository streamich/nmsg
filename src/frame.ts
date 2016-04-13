
interface IFrameData {
    i: number;      // Frame ID.
    a?: any[];      // Data sent in function call where functions are removed.
    c?: number[];   // List of positions where functions in arguments where removed.
    t?: number;     // Timeout in seconds for how long to wait for function execution.
}


interface IFrameDataInitiation extends IFrameData {
    e: string;      // Event name or API method name.
}


interface IFrameDataResponse extends IFrameData {
    r: number;      // Response ID, i.e. ID of the frame to which this is a response.
    f: number;      // Callback ID, index of the callback which was called.
}


export abstract class Frame {

    static id = 0;

    static getNextId(): number {
        return Frame.id = (Frame.id++) % 1000000000;
    }

    static timeout = 5; // Default timeout, so that we don't send timeout value with every request.

    data: IFrameDataInitiation | IFrameDataResponse = null;

    id = 0;

    event = '';

    args = [];

    callbacks: ((...args: any[]) => void)[] = [];

    timeout = Frame.timeout; // Timeout in seconds for how long to wait for callbacks.

    hasCallbacks() {
        return !!this.callbacks.length;
    }
}


export class FrameOutgoing extends Frame {

    constructor(event: string, args: any[] = []) {
        super();
        this.id = Frame.getNextId();
        this.event = event;
        this.args = args;
    }

    serialize() {
        var data: IFrameDataInitiation = {
            i: this.id,
            e: this.event,
        };

        if(this.args.length) {
            data.a = [];
            var cbs = [];
            for(var i = 0; i < this.args.length; i++) {
                var arg = this.args[i];
                if(typeof arg === 'function') {
                    // data.args.push(0);  // Just fill function spots with 0, they will be ignored anyways.
                    cbs.push(i);
                    this.callbacks.push(arg);
                } else {
                    data.a.push(arg);
                    if(Frame.timeout != this.timeout) data.t = this.timeout;
                }
            }

            if(cbs.length) { // We have functions that can be potentially called.
                data.c = cbs;
            }
        }

        this.data = data;
        return this.data;
    }
}


export class FrameIncoming extends Frame {

    reply(index, args) {

    }

    createTimedFunction(index) {
        var timed_out = false;
        var ms = this.timeout * 1000;
        var func = (...args: any[]) => {
            if(timed_out) {
                // Do nothing
            } else {
                // Send response frame with args.
                this.reply(index, args);
            }
        };
        var timeout = setTimeout(() => {
            timed_out = true;
        }, ms);
    }

    unserialize() {
        var data = this.data;

        this.id = data.i;
        if(data.t) this.timeout = data.t;

        if(data.c) {
            for(var pos of data.c) {
                this.callbacks = [];
                this.callbacks.push((...args: any[]) => {
                    // Create new response frame and send.
                });
            }
        }


        if(data.r) { // Is response.

        }

    }

}


export class Manager {

    latency = 500; // Client to server latency in milliseconds.

    frame: {[id: number]: FrameOutgoing} = {};
    timer: {[id: number]: Timer} = {};

    onOutgoing: (data: string|Buffer) => void;
    onIncoming: (event: string, args: any[]) => void;

    receive(data: string|Buffer) {
        var frame = this.unpack(data);
        if(!frame) return;

    }

    dispatch(frame: FrameOutgoing) {
        if(frame.hasCallbacks()) {
            var id = frame.data.i;
            this.frame[id] = frame;

            var wait_time = (1000 * frame.timeout) + this.latency;
            this.timer[id] = setTimeout(() => {
                delete this.frame[id];
                delete this.timer[id];
            }, wait_time); // 2 is heuristic
        }

        this.onOutgoing(this.pack(frame));
    }

    pack(frame: FrameOutgoing): string|Buffer {
        return JSON.stringify(frame.data);
    }

    unpack(msg: string|Buffer): FrameIncoming {
        try {
            var data = JSON.parse(<string> msg);
            var frame = new FrameIncoming();
            frame.data = data;
            return frame;
        } catch(e) {
            return null;
        }
    }
}


interface IFrameDataBuffered extends IFrameData {
    b: (IFrameDataInitiation | IFrameDataResponse)[];
}


export class ManagerBuffered extends Manager {

    cycle = 5; // Milliseconds for how long to buffer requests.

    protected buffer: FrameOutgoing[] = [];

    protected flush() {

    }
}
