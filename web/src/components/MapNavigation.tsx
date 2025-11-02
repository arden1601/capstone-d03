import { useState } from 'react';
import { Map, Navigation2, Trash2, Play } from 'lucide-react';
import { dijkstra, type Node, type PathResult } from '../utils/pathfinding';
import type { RobotAction } from '../types';

interface MapNavigationProps {
  onSendActions: (actions: RobotAction[]) => void;
}

// Grid nodes from your specification
const GRID_NODES: Node[] = [
  { x: 0, y: 0 }, { x: 0, y: 4 }, { x: 0, y: 8 },
  { x: 3, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 8 },
  { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 6, y: 8 },
];

export default function MapNavigation({ onSendActions }: MapNavigationProps) {
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle node click
  const handleNodeClick = (node: Node) => {
    setError(null);

    if (selectedNodes.length === 0) {
      // First node selected (start)
      setSelectedNodes([node]);
      setPathResult(null);
    } else if (selectedNodes.length === 1) {
      // Second node selected (end) - calculate path
      const start = selectedNodes[0];
      const end = node;

      // Check if same node
      if (start.x === end.x && start.y === end.y) {
        setError('Please select a different destination node');
        return;
      }

      // Calculate path using Dijkstra
      const result = dijkstra(start, end);

      if (result) {
        setSelectedNodes([start, end]);
        setPathResult(result);
      } else {
        setError('No path found between selected nodes');
        setSelectedNodes([]);
      }
    } else {
      // Reset and start new selection
      setSelectedNodes([node]);
      setPathResult(null);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedNodes([]);
    setPathResult(null);
    setError(null);
  };

  // Execute path
  const handleExecute = () => {
    if (pathResult && pathResult.actions.length > 0) {
      onSendActions(pathResult.actions);
      console.log('Executing path actions:', pathResult.actions);
    }
  };

  // Check if node is selected
  const isNodeSelected = (node: Node, index: number): 'start' | 'end' | 'path' | null => {
    if (selectedNodes.length === 0) return null;

    const isStart = selectedNodes[0].x === node.x && selectedNodes[0].y === node.y;
    const isEnd = selectedNodes.length === 2 && selectedNodes[1].x === node.x && selectedNodes[1].y === node.y;
    const isInPath = pathResult?.path.some(p => p.x === node.x && p.y === node.y);

    if (isStart) return 'start';
    if (isEnd) return 'end';
    if (isInPath) return 'path';
    return null;
  };

  // Get action display text
  const getActionText = (action: RobotAction): string => {
    const map: Record<RobotAction, string> = {
      left: 'Turn Left',
      right: 'Turn Right',
      forward: 'Move Forward',
      stop: 'Stop',
    };
    return map[action];
  };

  // Get action number (for MQTT)
  const getActionNumber = (action: RobotAction): number => {
    const map: Record<RobotAction, number> = {
      left: 0,
      right: 1,
      forward: 2,
      stop: 3,
    };
    return map[action];
  };

  // Convert grid position to SVG coordinates
  const getNodePosition = (node: Node) => {
    const padding = 40;
    const width = 400;
    const height = 400;
    const maxX = 6;
    const maxY = 8;

    const x = padding + (node.x / maxX) * (width - 2 * padding);
    const y = padding + (node.y / maxY) * (height - 2 * padding);

    return { x, y };
  };

  return (
    <div className="map-navigation-card">
      <h2 className="card-title flex items-center gap-2">
        <Map className="w-6 h-6" />
        Map Navigation (Dijkstra)
      </h2>

      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <p className="text-blue-800 font-semibold mb-1">How to use:</p>
          <ol className="text-blue-700 space-y-1 ml-4 list-decimal">
            <li>Click a node to select starting point (green)</li>
            <li>Click another node to select destination (red)</li>
            <li>Path will be calculated automatically</li>
            <li>Click "Execute Path" to send commands to robot</li>
          </ol>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Map Grid */}
        <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[500px]">
          <div className="flex justify-center min-w-[450px]">
            <svg width="450" height="450" className="border-2 border-gray-300 rounded bg-white">
            {/* Grid background */}
            <defs>
              <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#smallGrid)" />

            {/* Draw edges (connections) */}
            {pathResult && pathResult.path.length > 1 && (
              <g>
                {pathResult.path.slice(0, -1).map((node, i) => {
                  const start = getNodePosition(node);
                  const end = getNodePosition(pathResult.path[i + 1]);
                  return (
                    <line
                      key={`path-${i}`}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  );
                })}
              </g>
            )}

            {/* Draw all possible edges in light gray */}
            {GRID_NODES.map((node, i) => {
              const pos = getNodePosition(node);
              const connections: Node[] = [];

              // Add connections based on graph structure
              GRID_NODES.forEach(other => {
                if (node.x === other.x && Math.abs(node.y - other.y) === 4) {
                  connections.push(other);
                } else if (node.y === other.y && Math.abs(node.x - other.x) === 3) {
                  // Don't connect nodes at y=4 (row y=4 has no horizontal connections)
                  if (node.y !== 4) {
                    connections.push(other);
                  }
                }
              });

              return connections.map((conn, j) => {
                const connPos = getNodePosition(conn);
                return (
                  <line
                    key={`edge-${i}-${j}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={connPos.x}
                    y2={connPos.y}
                    stroke="#d1d5db"
                    strokeWidth="2"
                  />
                );
              });
            })}

            {/* Draw nodes */}
            {GRID_NODES.map((node, index) => {
              const { x, y } = getNodePosition(node);
              const nodeState = isNodeSelected(node, index);

              let fillColor = '#60a5fa'; // default blue
              let strokeColor = '#3b82f6';
              let radius = 12;

              if (nodeState === 'start') {
                fillColor = '#22c55e'; // green
                strokeColor = '#16a34a';
                radius = 16;
              } else if (nodeState === 'end') {
                fillColor = '#ef4444'; // red
                strokeColor = '#dc2626';
                radius = 16;
              } else if (nodeState === 'path') {
                fillColor = '#93c5fd'; // light blue
                strokeColor = '#3b82f6';
                radius = 10;
              }

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                    className="cursor-pointer hover:opacity-80 transition-all"
                    onClick={() => handleNodeClick(node)}
                  />
                  <text
                    x={x}
                    y={y - radius - 5}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#374151"
                    fontWeight="bold"
                  >
                    ({node.x},{node.y})
                  </text>
                </g>
              );
            })}
          </svg>
          </div>
        </div>

        {/* Path Information */}
        {pathResult && (
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Navigation2 className="w-4 h-4" />
                Path Found
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Distance: <span className="font-mono font-bold">{pathResult.distance.toFixed(2)}</span> units</p>
                <p>Nodes: <span className="font-mono">{pathResult.path.map(p => `(${p.x},${p.y})`).join(' → ')}</span></p>
                <p>Actions: <span className="font-mono font-bold">{pathResult.actions.length}</span> commands</p>
              </div>
            </div>

            {/* Action List */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-gray-800 mb-2">Command Sequence:</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {pathResult.actions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono">#{index + 1}</span>
                      <span className="font-semibold text-gray-700">{getActionText(action)}</span>
                    </div>
                    <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      MQTT: {getActionNumber(action)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* MQTT Preview */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-1 text-sm">MQTT Command Array:</h3>
              <div className="font-mono text-sm text-purple-700 bg-purple-100 p-2 rounded">
                [{pathResult.actions.map(a => getActionNumber(a)).join(', ')}]
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExecute}
            disabled={!pathResult}
            className="btn btn-green flex-1"
          >
            <Play className="w-4 h-4" />
            Execute Path
          </button>
          <button
            onClick={handleClear}
            disabled={selectedNodes.length === 0}
            className="btn btn-gray flex-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
