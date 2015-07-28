'use strict';

jest.dontMock('ramda');
jest.dontMock('../cache');

describe('router', function () {

    var cache, graph, router;

    beforeEach(function () {
        //var Router = ;
        //var Graph = require('../graph');
        var Cache = require('../cache');

        router = {
            match: jest.genMockFn()
        };

        graph = {
            get: jest.genMockFn(),
            mergeJson: jest.genMockFn()
        };

        cache = new Cache({
            router: router,
            graph: graph
        });
    });


    it('should create a new router', function () {
        expect(cache).toBeDefined();
        expect(cache.read).toBeDefined();
    });

    describe('when no data in cache', function () {

        describe('when route matches a pattern', function () {

            var dataFetchMock, resolvedJson;

            beforeEach(function() {
                resolvedJson = {};
                dataFetchMock = jest.genMockFn();
                dataFetchMock.mockReturnValueOnce(Promise.resolve(resolvedJson));
                router.match.mockReturnValueOnce({
                    pattern: ['usersById', /\d+/],
                    dataMapping: 'map',
                    dataFetch: dataFetchMock
                });
            });

            pit('should try and match route for queries', function () {
                return cache.read(['usersById,123'])
                    .catch(function () {
                        expect(router.match).toBeCalledWith(['usersById','123']);
                        expect(dataFetchMock).toBeCalled();
                        expect(graph.mergeJson).toBeCalledWith(resolvedJson, 'map');
                    });
            });

        });
    });
});