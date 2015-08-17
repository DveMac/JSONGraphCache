'use strict';

var traverse = require('./traverse');
var extend = require('extend');

function isArrayOfObjects(v) {
    return Array.isArray(v) && v.length && typeof v[0] === 'object' && !Array.isArray(v[0]);
}

function graphFactory() {

    var graph = {};

    function createResourceMapFromArray(idFieldName, arr) {
        return arr.reduce((m, v)=> {
            if (v.hasOwnProperty(idFieldName)) {
                m[v[idFieldName]] = v;
            } else {
                console.warn('Field not found:' + idFieldName, 'in', v);
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


    var createMapper = function (mapping) {
        return (parentKey, keys) => {
            //var rx = /^([a-zA-Z0-9]+)?Id$/;
            if (parentKey in mapping) {
                var s = mapping[parentKey];
                if (!s) return false;

                if (keys.indexOf(s.idField) >= 0) {
                    return s;
                } else {
                    console.error(keys);
                    throw new Error('No field in keys: ' + s.idField);
                }
            } else {
                console.error(keys);
                throw new Error('No hash value for: ' + parentKey);
            }
        };
    };

    function encode(json, mapping) {
        var categorizer = createMapper(mapping);
        traverse([json], function (key, val) {
            if (isArrayOfObjects(val)) {

                var d = categorizer(key, Object.keys(val[0]));
                if (d) {
                    var idField = d.idField,
                        groupName = d.groupName;

                    if (idField && groupName) {
                        this.val(createSymLinksFromArray(groupName, idField, val));
                        mergeIntoRoot(groupName, createResourceMapFromArray(idField, val));
                    } else {
                        console.warn("Missing root key or id field", key, idField);
                    }

                } else {
                    console.warn('No cat for', key, Object.keys(val[0]));
                }
            }
        });
    }

    function cursor() {
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
        get: function (path) {
            if (!path) return {};
            if (path.length === 1 && graph[path[0]]) {
                return graph[path[0]];
            }
            if (path.length === 2 && graph[path[0]] && graph[path[0]][path[1]]) {
                return graph[path[0]][path[1]];
            }
            return null;
        }
    };

}

class Graph {

    constructor() {
        this._graph = graphFactory();
    }

    get(path) {
        return this._graph.get(path);
    }

    mergeJson(json, mapping) {
        this._graph.mergeJson(json, mapping);

    }

}

module.exports = Graph;