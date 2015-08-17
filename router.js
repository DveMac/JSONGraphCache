/*global require*/

'use strict';
var R = require('ramda');
//var log = require('./logger').createLogger('router');

var asArray = (x) => Array.isArray(x) ? x : [x];

var asRegexp = R.map((x) => {
    return x && ((typeof x.exec === 'function') ? x :
            (x === '*' ? new RegExp('\w+', 'i') : new RegExp(x, 'i')));
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
        var m = R.find((route) => match(route.pattern, pathParts))(routes);
        //log.debug('match', pathParts, m);
        return m;
    };
}

class Router {

    constructor({ routes: routes }) {
        //log.debug('constructor', routes);
        this.match = createRouter(routes);
    }

}

module.exports = Router;
