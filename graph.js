/*global require*/

'use strict';

var traverse = require('./traverse');
var extend = require('extend');

function isArrayOfObjects(v) {
    return Array.isArray(v) && v.length && typeof v[0] === 'object' && !Array.isArray(v[0]);
}

function graphFactory(categorizer, keyFormatter) {

    var graph = {};

    keyFormatter = keyFormatter || ((k) => k);

    function createResourceMapFromArray(idFieldName, arr) {
        return arr.reduce((m, v)=> {
            if (v.hasOwnProperty(idFieldName)) {
                m[v[idFieldName]] = v;
            } else {
                console.warn("Field not found:" + idFieldName, 'in', v);
            }
            return m;
        }, {});
    }

    function createSymLinksFromArray(rootKey, idFieldName, arr) {
        return arr.reduce((m, v, i)=> {
            m[i] = [rootKey, v[idFieldName]];
            return m;
        }, {});
    }

    function encode(json) {
        traverse([json], function (key, val) {
            var formattedKey = keyFormatter(key);
            if (!formattedKey) throw new Error("Unable to format key: " + key);

            this.key(formattedKey);

            if (isArrayOfObjects(val)) {

                var d = categorizer(key, Object.keys(val[0]));

                if (d) {
                    var idField = d.idField,
                        idRoot = d.groupName;

                    if (idField && idRoot) {
                        this.val(createSymLinksFromArray(idRoot, idField, val));
                        mergeIntoRoot(idRoot, createResourceMapFromArray(idField, val));
                    } else {
                        console.warn("Missing root key or id field", key, idField);
                    }

                } else {
                    console.warn('No cat for', key, Object.keys(val[0]));
                }
            }
        });
    }

    function decode(graph) {
        // TODO: decide graph to original json
        return {};
    }

    function cursor(path) {
        return {
            get: () => 42,
            set: (graph) => {
                console.log('Setting', graph);
            }
        };
    }

    function mergeIntoRoot(root, g) {
        var o = {};
        o[root] = g;
        extend(true, graph, o);
    }

    return {
        mergeJson: encode,
        cursor: cursor,
        get: function () {
            return graph;
        }
    };

}

class GraphCache {

    constructor({ categorizer: categorizer, keyFormatter: keyFormatter }) {
        this._graph = graphFactory(categorizer, keyFormatter);
    }

    resolve(path) {
        return this._graph.cursor(path);
    }

    get(dataResolver, path) {
        return new Promise((resolve, reject)=> {

            // TODO: check cache first

            dataResolver(path)
                .then((json)=> {
                    this._graph.mergeJson(json);
                    // TODO: resolve just the requested path
                    resolve(this._graph.get());
                })
                .catch((err)=> {
                    console.log('ERR', err);
                    reject(err);
                });
        });
    }

}

module.exports = GraphCache;