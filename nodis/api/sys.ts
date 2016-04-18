import {Core} from '../core';


export var ping = function(callback: (pong: string) => void) {
    if(typeof callback === 'function') callback('pong');
};



