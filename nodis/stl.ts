
var isArray = Array.isArray || ((obj) => { return toString.call(obj) == '[object Array]'; });

function isFunction(obj) {
    return toString.call(obj) == '[object Function]';
}

function isObjectList(obj) {
    if (isArray(obj) || isFunction(obj)) return false;
    return obj == Object(obj);
}

function toArrayPairs(obj) {
    var tempItems = [];
    for (var k in obj) tempItems[tempItems.length] = [k, obj[k]];
    return tempItems
}


function binarySearch(arr, val, exactMatch = false) {
    var h = arr.length;
    var l = -1;
    while (h - l > 1) {
        var m = (h + l) >> 1;
        if (arr[m] > val) l = m;
        else h = m;
    }
    if (exactMatch) return (arr[h] == val) ? h : -1;
    else return h;
}


type TKey = string;
type TKeyValueTuple <TValue> = [TKey, TValue];
// type TKeyValueMap <TValue> = {[key: string]: TValue}
// type TItems <TValue> = (TKeyValueMap<TValue>|TKeyValueMap<TValue>)[];


export abstract class Base {

    length: number;

    keys: any[] = [];

	updateLength() {
        return this.length = this.keys.length;
    }

    abstract iterKey(index: number);
    abstract iterVal(index: number);

	each(f, start = 0, end = this.length, step = 1) {
        for(var i = start; i < end; i += step) {
            var k = this.iterKey(i);
            var v = this.iterVal(i);
            f(k, v);
        }
    }

    eachKey(f, start = 0, end = this.length, step = 1) {
        for(var i = start; i < end; i += step) f(this.iterKey(i));
    }

    eachVal(f, start = 0, end = this.length, step = 1) {
        for(var i = start; i < end; i += step) f(this.iterVal(i));
    }
}


// Unsorted map with unique keys.
export class Map <T> extends Base {
    revKeys: {[s: string]: number} = {};
    items: {[s: string]: T} = {};

	get(key): T {
        // if(typeof key !== 'string') throw 'Invalid key.';
        return this.items[key];
    }

	set(...items: TKeyValueTuple<T>[]) {
        if(!(items[0] != null)) return this.length;
        // if(isObjectList(items[0])) items = toArrayPairs(items[0]); // TODO: We never use object list, do we?

        var list = items as any as TKeyValueTuple<T>[];
        for(var item of list) {
            // if(!isArray(item)) throw 'Attempted set of invalid item.';
            var [key, val] = item;
			if(!(this.items[key] != null)) { // If does not already exist.
                this.revKeys[key] = this.keys.length;
                this.keys[this.keys.length] = key;
            }
			this.items[key] = val;
        }
		return this.updateLength();
    }

    iterKey(counter) {
        return this.keys[counter];
    }

	iterVal(counter) {
        return this.items[this.keys[counter]];
    }

	remove(key: string) {
        // if(typeof key !== 'string') throw 'Invalid key.';
        if(typeof this.items[key] != 'undefined') {
            delete this.items[key];
            this.keys.splice(this.revKeys[key], 1);
            delete this.revKeys[key];
        }
        return this.updateLength()
    }

    iter(counter) {
        return [this.keys[counter], this.items[this.keys[counter]]];
    }

	has(key) {
        return typeof this.items[key] !== 'undefined';
    }

	clear() {
        this.items = {};
        this.revKeys = {};
        this.keys = [];
        return this.updateLength();
    }
}


//
//
// # a map that is sorted upon insertion.
// # keys must be unique
// class speedr.SortedMap extends BaseMap
// 	constructor: (items...) ->
// 		@keys = []
// 		@vals = []
// 		@set(items...)
// 		@updateLength()
//
// 	get: (key) ->
// 		if not key? then return null
// 		i = speedr.binarySearch(@keys, key, true)
// 		if i == -1 then return null
// 		return @vals[i]
//
// 	set: (items...) ->
// 		if not items[0]? then return @length
// 		# passed object
// 		if isObjectLit(items[0]) then items = toArrayPairs(items[0])
// 		for item in items
// 			if not isArray(item)
// 				throw 'Attempted set of invalid item.'
// 			key = item[0]
// 			val = item[1]
// 			i = speedr.binarySearch(@keys, key)
//
// 			# if the key already exists in the map
// 			if @keys[i] == key
// 				# replace the key's associated value
// 				@vals[i] = val
// 			else
// 				# insert a new item
// 				@keys.splice(i, 0, key)
// 				@vals.splice(i, 0, val)
//
// 		return @updateLength()
//
// 	remove: (key) ->
// 		if not key? then return @length
// 		i = speedr.binarySearch(@keys, key)
// 		@keys.splice(i, 1)
// 		@vals.splice(i, 1)
// 		return @updateLength()
//
// 	pop: ->
// 		@keys.pop()
// 		@vals.pop()
// 		return @updateLength()
//
// 	# note that these iterate from the top down
// 	# (from smaller to larger)
// 	iter: (counter) ->
// 		return [@keys[@length - 1 - counter], @vals[@length - 1 - counter]]
// 	iterKey: (counter) -> return @keys[@length - 1 - counter]
// 	iterVal: (counter) -> return @vals[@length - 1 - counter]
//
// 	hasKey: (key) ->
// 		if speedr.binarySearch(@keys, key, true) == -1
// 			return false
// 		else
// 			return true
//
// 	clear: ->
// 		@keys = []
// 		@vals = []
// 		@updateLength()
// 		return null
//
//
// # a map that is sorted upon insertion.  multiple values can be
// # stored under a single key.  thus, item removal requires both
// # the key *and* the value for if the value is something like a
// # class instance.
// class speedr.SortedMultiMap extends speedr.SortedMap
// 	constructor: (items...) ->
// 		# can't do super(items...) as it would call super many times
// 		# so, just repeat the constructor
// 		@keys = []
// 		@vals = []
// 		@insert(items...)
// 		@updateLength()
//
// 	get: -> return null # in order to get something, we'd have to return a range
// 	set: -> return null
//
// 	insert: (items...) ->
// 		if not items[0]? then return @length
// 		# passed object
// 		if isObjectLit(items[0]) then items = toArrayPairs(items[0])
// 		for item in items
// 			if not isArray(item)
// 				throw 'Attempted insert of invalid item.'
// 			key = item[0]
// 			val = item[1]
// 			i = speedr.binarySearch(@keys, key)
// 			@keys.splice(i, 0, key)
// 			@vals.splice(i, 0, val)
// 		return @updateLength()
//
// 	remove: (key, val) ->
// 		# if we have multiple items with the same key,
// 		# we also need to match the value to remove an item.
// 		# note that not passing a value when you have copied keys
// 		# will result in a random matching entry getting removed
// 		if not key? then return @length
// 		i = speedr.binarySearch(@keys, key)
// 		if val?
// 			j = i - 1
// 			while true
// 				if val == @vals[i] then break
// 				if val == @vals[j]
// 					i = j
// 					break
// 				i++
// 				j--
// 		@keys.splice(i, 1)
// 		@vals.splice(i, 1)
// 		return @updateLength()
//
//
// # export functions
// if module? and exports?
// 	module.exports = speedr
// else
// 	window.speedr = speedr
