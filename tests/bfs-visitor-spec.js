var _ = require('lodash');
var expect = require('expect');
var Graph = require('../graph.js');

/**
 *  BFS test plan.
 */
describe('Breadth-First search visitor', function () {

    var graph = new Graph();

    /**
     * Building the graph using a predefined path :
     *
     *                             Head
     *                              ||
     *                            /   \
     *                           \/   \/
     *                          foo   bar
     *                          ||    ||
     *                           \    /
     *                           \   /
     *                            \/
     *                           baz
     */
    beforeEach(function () {
        graph.addEdge('head', 'foo');
        graph.addEdge('head', 'bar');
        graph.addEdge('foo', 'baz');
        graph.addEdge('bar', 'baz');
    });

    it('should be able to iterate over the nodes in the graph', function () {
        var result = [['head'], ['foo', 'bar'], ['baz']];
        var nodes = [];
        var saved_level;

        Graph.Visitor.BFS(graph, 'head', function (array, level) {
            nodes.push(_.map(array, 'id'));
            saved_level = level;
        });
        expect(JSON.stringify(nodes)).toEqual(JSON.stringify(result));
        expect(saved_level).toEqual(result.length - 1);
    });

    it('should throw an error if the head node is not available', function () {
        graph.clear();
        expect(function () {
            Graph.Visitor.BFS(graph, 'head');
        }).toThrow();
    });

    it('should not return any other node than the head node if it does not have any adjacents nodes', function () {
        var result = [['head']];
        var nodes = [];

        graph.removeEdge('head', 'foo');
        graph.removeEdge('head', 'bar');
        Graph.Visitor.BFS(graph, 'head', function (array) {
            nodes.push(_.map(array, 'id'));
        });
        expect(JSON.stringify(nodes)).toEqual(JSON.stringify(result));
    });

});
