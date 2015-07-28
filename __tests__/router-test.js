'use strict';

jest.dontMock('ramda');
jest.dontMock('../router');

describe('router', function () {

    var Router, routes, router;

    beforeEach(function () {
        Router = require('../router');

        routes = [{
            pattern: ['usersById', /\d+/, 'userName'],
            dataFetch: 'fn'
        }, {
            pattern: ['usersById', /\d+/],
            dataFetch: 'fn'
        }, {
            pattern: ['postsById', /\d+/, ['title', 'desc']],
            dataFetch: 'fn'
        }, {
            pattern: ['postsById', /\d+/],
            dataFetch: 'fn'
        }];

        router = new Router({
            routes: routes
        });

    });

    it('should create a new router', function () {
        var r = new Router({
            routes: []
        });

        expect(r).toBeDefined();
        expect(r.match).toBeDefined();
    });

    it('should handle a single string array query', function () {
        expect(router.match([['postsById', '12']])).toEqual([
            routes[3]
        ]);
    });

    it('should handle a mutli string array query', function () {
        expect(router.match([
            ['postsById', '12'],
            ['usersById', '53'],
            ['somethingById', '55']
        ]))
            .toEqual([
                routes[3],
                routes[1]
            ]);
    });

    it('should handle a mutli string array query', function () {
        expect(router.match([
            ['postsById','12','desc'],
            ['postsById','12','cat'],
            ['usersById','53','userName']
        ]))
            .toEqual([
                routes[2],
                routes[0]
            ]);
    });

});