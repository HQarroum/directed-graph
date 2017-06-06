var _ = require('lodash');
var expect = require('expect');
var Graph = require('../graph.js');

/**
 *  DFS test plan.
 */
describe('Depth-First search visitor', function () {

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
        var result = ['foo', 'baz', 'bar'];
        var nodes = [];

        Graph.Visitor.DFS(graph, 'head', function (node) {
            nodes.push(node.id);
        });
        expect(nodes.toString()).toEqual(result.toString());
    });

    it('should throw an error if the head node is not available', function () {
        graph.clear();
        expect(function () {
            Graph.Visitor.DFS(graph, 'head');
        }).toThrow();
    });

    it('should not return any node if the head node does not have any adjacents nodes', function () {
        var nodes = [];

        graph.removeEdge('head', 'foo');
        graph.removeEdge('head', 'bar');
        Graph.Visitor.DFS(graph, 'head', function (node) {
            nodes.push(node.id);
        });
        expect(nodes.length).toEqual(0);
    });

});
