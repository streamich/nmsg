import {extend} from './util';
import * as keys from './api/keys';
import * as sys from './api/sys';

export type TCommandList = {[command: string]: (...args: any[]) => void};

var list = extend({},
    keys,
    sys
);
export var api = list as TCommandList;

