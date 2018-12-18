/**
 *       _____                 _
 *      / ____|               | |
 *     | |  __ _ __ __ _ _ __ | |__
 *     | | |_ | '__/ _` | '_ \| '_ \
 *     | |__| | | | (_| | |_) | | | |
 *      \_____|_|  \__,_| .__/|_| |_|
 *                      | |
 *                      |_|
 *
 *
 *
 * This is an implementation of a directed
 * grapĥ.
 */

 /**
  * Exporting the `Graph` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['lodash', 'event-emitter'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        var EventEmitter = require('events').EventEmitter;
        module.exports   = definition(require('lodash'), EventEmitter);
    } else {
        var gl       = this;
        var instance = definition(gl._, gl.EventEmitter2);
        var old      = gl[name];

        /**
         * Allowing to scope the module
         * avoiding global namespace pollution.
         */
        instance.noConflict = function () {
            gl[name] = old;
            return instance;
        };
        // Exporting the module in the global
        // namespace in a browser context.
        gl[name] = instance;
    }
 })('Graph', function (_, Emitter) {

  var Graph = function () {
      Emitter.apply(this);
      this.nodes = {};
      this.edges = [];
  };

  /**
   * The graph inherits the event emitter
   * interface in order to forward events to
   * clients about the operations that occur
   * in the graph.
   */
  Graph.prototype = new Emitter();

  /**
   * The namespace for the visitor functions.
   */
  Graph.Visitor = {};

  /**
   * Adds a new node to the graph. If the node
   * was already existing, the graph remains unmodified.
   * A reference to the node is returned in any case.
   */
  Graph.prototype.addNode = function (id, object) {
      var node = new Graph.Node(id, object);

      if (!this.hasNode(node)) {
        this.nodes[node.id] = node;
        this.emit('node.added', this.nodes[node.id]);
      }
      return this.nodes[node.id];
  };

  /**
   * Adds a new edge between two nodes. The source and
   * the target node can be either node objects, or identifiers.
   * If one of them does not exist, it will be created. If an edge
   * having the same source, target node and weight already exist,
   * the graph remains unmodified. The created  edge will also be
   * added to the source and target nodes. A reference to the edge will be
   * returned in any case.
   */
  Graph.prototype.addEdge = function (source, target, options) {
      source = this.addNode(source);
      target = this.addNode(target);
      var edge = new Graph.Edge(source, target, options);
      if (this.hasEdge(edge)) {
        return;
      }
      source.addEdge(edge);
      target.addEdge(edge);
      this.edges.push(edge);
      this.emit('edge.added', edge);
      return edge;
  };

  /**
   * Visitor that will iterate over each nodes of
   * the graph using a Depth-First Search.
   */
  Graph.Visitor.DFS = function (graph, s, callback) {
    var visited = {};
    var head = graph.nodes[(s instanceof Graph.Node) ? s.id : s];

    if (!head) {
      throw new Error('The given source node is not part of this graph');
    }
    var iterator = function (head) {
      visited[head.id] = true;
      _.each(head.adjacents(), function (node) {
        if (!visited[node.id]) {
          if (callback) callback(node);
          iterator(node);
        }
      });
    };
    iterator(head);
  };

  /**
   * Visitor that will iterate over each nodes of
   * the graph using a Breadth-First Search.
   */
  Graph.Visitor.BFS = function (graph, s, callback) {
    var queue = [];
    var visited = {};
    var distance = 0;
    var head = graph.nodes[(s instanceof Graph.Node) ? s.id : s];

    if (!head) {
      throw new Error('The given source node is not part of this graph');
    }

    // The head of the search is always
    // at a distance of zero, so we forward
    // it to the listener, and mark it as visited.
    var array = [head];
    queue.push(array);
    if (callback) callback(array, distance);
    visited[head.id] = true;

    while (queue.length > 0) {
      var level = queue.shift();
      var adjs = [];
      _.each(level, function (element) {
        _.each(element.adjacents(), function (node) {
          if (!visited[node.id]) {
            adjs.push(node);
            visited[node.id] = true;
          }
        });
        queue.push(adjs);
      });
      if (adjs.length && callback) {
        callback(adjs, ++distance);
      }
    }
  };

  /**
   * Visitor that will iterate over the given head
   * node by descending along its target nodes. Every
   * encountered node will be stacked, and every iteration
   * of the descending path will call a function back with the
   * current node, the stack of visited nodes, and the weight
   * of the current route.
   */
  Graph.Visitor.Stacked = function (graph, head, callback) {
    var stack = [];
    var weight = 0;
    var from = graph.nodes[head];

    if (!from) {
      throw new Error('The given node is not part of this graph');
    }

    // Pushing the source node in the stack.
    stack.push(from);

    var iterator = function (s) {
      for (var i = 0; i < s.edges.length; ++i) {
        if (s.edges[i].target.id !== s.id) {
          var edge = s.edges[i];
          var node = edge.target;

          // If the node is already in the stack and we've
          // already visited it, we skip it to avoid cyclic
          // loops.
          if (_.find(stack, {'id': node.id})) {
          	continue;
          }
          stack.push(node);
          weight += edge.weight;
          if (callback) callback(node, stack, weight);
          iterator(node);
          weight -= edge.weight;
          stack.pop();
        }
      }
    };
    iterator(from);
  };

  /**
   * Iterates through the graph using a Depth-First Search,
   * and forwards each unvisited node to the provided callback.
   * A head node from which we start the iteration is required.
   */
  Graph.prototype.forEach = function (s, callback) {
    Graph.Visitor.DFS(this, s, callback);
  };

  /**
   * Helper that will return all the routes
   * that have the given head node as
   * a starting point.
   */
  var findAllRoutes = function (graph, head, where) {
    var routes = [];

    Graph.Visitor.Stacked(graph, head, function (node, stack, weight) {
      if (where && where.length !== stack.length){
        return;
      }
      routes.push(new Graph.Route(stack.slice(), weight));
    });
    return routes;
  };

  /**
   * Returns an array of routes from a source node
   * to a destination node.
   */
  Graph.prototype.routes = function (options) {
    var routes = [];
    if (!options || !options.from) {
      throw new Error('At least a source node is expected');
    }
    if (!options.to) {
        // We would like to return all the routes that have
        // `options.from` as the head, since no destination
        // node was given.
        return findAllRoutes(this, options.from, options.where);
    }

    if (!this.hasNode(options.from) || !this.hasNode(options.to)) {
      return routes;
    }

    Graph.Visitor.Stacked(this, options.from, function (node, stack, weight) {
      if (node.id === options.to) {
        if (options.where && options.where.length !== stack.length){
          // The route does not match the given criterias.
          return;
        }
        routes.push(new Graph.Route(stack.slice(), weight));
      }
    });
    return routes;
  };

  /**
   * A helper that will let you map an array of nodes
   * identifiers to an actual route in the graph.
   */
  Graph.prototype.findRoute = function (ids) {
    var routes = this.routes({
      from: ids[0],
      where: {
        length: ids.length
      }
    });
    var found_route;

    if (!routes) {
      // No routes have been found.
      return;
    }
    _.each(routes, function (route) {
      if (_.map(route.path, 'id').toString() === ids.toString()) {
        found_route = route;
        return (false);
      }
    });
    return found_route;
  };

  /**
   * Returns whether the given route does exist
   * in the graph.
   */
  Graph.prototype.hasRoute = function (route) {
    var head = this.nodes[route.head().id];

    if (!this.hasNode(head)) {
      return false;
    }

    var iterator = function (source, index) {
      var found = false;
      var next;

      _.each(source.adjacents(), function (adjacent) {
        if (adjacent.equals(route.path[index])) {
          next = adjacent;
          found = true;
          return false;
        }
      });

      if (!found) {
        // The node located at `index` of the given route path
        // was not found in the graph. This means that the
        // route does not exist within this graph.
        return false;
      }

      if (index === route.path.length - 1) {
        // There are no more nodes in the route, and
        // all the previous nodes have been found.
        return true;
      }

      return iterator(next, ++index);
    };

    return iterator(head, 1);
  };

  /**
   * Removes a node from the graph. This will also remove
   * all the edges associated with that node in the graph and
   * in each nodes.
   */
  Graph.prototype.removeNode = function (id) {
    if (!this.nodes[id]) {
        return;
    }

    // Removing the node's edges.
    _.each(this.edges, function (edge) {
      if (!edge) return;
      var source = edge.source.id;
      var target = edge.target.id;
      if (source === id || target === id) {
        this.removeEdge(source, target);
      }
    }.bind(this));

    delete this.nodes[id];
    this.emit('node.removed', id);
  };

  /**
   * Removes every edges matching the given one
   * from the graph as well as from each nodes.
   */
  Graph.prototype.removeEdge = function (source, target) {
    var self = this;
    var source_node = this.nodes[source];
    var target_node = this.nodes[target];

    if (!this.hasNode(source_node)
      || !this.hasNode(target_node)
      || !this.hasEdge(source_node, target_node)) {
      return;
    }

    // Removing the edge from the edge list in the graph.
    this.edges = _.reject(this.edges, function (edge) {
      return edge.target.id === target_node.id
        && edge.source.id === source_node.id;
    });

    // Removing the edge from the edge list maintained
    // by each nodes of the graph.
    _.each(this.nodes, function (node) {
      node.edges = _.reject(node.edges, function (edge) {
        return edge.target.id === target_node.id
          && edge.source.id === source_node.id;
      });
    });

    self.emit('edge.removed', source, target);
  };

  /**
   * Returns whether the given edge exists in the graph.
   */
  Graph.prototype.hasEdge = function (node1, node2, options) {
    var find = function (edge) {
      return !_.isUndefined(_.find(this.edges, function (e) {
        return e.equals(edge);
      }));
    }.bind(this);

    if (node1 instanceof Graph.Edge) {
      return find(node1);
    }

    var n1 = node1 instanceof Graph.Node ?
      node1 : this.nodes[node1];
    var n2 = node2 instanceof Graph.Node ?
      node2 : this.nodes[node2];

    if (n1 && n2) {
      return find(new Graph.Edge(n1, n2, options));
    }

    return false;
  };

  /**
   * Returns whether the given node exists in the graph.
   */
  Graph.prototype.hasNode = function (node) {
      if (node instanceof Graph.Node) {
          return typeof this.nodes[node.id] !== 'undefined';
      }
      return typeof this.nodes[node] !== 'undefined';
  };

  /**
   * Removes all the nodes and edges of the graph.
   */
  Graph.prototype.clear = function () {

    // Removing all the edges.
    while (this.edges.length > 0) {
      this.removeEdge(
        this.edges[0].source.id,
        this.edges[0].target.id
      );
    }

    // Removing all the nodes.
    for (var key in this.nodes) {
      this.removeNode(key);
    }
  };

  /***
   *      _   _           _
   *     | \ | |         | |
   *     |  \| | ___   __| | ___
   *     | . ` |/ _ \ / _` |/ _ \
   *     | |\  | (_) | (_| |  __/
   *     |_| \_|\___/ \__,_|\___|
   *
   *
   */

  /**
   * A node in the graph holds a unique identifier
   * as well as an optional opaque object.
   */
  Graph.Node = function (id, object) {
      if (typeof id !== 'string') {
          throw new Error('A node id was required');
      }
      this.id = id;
      this.object = object || {};
      this.edges = [];
  };

  /**
   * Returns all the parents of this node, that is
   * the nodes pointing to this node.
   */
  Graph.Node.prototype.parents = function () {
    var parents = [];

    _.each(this.edges, function (edge) {
      if (edge.target.id === this.id) {
        parents.push(edge.source);
      }
    }.bind(this));
    return parents;
  };

  /**
   * Returns all the children node of this node,
   * that is, the nodes this node is pointing to.
   */
  Graph.Node.prototype.children = function () {
    var children = [];

    _.each(this.edges, function (edge) {
      if (edge.source.id === this.id) {
        children.push(edge.target);
      }
    }.bind(this));
    return children;
  };

  /**
   * Returns all the adjacent nodes of this node,
   * note that the direction of each edges is taken
   * into account and we do not return nodes that
   * are pointing to the current node.
   */
  Graph.Node.prototype.adjacents = function () {
    var nodes = [];

    _.each(this.edges, function (edge) {
      if (edge.target.id !== this.id) {
        nodes.push(edge.target);
      }
    }.bind(this));
    return nodes;
  };

  /**
   * Adds an edge into the node.
   */
  Graph.Node.prototype.addEdge = function (edge) {
    if (!(edge instanceof Graph.Edge)) {
      throw new Error('An edge was expected');
    }
    if (!this.hasEdge(edge)) {
      this.edges.push(edge);
    }
  };

  /**
   * Returns whether the current node has
   * an edge matching the given edge.
   */
  Graph.Node.prototype.hasEdge = function (edge) {
    if (!(edge instanceof Graph.Edge)) {
      return false;
    }
    for (var i = 0; i < this.edges.length; ++i) {
      if (this.edges[i].equals(edge)) {
        return true;
      }
    }
    return false;
  };

  /**
   * Returns whether the given node is considered
   * equal to the current node.
   */
  Graph.Node.prototype.equals = function (node) {
    if (!(node instanceof Graph.Node)) {
      return false;
    }
    return node.id === this.id;
  };


  /**
   *      ______    _
   *     |  ____|  | |
   *     | |__   __| | __ _  ___
   *     |  __| / _` |/ _` |/ _ \
   *     | |___| (_| | (_| |  __/
   *     |______\__,_|\__, |\___|
   *                   __/ |
   *                  |___/
   */

  /**
   * An edge of the graph holds a source node,
   * a target node and a weight.
   */
  Graph.Edge = function (source, target, options) {
      if (!(source instanceof Graph.Node)
        || !(target instanceof Graph.Node)) {
          throw new Error('A source node and a source target were required');
      }
      this.source = source;
      this.target = target;
      this.options = options || {};
      this.weight = this.options.weight || 0;
  };

  /**
   * Returns whether the given node is equals
   * to the current node.
   */
  Graph.Edge.prototype.equals = function (edge) {
    if (!(edge instanceof Graph.Edge)) {
      return false;
    }
    return edge.source.id === this.source.id
      && edge.target.id === this.target.id;
  };


  /**
   *      _____             _
   *     |  __ \           | |
   *     | |__) |___  _   _| |_ ___
   *     |  _  // _ \| | | | __/ _ \
   *     | | \ \ (_) | |_| | ||  __/
   *     |_|  \_\___/ \__,_|\__\___|
   *
   *
   */

  /**
   * A route in the graph is constituted of a
   * sequence of nodes required to reach a target
   * given a source.
   * It is also composed of a weight which is the sum of
   * the weights of all the edges along the path.
   */
  Graph.Route = function (path, weight) {
    if (!path || !path.length || typeof weight !== 'number') {
      throw new Error('A non empty path as well as a weight were expected');
    }
    this.path = path;
    this.weight = weight;

    /**
     * Returns the head of the route.
     */
    this.head = function () {
      return this.path[0];
    };

    /**
     * Returns the tail of the route.
     */
    this.tail = function () {
      return this.path[this.path.length - 1];
    };

    /**
     * Returns the length of this route.
     */
    this.length = function () {
      return this.path.length;
    };
  };

  return Graph;
 });
