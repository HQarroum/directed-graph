define(['underscore', 'graph'], function (_, Graph) {

    /**
     *  Node test plan.
     */
    describe('A node implementation', function () {

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

        /**
         * Retrieving a node parents.
         */
        it('should be able to return its parents', function () {
            var head = graph.nodes['head'];
            var slcw13 = graph.nodes['SLC-W13'];
            var aroma = graph.nodes['AromaLIGHT'];

            expect(head.parents().length).toEqual(0);
            expect(_.pluck(slcw13.parents(), 'id')).toEqual(['head']);
            expect(_.pluck(aroma.parents(), 'id')).toEqual(['SLC-W13', 'SLC-W10']);
        });

        /**
         * Retrieving a node children.
         */
        it('should be able to return its children', function () {
            var head = graph.nodes['head'];
            var slcw13 = graph.nodes['SLC-W13'];
            var aroma = graph.nodes['AromaLIGHT'];

            expect(_.pluck(head.children(), 'id')).toEqual(['SLC-W13', 'SLC-W10']);
            expect(_.pluck(slcw13.children(), 'id')).toEqual(['AromaLIGHT']);
            expect(aroma.children().length).toEqual(0);
        });

        /**
         * Comparing two nodes.
         */
        it('should be able to provide a comparable interface', function () {
            var head = graph.nodes['head'];
            var slcw13 = graph.nodes['SLC-W13'];
            var aroma = graph.nodes['AromaLIGHT'];

            expect(head.equals(head)).toBeTruthy();
            expect(head.equals(slcw13)).toBeFalsy();
            expect(head.equals(aroma)).toBeFalsy();
        });

    });

});