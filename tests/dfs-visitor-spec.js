define(['underscore', 'graph'], function (_, Graph) {

    /**
     *  DFS test plan.
     */
    describe('Depth-First search visitor', function () {

        var graph = new Graph();

        /**
         * Building the graph using a predefined path :
         *
         *                          Head
         *                             ||
         *                            /  \
         *                           \/  \/
         *                SLC-W13    SLC-W10
         *                      ||               ||
         *                       \               /
         *                         \            /
         *                         \/          \/
         *                        AromaLIGHT
         */
        beforeEach(function () {
            graph.addEdge('head', 'SLC-W13');
            graph.addEdge('head', 'SLC-W10');
            graph.addEdge('SLC-W13', 'AromaLIGHT');
            graph.addEdge('SLC-W10', 'AromaLIGHT');
        });

        it('should be able to iterate over the nodes in the graph', function () {
            var result = ['SLC-W13', 'AromaLIGHT', 'SLC-W10'];
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

            graph.removeEdge('head', 'SLC-W13');
            graph.removeEdge('head', 'SLC-W10');
            Graph.Visitor.DFS(graph, 'head', function (node) {
                nodes.push(node.id);
            });
            expect(nodes.length).toEqual(0);
        });

    });

});