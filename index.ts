import * as serverlib from './src/server/server';
import * as clientlib from './src/client/client';


module nmsg {
    export var server = serverlib;
    export var client = clientlib;
}

export = nmsg;
