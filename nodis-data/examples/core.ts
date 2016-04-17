import * as core from '../core';
import {api} from '../api';


var nodis = new core.Core;
nodis.setApi(api);

nodis.exec(['ping', [(res) => {
    console.log(res);
}]]);

nodis.exec(['set', ['123', '456', (res) => {
    console.log(res);
}]]);


console.log(nodis, nodis.storage.key.map);

