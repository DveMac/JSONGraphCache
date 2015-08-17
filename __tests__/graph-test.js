'use strict';
require('jasmine-pit').install(window);
jest.dontMock('extend');
jest.dontMock('../traverse');
jest.dontMock('../graph');


describe('graph', function () {

    var test, expected, Graph, dataResolve;

    var mapping = {
        '0': {
            idField: 'event_id',
            groupName: 'eventById'
        },
        'location': {
            idField: 'location_id',
            groupName: 'locationById'
        },
        'attendeeList': {
            idField: 'attendee_id',
            groupName: 'attendeeById'
        },
        'owner_details': {
            idField: 'attendee_id',
            groupName: 'attendeeById'
        }
    };

    function camelCase(input) {
        return input.replace(/[-_]([a-z])/g, function (str) {
            return str[1].toUpperCase();
        });
    }

    beforeEach(function () {
        Graph = require('../graph');

        test = [{
            event_id: 123,
            user_id: 1,
            event_name: 'something',
            location: [{
                location_id: 444,
                address1: '123 My street',
                coords: {
                    lat: 52.45454,
                    long: 24.222
                },
                owner_details: [{
                    attendee_id: 2312,
                    name: 'bob'
                }]
            }],
            attendeeList: [{
                attendee_id: 2312,
                name: 'bob'
            }, {
                attendee_id: 7612,
                name: 'sally'
            }, {
                attendee_id: 112,
                name: 'jill'
            }],
            about: 'text about event'
        }];

        expected = {
            attendeeById: {
                '112': {
                    attendee_id: 112,
                    name: 'jill'
                },
                '2312': {
                    attendee_id: 2312,
                    name: 'bob'
                },
                '7612': {
                    attendee_id: 7612,
                    name: 'sally'
                }
            },
            eventById: {
                '123': {
                    user: ['usersById', 1],
                    event_id: 123,
                    event_name: 'something',
                    location: {
                        '0': ['locationById', 444]
                    },
                    attendeeList: {
                        '0': ['attendeeById', 2312],
                        '1': ['attendeeById', 7612],
                        '2': ['attendeeById', 112]
                    },
                    about: 'text about event'
                }
            },
            'locationById': {
                '444': {
                    address1: '123 My street',
                    location_id: 444,
                    coords: {
                        lat: 52.45454,
                        long: 24.222
                    },
                    owner_details: {
                        '0': ['attendeeById', 2312]
                    }
                }
            }
        };

        dataResolve = function () {
            return Promise.resolve(test);
        };
    });

    it('should return graph encoded json', function () {
        var graph = new Graph();

        graph.mergeJson(test, mapping);

        expect(graph.get(['locationById', '444'])).toEqual(expected.locationById['444']);
        expect(graph.get(['eventById', '123', 'user']).user).toEqual(expected.eventById['123'].user);

    });

});