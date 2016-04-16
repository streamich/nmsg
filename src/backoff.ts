export type TcallbackSuccess = () => void;
export type TcallbackError = (err?: any) => void;
export type TcallbackOperation = (success: TcallbackSuccess, error: TcallbackError) => void;


export interface IBackoff {
    attempt(operation: TcallbackOperation);
}


export abstract class Backoff implements IBackoff {

    protected retryCount = 0;

    protected operation: TcallbackOperation;

    protected abstract onError(err);

    protected onSuccess() {
        this.retryCount = 0;
    }

    protected retry() {
        this.retryCount++;
        this.operation(this.onSuccess.bind(this), this.onError.bind(this));
    }

    attempt(operation: TcallbackOperation) {
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
