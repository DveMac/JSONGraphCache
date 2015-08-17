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
            pattern: ['postsById', /\d+/, '*'],
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

    it('should handle a single query', function () {
        expect(router.match(['usersById', '12']))
            .toEqual(routes[1]);
    });

    it('should handle unmatched queries', function () {
        expect(router.match(['somethingById', '55']))
            .toEqual();
    });

    it('should handle single option field queries', function () {
        expect(router.match(['usersById', '53', 'userName']))
            .toEqual(routes[0]);
    });

    it('shpuld handle multi option field queries', function () {
        expect(router.match(['postsById', '53', 'title']))
            .toEqual(routes[2]);
    });

    it('shpuld handle wildcard field queries', function () {
        expect(router.match(['postsById', '53', 'cabbage']))
            .toEqual(routes[3]);
    });

});