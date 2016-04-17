

type ICallbackTyped <E, R> = (err?: E, result?: R, ...more: any[]) => void;
type ICallback = ICallbackTyped <Error, any>;

interface IApiError {
    msg: string;
    code?: number;
}
type IApiCallback = ICallbackTyped <IApiError, any>


declare namespace speedr {

    type KeyValueTuple = [string, any];
    type KeyValueMap = {[key: string]: any}
    export class Map {
        length: number;
        set(values: KeyValueTuple|KeyValueMap);
        get(key: string): any;
        iter(index: number): KeyValueTuple;
    }
}

declare module 'speedr' {
    export = speedr;
}