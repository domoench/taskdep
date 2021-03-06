import { min, max, map } from 'lodash';

// Returns and adjacency map representation of a DAG (each map entry key is
// a node id, val is list of adjacent (target) nodes).
function newAdjMap(nodes, edges) {
  const a = {};
  // Create a hashmap, with an entry for each node
  for (let i = 0; i < nodes.length; i += 1) {
    a[nodes[i].id] = [];
  }

  // Walk through edges populating the adjacency list
  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    a[edge.source].push(edge.target);
  }

  return a;
}

// Returns the integer weight of a node, where each weight is the size of the subtree
// rooted at that node.
function nodeWeight(nodeId, adjMap, visited) {
  let weight = 1;
  if (!visited[nodeId]) {
    const adjacents = adjMap[nodeId];
    for (let i = 0; i < adjacents.length; i += 1) {
      weight += nodeWeight(adjacents[i], adjMap, visited);
    }
  }
  return weight;
}

// Returns a list of node weights (parallel to the input array of nodes)
export default function nodeWeights(nodes, edges) {
  const adjMap = newAdjMap(nodes, edges);

  // Track which nodes have been visited
  const visited = {};
  for (let i = 0; i < nodes.length; i += 1) {
    visited[nodes[i].id] = false;
  }

  // Calculate weight of each node
  let weights = new Array(nodes.length);
  for (let i = 0; i < nodes.length; i += 1) {
    weights[i] = nodeWeight(nodes[i].id, adjMap, visited);
  }

  // Normalize weights into the range [0, 1]
  const inMin = min(weights);
  const inMax = max(weights);
  const inRange = inMax - inMin;
  weights = map(weights, (w) => {
    if (inRange === 0) { return 0; }
    return (w - inMin) / inRange;
  });

  return weights;
}
