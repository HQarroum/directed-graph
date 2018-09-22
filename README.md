<p>
 <img width="400" src="https://computersciencewiki.org/images/c/c6/Directed_graph.png" />
</p>

## Graph

[![Build Status](https://travis-ci.org/HQarroum/directed-graph.svg?branch=master)](https://travis-ci.org/HQarroum/directed-graph)
[![CodeFactor](https://www.codefactor.io/repository/github/hqarroum/directed-graph/badge)](https://www.codefactor.io/repository/github/hqarroum/directed-graph)

An implementation of a simple directed graph.

Current version: **1.0.4**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Install

##### Using NPM

```bash
npm install --save digraphe
```

##### Using Bower

```bash
bower install --save digraphe
```

## Usage

Basic operations you can perform on the graph are insertion and removal of nodes and edges.

To do so, you will need to create a new instance of the graph, by simply calling its constructor :

```javascript
var graph = new Graph();
```

### Node insertions

Insertions of a *node* in an instance of a graph is performed using the unique identifier of this *node*, which is represented by a string. Behind the scenes, a *node* in the Graph will be represented through `Graph.Node` objects, which will carry its unique identifiers, but also all the *edges* the node is attached to.



```javascript
var graph = new Graph();

// This will add the `foo` node to the Graph.
graph.addNode('foo');
// You can also add an optional payload to the node.
graph.addNode('bar', { key: 'value'});
```

Note that adding a node in the graph using an already inserted identifier will have no effect on the Graph data model.

You can at any moment check whether the graph carries a given node either using its unique identifier, either by using a `Graph.Node` instance :


```javascript
var graph = new Graph();

graph.addNode('foo');
graph.hasNode('foo'); // Returns true.

// Retrieving the instance of the `foo` node.
var node = graph.nodes['foo'];
graph.hasNode(node); // Returns true.
```

### Edge insertions

Insertions of an *edge* in an instance of a graph is performed using the source node identifier as well as the target node identifier, which are represented by strings. Behind the scenes, an *edge* in the Graph will be represented through `Graph.Edge` objects, which will carry the source and target nodes, but also the *weight* of the *edge*.



```javascript
var graph = new Graph();

// This will create a new edge between the `foo`
// node and the `bar` node.
graph.addEdge('foo', 'bar');
// You can also specify a `weight` for an edge.
graph.addEdge('bar', 'baz', { weight: 2 });
```

Note that if the edge's nodes do not exist in the graph, they will be automatically added.

You can at any moment check whether the graph carries a given edge either using its unique identifier, either by using a `Graph.Edge` instance :


```javascript
var graph = new Graph();

graph.addEdge('foo', 'bar');

// Retrieving the node instances.
var foo = graph.nodes['foo'];
var bar = graph.nodes['bar'];
graph.hasEdge(foo, bar); // Returns true.
```

### Visitors

Visitors are objects that allow you to browse the nodes of a graph. Two visitors are available in the current implementation.

We will use the following graph structure as an example for each of the following visitors :

```javascript
/**
 *                        Head Node
 *                          |  |
 *                          /  \
 *                       1 /    \ 1
 *                        /      \
 *                       \/      \/
 *                      foo      bar
 *                      ||        ||
 *                       \        /
 *                      2 \      / 2
 *                         \    /
 *                         \/  \/
 *                           baz
 */
 var graph = new Graph();

graph.addEdge('head', 'foo', { weight: 1 });
graph.addEdge('head', 'bar', { weight: 1 });
graph.addEdge('foo', 'baz', { weight: 2 });
graph.addEdge('bar', 'baz', { weight: 2 });
```

#### Depth-First Visitor

The Depth-First visitor uses the Depth-First Search algorithm to walk along the graph's nodes.

It implements the following prototype :

`Graph.Visitor.DFS(graph, head, callback)`

- `graph` is the instance of the graph the visitor will walk through
- `head` is the head node from which the walk will start from
- `callback` is an optional function which will be called back by the visitor on each discovered node

Example :

```javascript
Graph.Visitor.DFS(graph, 'head', function (node) {
    // Do something with the discovered node
});
```

If we print the sequence of nodes forwarded by the visitor using our example, it will result in `['foo', 'baz', 'bar']`.

#### Breadth-First Visitor

The Breadth-First visitor uses the Breadth-First Search algorithm to walk along the graph's nodes.

It implements the following prototype :

`Graph.Visitor.BFS(graph, head, callback)`

- `graph` is the instance of the graph the visitor will walk through
- `head` is the head node from which the walk will start from
- `callback` is an optional function which will be called back by the visitor with as parameter an array of node discovered on a `depth`, and the current `depth` at which the nodes have been found.

Example :

```javascript
Graph.Visitor.BFS(graph, 'head', function (array_of_nodes, depth) {
    // Do something with the discovered node
});
```

If we print the sequence of nodes forwarded by the visitor using our example, it will result in `[['head'], ['foo', 'bar'], ['baz']];`.

### Route management

Routes are the representation of a collection of nodes along a given *path*.

It is possible through the APIs offered by the `Graph` interface to create and retrieve routes dynamically.

For the sake of simplicity and to demonstrate all the route management APIs, we will stick to the previous graph representation example used for the `visitor` interface.

#### The `Graph.routes` API

This method will take a query as an input and will return a collection routes as an output. Let's walk through the various options made available by this method.

##### Resolving all the routes given a head node

It is possible for a client to compute all the routes in a graph having as head node a node `N` :

```javascript
// The following call will return all the `routes`
// having the `head` node as a starting point.
var routes = graph.routes({ from: 'head' });
```
The available route paths returned by the previous call can be represented as :

- head -> foo **(1)**
- head -> foo -> baz **(3)**
- head -> bar **(1)**
- head -> bar -> baz **(3)**

**Note :** The numbers in parentheses are the weights associated with each routes.

##### Resolving all the routes between two nodes

To compute all the routes, whatever their weights, between two given nodes you can use the following :

```javascript
var routes = graph.routes({ from: 'head', to: 'baz' });
```
The available route paths returned by the previous call can be represented as :

- head -> foo -> baz **(3)**
- head -> bar -> baz **(3)**

##### Using advanced queries

You can specify additional query clauses to the `Graph.routes` API to filter your request using a `where` object :

```javascript
var routes = graph.routes({
  from: 'head',
  to: 'baz',
  where: {
    length: 3
  }
});
```
The available route paths returned by the previous call can be represented as :

- head -> foo -> baz **(3)**
- head -> bar -> baz **(3)**

#### The `Graph.hasRoute` API

This method will use an optimized Breadth-First Search to determine whether the given `Graph.Route` is part of a graph instance.

Example :

```javascript
var routes = graph.routes({ from: 'head' });

// For each found route, we check whether
// it is part of the graph.
routes.forEach(function (route) {
    // Obviously, this operation will always
    // return `true`.
    graph.hasRoute(route);
});
```

#### The `Graph.findRoute` API

This method is a helper that will let you map an array of nodes identifiers to an actual route in the graph.

Example :

```javascript
var route = graph.findRoute(['head', 'foo', 'baz']);
```

### Events

It is possible to listen to particular events on a `Graph` instance since it implements the event emitter API. It is often useful to do so to add dynamic behaviour to the graph.

A good example of such a behaviour would be the ability to check for orphan nodes on each nodes or edges removal and to remove them if any.

You can listen to four events on the graph :

 - `node.added` is emitted right after the insertion of a node
 - `node.removed` is emited when a node has been removed
 - `edge.added` is emitted after the insertion of a new edge
 - `edge.removed` is emitted after the removal of an edge

Example :

```javascript
var graph = new Graph();

// This will represent our event receiver object.
var receiver = {
  onNodeAdded: function (node) {
    console.log(node.id, 'has been added !');
  },
  onNodeRemoved: function (id) {
    console.log(id, 'has been removed !');
  },
  onEdgeAdded: function (edge) {
    console.log(edge.source.id, '->', edge.target.id, 'created !');
  },
  onEdgeRemoved: function (source, target) {
    console.log(source, '->', target, 'removed !');
  }
};

// Subscribing to the graph events.
graph.on('node.added', receiver.onNodeAdded);
graph.on('node.removed', receiver.onNodeRemoved);
graph.on('edge.added', receiver.onEdgeAdded);
graph.on('edge.removed', receiver.onEdgeRemoved);
// Adding a new edge, and two new nodes.
graph.addEdge('foo', 'bar');
// Removing all nodes and edges.
graph.clear();
```

## Building

This project uses `Grunt` as its build management system and `Bower` as its dependency management system.

Grunt uses the `Gruntfile.js` to know how to build the project, and will as a *default* task build the project
and copy the binaries in the `dist/` folder.

Grunt relies on `Node.js` and `NPM` to execute tasks, so you will need to ensure they are available on your build machine.

To install Grunt, its modules, and fetch the Bower dependencies of the project you will need to run the following command :

```bash
# This will install Grunt tasks and fetch the
# required Bower module as a postinstall task.
npm install
```

To run a build using the default task, simply run the following command :

```bash
grunt
```

## Tests

Tests are available in the `tests/` directory.

You can either trigger them using `Jasmine JS` and its HTML presenter by opening `tests/index.html` in a browser, or trigger the
following commands :

```bash
# Using grunt
grunt

# Using NPM
npm test
```
