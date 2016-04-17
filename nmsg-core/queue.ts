

// Allows to queue outgoing messages, while transports are connecting.
export class Queue {

    data: any[] = [];

    max: number;

    constructor(max = 1000) {
        this.max = max;
    }

    add(obj: any) {
        this.data.push(obj);
        if(this.data.length > this.max) this.shift();
    }

    shift() {
        return this.data.shift();
    }

}
