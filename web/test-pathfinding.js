// Quick test of the pathfinding logic
const graph = new Map();

// Define all nodes
const nodes = [
  { x: 0, y: 0 }, { x: 0, y: 4 }, { x: 0, y: 8 },
  { x: 3, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 8 },
  { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 6, y: 8 },
];

const nodeKey = (node) => `${node.x},${node.y}`;

// Initialize graph
nodes.forEach(node => {
  graph.set(nodeKey(node), []);
});

// Define edges
const edges = [
  // Column x=0
  [{ x: 0, y: 0 }, { x: 0, y: 4 }],
  [{ x: 0, y: 4 }, { x: 0, y: 8 }],

  // Column x=3
  [{ x: 3, y: 0 }, { x: 3, y: 4 }],
  [{ x: 3, y: 4 }, { x: 3, y: 8 }],

  // Column x=6
  [{ x: 6, y: 0 }, { x: 6, y: 4 }],
  [{ x: 6, y: 4 }, { x: 6, y: 8 }],

  // Row y=0
  [{ x: 0, y: 0 }, { x: 3, y: 0 }],
  [{ x: 3, y: 0 }, { x: 6, y: 0 }],

  // Row y=8
  [{ x: 0, y: 8 }, { x: 3, y: 8 }],
  [{ x: 3, y: 8 }, { x: 6, y: 8 }],
];

// Add edges
edges.forEach(([from, to]) => {
  const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  const fromKey = nodeKey(from);
  const toKey = nodeKey(to);

  graph.get(fromKey)?.push({ to, weight: distance });
  graph.get(toKey)?.push({ to: from, weight: distance });
});

console.log('Graph structure:');
graph.forEach((edges, node) => {
  console.log(`${node}:`, edges.map(e => nodeKey(e.to)));
});

// Test connection (0,0) to (0,4)
const start = nodeKey({ x: 0, y: 0 });
const end = nodeKey({ x: 0, y: 4 });

console.log('\nChecking connection from', start, 'to', end);
console.log('Edges from start:', graph.get(start));
console.log('Has edge to end?', graph.get(start)?.some(e => nodeKey(e.to) === end));
