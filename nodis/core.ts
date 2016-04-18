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


export interface ICommandContext {
    core: Core;         // `core.Core` on which to execute this command.
    meta?: store.IKeyMeta;
}


export interface ICoreOpts {
    api: api.Iapi.Interface;
    storageEngine: aol.StorageEngine.Base;
}


export class Core {

    storage = new store.Storage;
    
    engine: aol.StorageEngine.IBase;
    
    api: api.Iapi.Interface;

    context: ICommandContext = {
        core: this,
    };

    constructor(opts: ICoreOpts) {
        this.engine = opts.storageEngine;
        this.setApi(opts.api);
    }
    
    exec(event: TEvent, args: TArgumentList) {
        var command: TCommand = [event, args];

        var api = this.api;
        if(!api[event]) { // API command does not exist.
            if(args.length) {
                var callback = args[args.length - 1];
                if(typeof callback === 'function')
                    callback({msg: `Command "${event}" does not exit`});
            }
            return;
        }

        var ctx = {
            core: this,
            meta: {
                ts: this.ts(),
            }
        };
        var do_log = api[event].apply(ctx, args);
        if(do_log) this.log(command, ctx.meta);
    }

    setApi(api: api.Iapi.Interface) {
        this.api = {} as api.Iapi.Interface;
        for(var cmd in api) this.api[cmd] = api[cmd];
    }

    log(command: TCommand, meta) {
        // Remove the last callback argument, if any, as we don't need it anymore.
        var [, args] = command;
        if(args && args.length && (typeof args[args.length - 1] === 'function'))
            args.splice(args.length - 1, 1);

        if(meta) command.push(meta);

        if(this.engine) this.engine.write(command);
    }

    ts() {
        return +new Date;
    }
}
