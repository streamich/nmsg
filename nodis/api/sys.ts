import {Core} from '../core';
import {Key} from '../store';
import {noop} from '../util';
import {Iapi} from '../api';


export var ping = function(callback: (pong: string) => void) {
    if(typeof callback === 'function') callback('pong2');
};


export var api: Iapi.api = function(callback) {
    if(typeof callback !== 'function') return;

    var core = this.core as Core;
    callback(Object.keys(core.api));
};


export var fsync = function(callback) {

};

