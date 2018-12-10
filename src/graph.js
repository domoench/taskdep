// Returns and adjacency map representation of a DAG (each map entry key is
// a node id, val is list of adjacent (target) nodes).
function newAdjMap(nodes, edges) {
  const a = {};
  // Create a hashmap, with an entry for each node
  for (let node of nodes) {
    a[node.id] = [];
  }

  // Walk through edges populating the adjacency list
  for (let edge of edges) {
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
    for (let adjNodeId of adjacents) {
      weight += nodeWeight(adjNodeId, adjMap, visited);
    }
  }
  return weight;
}

// Returns a list of node weights (parallel to the input array of nodes)
export default function nodeWeights(nodes, edges) {
  const adjMap = newAdjMap(nodes, edges);

  // Track which nodes have been visited
  const visited = {}
  for (let node of nodes) {
    visited[node.id] = false;
  }

  // Calculate weight of each node
  const weights = new Array(nodes.length);
  for (let i = 0; i < nodes.length; ++i) {
    weights[i] = nodeWeight(nodes[i].id, adjMap, visited);
  }

  return weights;
}
