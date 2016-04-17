import * as store from './store';
import * as api from './api';


export type TArgument = any;
export type TArgumentList = TArgument[];
export type TCommand = [string, TArgumentList];

export interface IaofWriter {
    write(obj: any);
}


export interface ICoreOpts {
    aof: IaofWriter;
}


export class Core {

    storage = new store.Storage;

    api: api.TCommandList;

    opts: ICoreOpts = {
        aof: null,
    };

    constructor(opts: ICoreOpts) {
        this.opts = opts;
    }
    
    exec(command: TCommand) {
        var [cmd, args] = command;

        // if(typeof cmd !== 'string') return;
        // if(!(args instanceof Array)) return;

        if(!this.api[cmd]) { // API command does not exist.
            if(args.length) {
                var callback = args[args.length - 1];
                if(typeof callback === 'function')
                    callback({msg: `Command "${cmd}" does not exit`});
            }
            return;
        }

        var do_log = this.api[cmd].apply(this, args);

        // Remove the last callback argument, if any, as we don't need it anymore.
        if(args.length && (typeof args[args.length - 1] === 'function')) args.splice(args.length - 1, 1);

        if(do_log) this.log(command);
    }

    setApi(api: api.TCommandList) {
        for(var cmd in api) api[cmd] = api[cmd].bind(this);
        this.api = api;
    }

    log(command: TCommand) {
        this.opts.aof.write(command);
    }
}


