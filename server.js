/*global require*/

'use strict';
var fetch = require('node-fetch');
var GraphRouter = require('./router');
var GraphCache = require('./graph');
var koa = require('koa');
var traverse = require('./traverse');
var extend = require('extend');
var app = koa();

require('koa-qs')(app);

function find(predicate) {
    return function (list) {
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(list);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}


function camelCase(input) {
    return input.replace(/[-_]([a-z])/g, function (str) {
        return str[1].toUpperCase();
    });
}

function objectHasMatchingKey(id, o) {
    if (!o) return false;
    return Object.keys(o).reduce((m, k)=> {
        return id.test(k) && !m ? k : m;
    }, null);
}

class DataAdapter {
    get(model) {
        return new Promise((resolve, reject)=> {
            fetch('http://jsonplaceholder.typicode.com/' + model)
                .then(function (res) {
                    return resolve(res.json());
                })
                .catch(reject);
        });
    }
}

var dataAdapter = new DataAdapter();

var idFieldMap = {
    '0': {
        idField: 'id',
        groupName: 'usersById'
    }
};

var graphCache = new GraphCache({
    categorizer: (parentKey, keys) => {
        //var rx = /^([a-zA-Z0-9]+)?Id$/;

        if (parentKey in idFieldMap) {
            var s = idFieldMap[parentKey];
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
    },
    keyFormatter: camelCase
});

var graphRouter = new GraphRouter({
    cache: graphCache,
    routes: [{
        pattern: ['usersById', /\d+/],
        handler: (args) => {
            return dataAdapter.get('users');
        }
    }, {
        pattern: ['postsById', /\d+/],
        handler: (args) => {
            return dataAdapter.get('posts');
        }
    }]
});


// API SERVER

// x-response-time
app.use(function *(next) {
    var start = new Date();
    yield next;
    var ms = new Date() - start;
    this.set('X-Response-Time', ms + 'ms');
});

// logger
app.use(function *(next) {
    yield next;
    console.log('%s %s (%s)', this.method, this.url, this.url.length);
});

// response
app.use(function* () {
    var data = yield graphRouter.handle(this.query);
    this.body = data;
});

app.listen(3000);

//
///// QUICK WEB SERVER
//var serve = require('koa-static');
//var appServer = koa();
//
//// or use absolute paths
//appServer.use(serve(__dirname + '/public'));
//
//appServer.listen(4000);
