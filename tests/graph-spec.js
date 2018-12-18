const _      = require('lodash');
const expect = require('expect');
const sinon  = require('sinon');
const Graph  = require('../graph.js');

/**
 * Test libraries.
 */
require('should');
require('should-sinon');

/**
 *  Node insertion test plan.
 */
describe('Insertion of nodes in the graph', function () {

    const graph = new Graph();

    /**
     * New nodes insertion test.
     */
    it('should be successful when inserting new nodes', function () {
        graph.addNode('foo');
        graph.addNode('bar');
        graph.addNode('baz');

        expect(graph.hasNode('foo')).toBeTruthy();
        expect(graph.hasNode('bar')).toBeTruthy();
        expect(graph.hasNode('baz')).toBeTruthy();
        expect(_.size(graph.nodes)).toEqual(3);
    });

    /**
     * Ignoring existing node on insertion test.
     */
    it('should be ignored when adding already existing nodes', function () {
        graph.addNode('foo');
        graph.addNode('bar');
        graph.addNode('baz');
        expect(_.size(graph.nodes)).toEqual(3);
    });

    /**
     * Node addition event triggering test.
     */
    it('should trigger an appropriate event', function (done) {
        const callback = function (node) {
            expect(node.id).toEqual('boo');
            graph.removeListener('node.added', callback);
            done();
        };
        graph.on('node.added', callback);
        graph.addNode('boo');
    });

});

/**
 *  Edge insertion test plan.
 */
describe('Insertion of edges in the graph', function () {

    const graph = new Graph();

    it('should be successful when adding new edges', function () {
        graph.addEdge('foo', 'bar');
        graph.addEdge('bar', 'baz');

        // Verifying the consistency of the graph.
        expect(graph.hasEdge(graph.nodes['foo'], graph.nodes['bar'])).toBeTruthy();
        expect(graph.hasEdge(graph.nodes['bar'], graph.nodes['baz'])).toBeTruthy();

        // Verifying that the first edge matches the
        // foo->bar edge.
        expect(graph.edges[0].source.id).toEqual('foo');
        expect(graph.edges[0].target.id).toEqual('bar');

        // Verifying that the second edge matches the
        // bar->baz edge.
        expect(graph.edges[1].source.id).toEqual('bar');
        expect(graph.edges[1].target.id).toEqual('baz');
    });

    it('should create the given nodes if they do not exist', function () {
        graph.addEdge('one', 'two');

        // Verifying whether the nodes have been created.
        expect(graph.hasNode('one')).toBeTruthy();
        expect(graph.hasNode('two')).toBeTruthy();

        // Verifying whether the edge has been created.
        expect(graph.edges[2].source.id).toEqual('one');
        expect(graph.edges[2].target.id).toEqual('two');
    });

    it('should add the created edges to their belonging nodes', function () {
        graph.addEdge('three', 'four');

        // Verifying whether the created edge was added to the `three` node.
        expect(graph.nodes['three'].edges[0].source.id).toEqual('three');
        expect(graph.nodes['three'].edges[0].target.id).toEqual('four');

        // Verifying whether the created edge was added to the `four` node.
        expect(graph.nodes['four'].edges[0].source.id).toEqual('three');
        expect(graph.nodes['four'].edges[0].target.id).toEqual('four');
    });

    it('should not add an edge if it does already exist', function () {
        for (let i = 0; i < 10; ++i) {
            graph.addEdge('five', 'six');
        }
        expect(graph.edges.length).toEqual(5);
    });

    it('should trigger an appropriate event', function (done) {
        const callback = (edge) => {
            expect(edge.source.id).toEqual('seven');
            expect(edge.target.id).toEqual('eight');
            graph.removeListener('edge.added', callback);
            done();
        };
        graph.on('edge.added', callback);
        graph.addEdge('seven', 'eight');
    });

});

/**
 *  Node removal test plan.
 */
describe('Removal of nodes in the graph', function () {

    const graph = new Graph();

    beforeEach(() => {
        graph.addNode('foo');
        graph.addNode('bar');
    });

    it('should be successful when removing an existing node', function () {
        graph.removeNode('foo');
        graph.removeNode('bar');
        expect(graph.hasNode('foo')).toBeFalsy();
        expect(graph.hasNode('bar')).toBeFalsy();
        expect(_.size(graph.nodes)).toEqual(0);
    });

    it('should be able to remove all the edges associated with the removed node', function () {
        graph.addEdge('foo', 'bar');
        graph.removeNode('foo');
        // There should be no edges left since we have removed
        // one of the nodes having an edge
        expect(graph.edges.length).toEqual(0);
        expect(graph.nodes['bar'].edges.length).toEqual(0);
        graph.removeNode('bar');
        expect(_.size(graph.nodes) && graph.edges.length).toEqual(0);
    });

    it('should trigger an appropriate event', function (done) {
        const callback = (id) => {
            expect(id).toEqual('foo');
            graph.removeListener('node.removed', callback);
            done();
        };
        graph.on('node.removed', callback);
        graph.removeNode('foo');
    });
});

/**
 *  Edge removal test plan.
 */
describe('Removal of edges in the graph', function () {

    const graph = new Graph();

    beforeEach(() => {
        graph.addEdge('foo', 'bar');
        graph.addEdge('bar', 'baz');
    });

    it('should be successful when removing an existing edge', function () {
        graph.removeEdge('foo', 'bar');
        graph.removeEdge('bar', 'baz');
        expect(graph.hasEdge(graph.nodes['foo'], graph.nodes['bar'])).toBeFalsy();
        expect(graph.hasEdge(graph.nodes['bar'], graph.nodes['baz'])).toBeFalsy();
        expect(graph.edges.length).toEqual(0);
    });

    it('should be able to remove the nodes edges associated with the removed edge', function () {
        // Removing the foo->bar edge.
        graph.removeEdge('foo', 'bar');
        expect(graph.nodes['foo'].edges.length).toEqual(0);
        expect(graph.nodes['bar'].edges.length).toEqual(1);

        // Removing the bar->baz edge.
        expect(graph.edges.length).toEqual(1);
        graph.removeEdge('bar', 'baz');
        expect(graph.nodes['bar'].edges.length).toEqual(0);
        expect(graph.nodes['baz'].edges.length).toEqual(0);
        expect(graph.edges.length).toEqual(0);
    });

    it('should trigger an appropriate event', function (done) {
        const callback = (source, target) => {
            expect(source).toEqual('foo');
            expect(target).toEqual('bar');
            expect(graph.hasEdge(graph.nodes['foo'], graph.nodes['bar'])).toBeFalsy();
            graph.removeListener('edge.removed', callback);
            done();
        };
        graph.on('edge.removed', callback);
        graph.removeEdge('foo', 'bar');
    });
});

/**
 *  Nodes and edges removal.
 */
describe('Graph nodes and edges removal', function () {

    const graph = new Graph();

    beforeEach(() => {
        graph.addEdge('foo', 'bar');
        graph.addEdge('bar', 'baz');
    });

    it('should always be successfull', function () {
        graph.clear();
        expect(_.size(graph.nodes)).toEqual(0);
        expect(graph.edges.length).toEqual(0);
    });

    it('should trigger appropriate events', function () {
        const receiver = {
            onEdgeRemoved: sinon.spy(),
            onNodeRemoved: sinon.spy()
        };
        graph.on('edge.removed', receiver.onEdgeRemoved);
        graph.on('node.removed', receiver.onNodeRemoved);
        graph.clear();
        receiver.onEdgeRemoved.should.have.callCount(2);
        receiver.onNodeRemoved.should.have.callCount(3);
    });
});
