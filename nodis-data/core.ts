import * as store from './store';
import * as api from './api';


export type TArgument = any;
export type TArgumentList = TArgument[];
export type TCommand = [string, TArgumentList];

// export interface ICommand {
//     cmd: string;
//     args: any[];
// }


export class Core {

    storage = new store.Storage;

    api: api.TCommandList;
    
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
        if(do_log) this.log(command);
    }

    setApi(api: api.TCommandList) {
        for(var cmd in api) api[cmd] = api[cmd].bind(this);
        this.api = api;
    }

    log(command: TCommand) {
        
    }
}


