var Combinatorics = require('js-combinatorics');


var replicas = 2;
var nodes = 4;

var min_key = 0;
var max_key = 1000;

var combinations = Combinatorics.C(nodes, replicas);
console.log(combinations);

var partition = (max_key - min_key) / combinations;
partition = Math.round(partition);

var partitions = [], lower_bound = min_key;
for(var i = 0; i < combinations - 1; i++) {
    partitions.push([lower_bound, lower_bound + partition]);
    lower_bound += partition;
}
partitions.push([lower_bound, max_key]);


var part_combs = [];
cmb = Combinatorics.combination(partitions, replicas);
while(a = cmb.next()) part_combs.push(a);

console.log(part_combs);
// var node_partitions = new Array(nodes);


