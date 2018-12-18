var _ = require('lodash');
var expect = require('expect');
var Graph = require('../graph.js');

/**
 *  Route management test plan.
 */
describe('Graph routes APIs', function () {

    var graph = new Graph();

    /**
     * Helper function that will map an array
     * of routes to an aray of array of node identifiers.
     */
    var routesToArray = function (routes) {
        var input = [];

        _.each(routes, function (route) {
            var map = _.map(route.path, 'id');
            input.push({ path: map, weight: route.weight });
        });
        return input;
    };

    /**
     * Building the graph using a predefined path :
     *
     *                             Head
     *                              ||
     *                             /  \
     *                            \/  \/
     *                           foo  bar
     *                           ||   ||
     *                            \   /
     *                             \ /
     *                              |
     *                             baz
     */
    beforeEach(function () {
        graph.addEdge('head', 'foo', { weight: 1 });
        graph.addEdge('head', 'bar', { weight: 1 });
        graph.addEdge('foo', 'baz', { weight: 2 });
        graph.addEdge('bar', 'baz', { weight: 2 });
    });

    it('should be able to return all the routes having a node `n` as the head', function () {
        var result_head = [
            { path: ['head', 'foo'], weight: 1 },
            { path: ['head', 'foo', 'baz'], weight: 3 },
            { path: ['head', 'bar'], weight: 1 },
            { path: ['head', 'bar', 'baz'], weight: 3 }
        ];

        var result_foo = [
            { path: ['foo', 'baz'], weight: 2 }
        ];

        var output_head = routesToArray(graph.routes({ from: 'head' }));
        var output_foo  = routesToArray(graph.routes({ from: 'foo' }));

        expect(JSON.stringify(result_head)).toEqual(JSON.stringify(output_head));
        expect(JSON.stringify(result_foo)).toEqual(JSON.stringify(output_foo));
    });

    it('should be able to return all the routes having a node `n` as the head using additional query parameters', function () {
        var result = [
            { path: ['head', 'foo', 'baz'], weight: 3 },
            { path: ['head', 'bar', 'baz'], weight: 3 }
        ];

        var output = routesToArray(graph.routes({
            from: 'head',
            where: {
                length: 3
            }
        }));

        expect(JSON.stringify(result)).toEqual(JSON.stringify(output));
    });

    it('should be able to find a route given an array of node identifiers', function () {
        // Searching for the route head->foo->baz
        var route = graph.findRoute(['head', 'foo', 'baz']);
        expect(route).not.toBe(undefined);
        expect(route.weight).toEqual(3);
        expect(route.path.length).toEqual(3);

        // Searching for the route foo->baz
        route = graph.findRoute(['foo', 'baz']);
        expect(route).not.toBe(undefined);
        expect(route.weight).toEqual(2);
        expect(route.path.length).toEqual(2);

        // Searching for an invalid route
        route = graph.findRoute(['baz']);
        expect(route).toBe(undefined);
    });

    it('should be able to state whether a route exists in the graph', function () {
        // Retrieving all the routes existing in the graph
        // which have `head` as the head node.
        var routes = graph.routes({ from: 'head' });

        _.each(routes, function (route) {
            expect(graph.hasRoute(route)).toBeTruthy();
        });
        graph.clear();
        // Verifying that the `hasRoute` method returns
        // false if the routes do not exist anymore.
        _.each(routes, function (route) {
            expect(graph.hasRoute(route)).toBeFalsy();
        });
    });
});
