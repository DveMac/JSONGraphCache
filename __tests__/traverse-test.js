'use strict';
jest.dontMock('extend');
jest.dontMock('../traverse');

function isPrimitive(val) {
    return val == null || /^[sbn]/.test(typeof val);
}

function hasProp(o, k) {
    return hasOwnProperty.call(o, k);
}

describe('traverse', function () {


    var test;
    var traverse;

    beforeEach(function () {
        traverse = require('../traverse');
        test = {
            'number': 1,
            'string': 'cat',
            'date': new Date(),
            'array': [1, 2, 'fish', new Date(), null],
            'object': {
                field: 1
            },
            'emptyField': undefined,
            emptyArray: [],
            'nestedObjects': {
                field: 1,
                subObject: {
                    subfield: 2,
                    subArray: [1, 2, 3]
                }
            },
            func: function () {
            },
            'objectArray': [{id: 1, name: 'cat'}, {id: 2, name: 'dog'}]
        };
    });

    it('should return input value if a primative', function () {
        expect(traverse("a")).toBe("a");
        expect(traverse(1)).toBe(1);
    });

    it('should iterate over all objects and arrays', () => {
        var count = 0;
        traverse(test, ()=> count += 1);
        expect(count).toBe(29);
        traverse([test], ()=> count += 1);
        expect(count).toBe(59);
    });

    it('should return a new object or array', function () {
        var result = traverse(test);
        var test2 = [test],
            resultArr = traverse(test2);

        expect(result).toEqual(test);
        expect(resultArr).toEqual(test2);
    });

    it('should allow values to be updated', function () {
        var result = traverse(test, function (k, v) {
            if (k === 'object' || k === 'subObject') this.val([v]);
            if (isPrimitive(v)) this.val(v + '1');
        });
        expect(result.number).toEqual('11');
        expect(result.string).toEqual('cat1');
        expect(result.object).toEqual([{field: '11'}]);
        expect(result.objectArray[1]).toEqual({id: '21', name: 'dog1'});
        expect(Array.isArray(result.nestedObjects.subObject)).toBeTruthy();
        expect(Array.isArray(result.nestedObjects.subObject[0])).toBeFalsy();
    });

    it('should allow keys to be updated', function () {
        var result = traverse(test, function (k) {
            this.key(k + '1');
        });

        expect(hasProp(result, 'number')).toBeFalsy();
        expect(hasProp(result, 'number1')).toBeTruthy();

        expect(hasProp(result.object1, 'field')).toBeFalsy();
        expect(hasProp(result.object1, 'field1')).toBeTruthy();

        expect(Array.isArray(result.array1)).toBeTruthy();

        expect(result.objectArray1[1]).toEqual({id1: 2, name1: 'dog'});
    });

    it('should allow keys and values to be updated', function () {
        var result = traverse(test, function (k, v) {
            this.key(k + '1');
            if (isPrimitive(v)) this.val(v + '1');
        });

        expect(hasProp(result, 'number')).toBeFalsy();
        expect(result.number1).toEqual('11');

        expect(hasProp(result.object1, 'field')).toBeFalsy();
        expect(hasProp(result.object1, 'field1')).toBeTruthy();

        expect(Array.isArray(result.array1)).toBeTruthy();

        expect(result.string1).toEqual('cat1');
        expect(result.objectArray1[1]).toEqual({id1: '21', name1: 'dog1'});
    });


});

