define(['underscore', 'graph'], function (_, Graph) {

    /**
     *  BFS test plan.
     */
    describe('Breadth-First search visitor', function () {

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
            var result = [['head'], ['SLC-W13', 'SLC-W10'], ['AromaLIGHT']];
            var nodes = [];
            var saved_level;

            Graph.Visitor.BFS(graph, 'head', function (array, level) {
                var map = _.map(array, function (element) {
                    return element.id;
                });
                nodes.push(map);
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

            graph.removeEdge('head', 'SLC-W13');
            graph.removeEdge('head', 'SLC-W10');
            Graph.Visitor.BFS(graph, 'head', function (array, level) {
                var map = _.map(array, function (element) {
                    return element.id;
                });
                nodes.push(map);
            });
            expect(JSON.stringify(nodes)).toEqual(JSON.stringify(result));
        });

    });

});