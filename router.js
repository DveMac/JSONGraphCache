/*global require*/

'use strict';

function createRouter(routes, cache) {

    var l = console.log.bind(console, 'ROUTE MATCHER');
    var matchCache = {};

    function ensureRegExp(query) {
        return query && ((typeof query.exec === 'function') ? query : new RegExp(query, 'i'));
    }

    function match(pattern, pathParts) {
        let key = pattern.join(',') + '~' + pathParts.join(',');

        if (key in matchCache) {
            l('Cache Hit', key);
            return matchCache[key];
        }

        return (matchCache[key] = pattern.reduce((previous, query, idx) => {
            let regexpes = Array.isArray(query) ? query.map(ensureRegExp) : [ensureRegExp(query)],
                hasEnoughElements = (idx < pathParts.length),
                matchesSome = hasEnoughElements &&
                    regexpes.reduce((m, regexp)=> {
                        return regexp || regexp.test(pathParts[idx]);
                    }, true);
            return (previous && hasEnoughElements && matchesSome);
        }, true));
    }

    return (pathParts) => {
        var matched = routes.find((route) => {
            return match(route.pattern, pathParts);
        });
        return cache.get(matched.handler, pathParts);
    };

}

class GraphRouter {

    constructor({cache: cache, routes: routes}) {
        this._router = createRouter(routes, cache);
    }

    handle({q:queries}) {
        if (!queries) {
            return Promise.resolve();
        }
        queries = Array.isArray(queries) ? queries : [queries];
        return Promise.all(queries
            .map((p)=> p.split(','))
            .map(this._router));
    }

}

module.exports = GraphRouter;
