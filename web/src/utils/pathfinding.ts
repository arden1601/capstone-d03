import type { RobotAction } from '../types';

export interface Node {
  x: number;
  y: number;
}

export interface GraphEdge {
  to: Node;
  weight: number;
}

export interface PathResult {
  path: Node[];
  actions: RobotAction[];
  distance: number;
}

// Direction enum for easier orientation tracking
const Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
} as const;

type Direction = typeof Direction[keyof typeof Direction];

/**
 * Build a graph from your grid nodes
 * Nodes: (0,0), (0,4), (0,8), (3,0), (3,4), (3,8), (6,0), (6,4), (6,8)
 * Assuming adjacency based on grid connectivity
 */
export function buildGraph(): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();

  // Define all nodes
  const nodes: Node[] = [
    { x: 0, y: 0 }, { x: 0, y: 4 }, { x: 0, y: 8 },
    { x: 3, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 8 },
    { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 6, y: 8 },
  ];

  // Helper to create node key
  const nodeKey = (node: Node) => `${node.x},${node.y}`;

  // Initialize graph with empty arrays
  nodes.forEach(node => {
    graph.set(nodeKey(node), []);
  });

  // Define edges based on grid connectivity (adjacent nodes in rows and columns)
  const edges: [Node, Node][] = [
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

    // Row y=4 - REMOVED (no connections)
    // [{ x: 0, y: 4 }, { x: 3, y: 4 }],
    // [{ x: 3, y: 4 }, { x: 6, y: 4 }],

    // Row y=8
    [{ x: 0, y: 8 }, { x: 3, y: 8 }],
    [{ x: 3, y: 8 }, { x: 6, y: 8 }],
  ];

  // Add bidirectional edges with Euclidean distance as weight
  edges.forEach(([from, to]) => {
    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));

    const fromKey = nodeKey(from);
    const toKey = nodeKey(to);

    graph.get(fromKey)?.push({ to, weight: distance });
    graph.get(toKey)?.push({ to: from, weight: distance });
  });

  return graph;
}

/**
 * Get direction from one node to another
 */
function getDirection(from: Node, to: Node): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dy < 0) return Direction.NORTH; // Moving up (decreasing y)
  if (dy > 0) return Direction.SOUTH; // Moving down (increasing y)
  if (dx > 0) return Direction.EAST;  // Moving right (increasing x)
  return Direction.WEST;              // Moving left (decreasing x)
}

/**
 * Calculate turn needed to change from one direction to another
 */
function getTurnAction(currentDir: Direction, targetDir: Direction): RobotAction[] {
  const diff = (targetDir - currentDir + 4) % 4;

  if (diff === 0) return []; // No turn needed
  if (diff === 1) return ['right']; // Turn right once
  if (diff === 2) return ['right', 'right']; // Turn around (2 rights)
  if (diff === 3) return ['left']; // Turn left once

  return [];
}

/**
 * Convert path nodes to robot actions (left, right, forward, stop)
 * Assumes robot starts facing NORTH
 */
export function pathToActions(path: Node[], startDirection: Direction = Direction.NORTH): RobotAction[] {
  if (path.length < 2) return ['stop'];

  const actions: RobotAction[] = [];
  let currentDirection = startDirection;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];

    // Get direction to next node
    const targetDirection = getDirection(from, to);

    // Add turn actions if needed
    const turnActions = getTurnAction(currentDirection, targetDirection);
    actions.push(...turnActions);

    // Update current direction
    currentDirection = targetDirection;

    // Add forward action to move to next node
    actions.push('forward');
  }

  // Add stop at the end
  actions.push('stop');

  return actions;
}

/**
 * Dijkstra's algorithm implementation
 */
export function dijkstra(start: Node, end: Node): PathResult | null {
  const graph = buildGraph();
  const nodeKey = (node: Node) => `${node.x},${node.y}`;

  const startKey = nodeKey(start);
  const endKey = nodeKey(end);

  // Check if nodes exist in graph
  if (!graph.has(startKey) || !graph.has(endKey)) {
    return null;
  }

  // Distance map
  const distances = new Map<string, number>();
  // Previous node map for path reconstruction
  const previous = new Map<string, Node | null>();
  // Visited set
  const visited = new Set<string>();
  // Priority queue (using array for simplicity)
  const queue: { node: Node; distance: number }[] = [];

  // Initialize distances
  graph.forEach((_, key) => {
    distances.set(key, Infinity);
    previous.set(key, null);
  });
  distances.set(startKey, 0);
  queue.push({ node: start, distance: 0 });

  while (queue.length > 0) {
    // Sort queue by distance (simple priority queue implementation)
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift()!;
    const currentKey = nodeKey(current.node);

    // Skip if already visited
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    // Found destination
    if (currentKey === endKey) {
      break;
    }

    // Check neighbors
    const neighbors = graph.get(currentKey) || [];

    for (const edge of neighbors) {
      const neighborKey = nodeKey(edge.to);

      if (visited.has(neighborKey)) continue;

      const currentDist = distances.get(currentKey) ?? Infinity;
      const newDistance = currentDist + edge.weight;
      const oldDistance = distances.get(neighborKey) ?? Infinity;

      if (newDistance < oldDistance) {
        distances.set(neighborKey, newDistance);
        previous.set(neighborKey, current.node);
        queue.push({ node: edge.to, distance: newDistance });
      }
    }
  }

  // Reconstruct path
  const path: Node[] = [];
  let current: Node | null = end;
  const currentKey = nodeKey(current);

  // Check if path exists
  if (previous.get(currentKey) === null && currentKey !== startKey) {
    return null; // No path found
  }

  while (current) {
    path.unshift(current);
    const key = nodeKey(current);
    const prev = previous.get(key);

    if (!prev) break;
    current = prev;
  }

  // Convert path to actions
  const actions = pathToActions(path);
  const distance = distances.get(endKey) || 0;

  return {
    path,
    actions,
    distance,
  };
}
