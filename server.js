/*global require*/

'use strict';
var fetch = require('node-fetch');
var Router = require('./router');
var Graph = require('./graph');
var Cache = require('./cache');
var koa = require('koa');
var traverse = require('./traverse');
var extend = require('extend');
var app = koa();

require('koa-qs')(app);


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

var graph = new Graph();

var router = new Router({
    routes: [{
        pattern: ['usersById', /\d+/],
        dataMapping: {
            '0': {
                idField: 'id',
                groupName: 'usersById'
            }
        },
        dataFetch: () => {
            return dataAdapter.get('users');
        }
    }, {
        pattern: ['postsById', /\d+/],
        dataMapping: {
            '0': {
                idField: 'id',
                groupName: 'postsById'
            }
        },
        dataFetch: () => {
            return dataAdapter.get('posts');
        }
    }]
});



var cache = new Cache({
    graph: graph,
    router: router
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
    var { q: queries } = this.query;
    var r = yield cache.read(queries);
    console.log(r);
    this.type = 'application/json';
    this.body = r.body;
    this.status = r.status || 200;
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
