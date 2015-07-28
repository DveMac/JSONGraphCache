/*global require*/

'use strict';
var R = require('ramda');

var asArray = (x) => Array.isArray(x) ? x : [x];

var asRegexp = R.map((x) => {
    return x && ((typeof x.exec === 'function') ? x : new RegExp(x, 'i'));
});

var asRegexpArray = R.compose(asRegexp, asArray);

var anyRegexMatches = (z, x) => R.any((regexp) => regexp.test(x))(asRegexpArray(z));

function createRouter(routes) {

    var match = R.memoize(function (pattern, pathParts) {
        var i = 0;
        return (pattern.length >= pathParts.length) &&
            R.all((patternPart) => anyRegexMatches(patternPart, pathParts[i++]))(pattern);
    });

    return (pathParts) => {
        return R.find((route) => match(route.pattern, pathParts))(routes);
    };

}

class Router {

    constructor({ routes: routes }) {
        this._matcher = R.compose(
            R.reject((x)=> !x),
            R.map(createRouter(routes)));
    }

    match(queries) {
        return !queries ?
            Promise.resolve({ status: 400 }) :
            this._matcher(queries);
    }

}

module.exports = Router;
