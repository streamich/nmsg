import * as store from './store';
import * as api from './api';
import * as aol from './aol';


export type TArgument = any;
export type TArgumentList = TArgument[];
export type TEvent = string;
export type TCommand = [TEvent, TArgumentList];

export interface IaofWriter {
    write(obj: any);
}


export interface ICoreOpts {
    api: api.TCommandList;
    storageEngine: aol.StorageEngine.Base;
}


export class Core {

    storage = new store.Storage;
    
    engine: aol.StorageEngine.IBase;
    
    api: api.TCommandList;

    constructor(opts: ICoreOpts) {
        this.engine = opts.storageEngine;
        this.setApi(opts.api);
    }
    
    exec(event: TEvent, args: TArgumentList) {
        var command: TCommand = [event, args];

        // `nmsg-rpc` ensures below type safety:
        // if(typeof cmd !== 'string') return;
        // if(!(args instanceof Array)) return;

        var api = this.api;
        if(!api[event]) { // API command does not exist.
            if(args.length) {
                var callback = args[args.length - 1];
                if(typeof callback === 'function')
                    callback({msg: `Command "${event}" does not exit`});
            }
            return;
        }

        var do_log = api[event].apply(this, args);

        // Remove the last callback argument, if any, as we don't need it anymore.
        if(args.length && (typeof args[args.length - 1] === 'function')) args.splice(args.length - 1, 1);

        if(do_log) this.log(command);
    }

    setApi(api: api.TCommandList) {
        this.api = {};
        for(var cmd in api) this.api[cmd] = api[cmd].bind(this);
    }

    log(command: TCommand) {
        if(this.engine) this.engine.write(command);
    }
}


