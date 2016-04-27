import * as store from './store';
import * as api from './api';
import * as aol from './aol';
import debuglib = require('debug');
var debug = debuglib('nodis:core');


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
    err: aol.AolFile;
}


export class Core {

    storage = new store.Storage;
    
    engine: aol.StorageEngine.IBase;

    err: aol.AolFile;
    
    api: api.Iapi.Interface;

    context: ICommandContext = {
        core: this,
    };

    constructor(opts: ICoreOpts) {
        this.engine = opts.storageEngine;
        this.err = opts.err;
        this.setApi(opts.api);
    }
    
    start(done: (err) => void) {
        var onCommand = (cmd) => {
            var [event, args, meta] = cmd;
            // TODO: Validate incoming data.
            this.exec(event, args, meta);
        };
        var onParseError = (err) => {
            this.logError(err);
        };
        this.engine.replay(onCommand, onParseError, (err?) => {
            if(err) this.logError(err);
            done(err);
        });
    }
    
    exec(event: TEvent, args: TArgumentList, meta?) {
        var command: TCommand = [event, args];

        var api = this.api;
        if(!api[event]) { // API command does not exist.
            if(args.length) {
                var callback = args[args.length - 1];
                if(typeof callback === 'function')
                    callback({msg: `Command "${event}" does not exit`});
                this.logError({msg: 'Invalid command', cmd: event});
            }
            return;
        }

        if(!meta) meta = {ts: this.ts()};
        var ctx = {
            core: this,
            meta: meta,
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

    logError(obj: any) {
        debug('ERROR', obj);
        if(obj instanceof Error) {
            console.log(obj.stack);
            this.err.write({msg: obj.message});
        } else this.err.write(obj);
    }
}
