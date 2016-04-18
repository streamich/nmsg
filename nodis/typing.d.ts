

type ICallbackTyped <E, R> = (err?: E, result?: R, ...more: any[]) => void;
type ICallback = ICallbackTyped <Error, any>;

interface IApiError {
    msg: string;
    code?: number;
}
type IApiCallback = ICallbackTyped <IApiError, any>
type IApiNoErrorCallback = (result: any, ...more: any[]) => void;


declare namespace speedr {

    type KeyValueTuple = [string, any];
    type KeyValueMap = {[key: string]: any}
    export class Map {
        length: number;
        set(values: KeyValueTuple|KeyValueMap);
        get(key: string): any;
        remove(key: string): number;
        iter(index: number): KeyValueTuple;
    }
}

declare module 'speedr' {
    export = speedr;
}