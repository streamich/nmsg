import {Core} from './core';


export * from './api/keys';
export * from './api/sys';

// export type TCommandList = {[command: string]: (...args: any[]) => void};

export namespace Iapi {
    export interface setOptions {
        ifExist?: boolean;      // Update key only if it already exists.
        ifNotExist?: boolean;   // Create key only if it does not exist.
        ttl?: number;           // Time to expiry in milliseconds.
        expire?: number;        // Expiration timestamp in milliseconds.
    }
    export type set = (key: string, data: any, options?: setOptions, callback?: IApiCallback) => boolean;

    export type get = (key: string, callback: IApiCallback) => void;

    export type del = (key: string, callback: IApiCallback) => boolean;

    export interface incrOptions extends setOptions {
        by?: number;            // Increment.
        def?: number;           // Default value if key does not exist.
    }
    export type incr = (key: string, options?: incrOptions|number, callback?: IApiCallback) => boolean;
    export type decr = (key: string, options?: incrOptions|number, callback?: IApiCallback) => boolean;
    export type inc = (key: string, callback?: (err: IApiError, value?: number) => void) => boolean;
    export type dec = (key: string, callback?: (err: IApiError, value?: number) => void) => boolean;


    export type ping = (callback: (response: string) => void) => void;
    export type api = (callback: (list: string[]) => void) => void;


    export interface Interface {
        set: set;
        get: get;
        del: del;
        incr: incr;
        decr: decr;
        inc: inc;
        dec: dec;

        ping: ping;
        api: api;
    }
}
