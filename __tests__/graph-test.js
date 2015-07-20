'use strict';
require('jasmine-pit').install(window);
jest.dontMock('extend');
jest.dontMock('../traverse');
jest.dontMock('../graph');


describe('graph', function () {

    var test, GraphCache, dataResolve;

    function categorizer (parentKey, keys) {
        return ({
            '0': {
                idField: 'eventId',
                groupName: 'eventById'
            },
            'location': {
                idField: 'locationId',
                groupName: 'locationById'
            },
            'attendeeList': {
                idField: 'attendeeId',
                groupName: 'attendeeById'
            },
            'owner_details': {
                idField: 'attendeeId',
                groupName: 'attendeeById'
            }
        }[parentKey]);
    }

    function camelCase(input) {
        return input.replace(/[-_]([a-z])/g, function (str) {
            return str[1].toUpperCase();
        });
    }

    beforeEach(function () {
        GraphCache = require('../graph');
        test = [[{
            event_id: 123,
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
        }]];
        dataResolve = function () {
            return Promise.resolve(test);
        };
    });

    pit('should return graph encoded json', function () {
        var graphCache = new GraphCache({
            categorizer: categorizer,
            keyFormatter: camelCase
        });

        return graphCache.get(dataResolve, ['eventById', '123'])
            .then(function (data) {
                expect(data).toEqual({
                    attendeeById: {
                        '112': {
                            attendeeId: 112,
                            name: 'jill'
                        },
                        '2312': {
                            attendeeId: 2312,
                            name: 'bob'
                        },
                        '7612': {
                            attendeeId: 7612,
                            name: 'sally'
                        }
                    },
                    eventById: {
                        '123': {
                            eventId: 123,
                            eventName: 'something',
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
                            locationId: 444,
                            coords: {
                                lat: 52.45454,
                                long: 24.222
                            },
                            ownerDetails: {
                                '0': ['attendeeById', 2312]
                            }
                        }
                    }
                });
            });

    });

});