'use strict';
var R = require('ramda');

var asArray = (x) => Array.isArray(x) ? x : [x];


var paths = R.compose(
    R.map(R.split(',')),
    asArray
);

class Cache {

    constructor({ router: router, graph: graph }) {
        this.router = router;
        this.graph = graph;
    }

    read(queries) {
        var promises = paths(queries).map((q)=>{
            var route, d = this.graph.get(q);

            if (d) {
                return Promise.resolve(d);
            }

            if ((route = this.router.match(q))) {
                if (route) {
                    return route.dataFetch().then((json)=> {
                        this.graph.mergeJson(json, route.dataMapping);
                        return Promise.resolve(this.graph.get(q));
                    });
                }
            }

            return Promise.reject();

        });


        return Promise.all(promises);

    }
}

module.exports = Cache;