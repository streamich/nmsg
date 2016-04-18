var config = require('../nodis.config');
import {createClient} from '../client';



var client = createClient(1337).start();


var time = 0;

var data = {
    "glossary": {
        "title": "example glossary",
        "GlossDiv": {
            "title": "S",
            "GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
                    "SortAs": "SGML",
                    "GlossTerm": "Standard Generalized Markup Language",
                    "Acronym": "SGML",
                    "Abbrev": "ISO 8879:1986",
                    "GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
                        "GlossSeeAlso": ["GML", "XML"]
                    },
                    "GlossSee": "markup"
                }
            }
        }
    }
};

function next(i) {
    if(!i) {
        console.log('done');
        console.log(+new Date() - time);
        return;
    }

    var key = '' + (+new Date());
    client.cmd('set', key, data, function() {
        client.cmd('get', key, function(err, value) {
            // console.log(err, value);
            i--;
            next(i);
        });
    });
}

setTimeout(function() {
    time = +new Date;
    next(10000);
}, 1000);
