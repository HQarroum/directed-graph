var _ = require('lodash');
var expect = require('expect');
var Graph = require('../graph.js');

/**
 *  Node test plan.
 */
describe('A node implementation', function () {

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

    /**
     * Retrieving a node parents.
     */
    it('should be able to return its parents', function () {
        var head = graph.nodes['head'];
        var foo  = graph.nodes['foo'];
        var baz  = graph.nodes['baz'];

        expect(head.parents().length).toEqual(0);
        expect(_.map(foo.parents(), 'id')).toEqual(['head']);
        expect(_.map(baz.parents(), 'id')).toEqual(['foo', 'bar']);
    });

    /**
     * Retrieving a node children.
     */
    it('should be able to return its children', function () {
        var head = graph.nodes['head'];
        var foo  = graph.nodes['foo'];
        var baz  = graph.nodes['baz'];

        expect(_.map(head.children(), 'id')).toEqual(['foo', 'bar']);
        expect(_.map(foo.children(), 'id')).toEqual(['baz']);
        expect(baz.children().length).toEqual(0);
    });

    /**
     * Comparing two nodes.
     */
    it('should be able to provide a comparable interface', function () {
        var head = graph.nodes['head'];
        var foo  = graph.nodes['foo'];
        var baz  = graph.nodes['baz'];

        expect(head.equals(head)).toBeTruthy();
        expect(head.equals(foo)).toBeFalsy();
        expect(head.equals(baz)).toBeFalsy();
    });

});
