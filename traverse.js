'use strict';

var extend = require('extend');

var isArr = Array.isArray;

var isObject = (v) => v !== null && typeof(v) === 'object';

var isPrimitive = (val) => val == null || /^[sbn]/.test(typeof val);

function map(obj, key, func) {
    var newKey = key,
        val = isObject(obj[key]) ? traverse(obj[key], func) : obj[key];

    func.call({
        val: (v) => (val = v),
        key: function (k) {
            if (k && k !== key && !isArr(obj)) {
                this.del();
                newKey = k;
            }
            return key;
        },
        del: () => { delete obj[key]; }
    }, key, val, obj);

    obj[newKey] = val;
}

function traverse(obj, func) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            map(obj, key, func);
        }
    }
    return obj;
}

module.exports = function (o, func) {
    if (isPrimitive(o)) return o;
    func = func || ((x) => x);
    return traverse(extend(true, o), func);
};
