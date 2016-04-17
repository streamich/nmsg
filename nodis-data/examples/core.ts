import * as core from '../core';
import {api} from '../api';
import {LineWriter} from '../../nodis-log/log';


var opts = {
    aof: LineWriter.createFromFile(__dirname + '/../data/aof.json.log'),
};

var nodis = new core.Core(opts);
nodis.setApi(api);

nodis.exec(['ping', [(res) => {
    console.log(res);
}]]);

nodis.exec(['set', ['123', '456', (res) => {
    console.log(res);
}]]);

nodis.exec(['set', ['g3dsf2', {id: 'g3dssf', 'name': 'troller'}, (res) => {
    console.log(res);
}]]);

nodis.exec(['get', ['123', (err, res) => {
    console.log('get', res);
}]]);

nodis.exec(['del', ['123']]);

console.log(nodis, nodis.storage.key.map);

