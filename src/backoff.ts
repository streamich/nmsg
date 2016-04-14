
export type cbSuccess = () => void;
export type cbError = (err?: any) => void;
export type cbOperation = (success: cbSuccess, error: cbError) => void;


export abstract class Backoff {

    protected retryCount = 0;

    protected operation: cbOperation;

    protected abstract onError(err);

    protected onSuccess() {
        this.retryCount = 0;
    }

    protected retry() {
        this.retryCount++;
        this.operation(this.onSuccess.bind(this), this.onError.bind(this));
    }

    attempt(operation: (success: cbSuccess, error: cbError) => void) {
        this.operation = operation;
        this.retry();
    }
}


export class BackoffRetry extends Backoff {

    maxRetries = 3;

    constructor(max_retries = 3) {
        super();
        this.maxRetries = max_retries;
    }

    protected onError(err) {
        if(this.retryCount < this.maxRetries) this.retry();
    }
}


export class BackoffExponential extends Backoff {

    minTimeout = 1000;

    base = 2;

    maxTimeout = 1000 * 60 * 60;

    protected onError(err) {
        var ms = this.minTimeout * (this.base ** (this.retryCount - 1));
        if(ms < this.maxTimeout) setTimeout(this.retry.bind(this), ms);
    }
}
