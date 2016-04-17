"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isArray = Array.isArray || (function (obj) { return toString.call(obj) == '[object Array]'; });
function isFunction(obj) {
    return toString.call(obj) == '[object Function]';
}
function isObjectList(obj) {
    if (isArray(obj) || isFunction(obj))
        return false;
    return obj == Object(obj);
}
function toArrayPairs(obj) {
    var tempItems = [];
    for (var k in obj)
        tempItems[tempItems.length] = [k, obj[k]];
    return tempItems;
}
function binarySearch(arr, val, exactMatch) {
    if (exactMatch === void 0) { exactMatch = false; }
    var h = arr.length;
    var l = -1;
    while (h - l > 1) {
        var m = (h + l) >> 1;
        if (arr[m] > val)
            l = m;
        else
            h = m;
    }
    if (exactMatch)
        return (arr[h] == val) ? h : -1;
    else
        return h;
}
var Base = (function () {
    function Base() {
        this.keys = [];
    }
    Base.prototype.updateLength = function () {
        return this.length = this.keys.length;
    };
    Base.prototype.each = function (f, start, end, step) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.length; }
        if (step === void 0) { step = 1; }
        for (var i = start; i < end; i += step) {
            var k = this.iterKey(i);
            var v = this.iterVal(i);
            f(k, v);
        }
    };
    Base.prototype.eachKey = function (f, start, end, step) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.length; }
        if (step === void 0) { step = 1; }
        for (var i = start; i < end; i += step)
            f(this.iterKey(i));
    };
    Base.prototype.eachVal = function (f, start, end, step) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.length; }
        if (step === void 0) { step = 1; }
        for (var i = start; i < end; i += step)
            f(this.iterVal(i));
    };
    return Base;
}());
exports.Base = Base;
// Unsorted map with unique keys.
var Map = (function (_super) {
    __extends(Map, _super);
    function Map() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        _super.call(this);
        this.revKeys = {};
        this.items = {};
        this.set(items);
        this.updateLength();
    }
    Map.prototype.get = function (key) {
        // if(typeof key !== 'string') throw 'Invalid key.';
        return this.items[key];
    };
    Map.prototype.set = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        if (!(items[0] != null))
            return this.length;
        if (isObjectList(items[0]))
            items = toArrayPairs(items[0]);
        var list = items;
        for (var _a = 0, list_1 = list; _a < list_1.length; _a++) {
            var item = list_1[_a];
            // if(!isArray(item)) throw 'Attempted set of invalid item.';
            var key = item[0], val = item[1];
            if (!(this.items[key] != null)) {
                this.revKeys[key] = this.keys.length;
                this.keys[this.keys.length] = key;
            }
            this.items[key] = val;
        }
        return this.updateLength();
    };
    Map.prototype.iterKey = function (counter) {
        return this.keys[counter];
    };
    Map.prototype.iterVal = function (counter) {
        return this.items[this.keys[counter]];
    };
    Map.prototype.remove = function (key) {
        // if(typeof key !== 'string') throw 'Invalid key.';
        if (typeof this.items[key] != 'undefined') {
            delete this.items[key];
            this.keys.splice(this.revKeys[key], 1);
            delete this.revKeys[key];
        }
        return this.updateLength();
    };
    Map.prototype.iter = function (counter) {
        return [this.keys[counter], this.items[this.keys[counter]]];
    };
    Map.prototype.has = function (key) {
        return typeof this.items[key] !== 'undefined';
    };
    Map.prototype.clear = function () {
        this.items = {};
        this.revKeys = {};
        this.keys = [];
        return this.updateLength();
    };
    return Map;
}(Base));
exports.Map = Map;
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
