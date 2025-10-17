import { useState } from 'react';
import { ArrowUp, ArrowLeft, ArrowRight, StopCircle, Play, Trash2 } from 'lucide-react';
import type { RobotAction, ActionQueueItem, RobotStatus } from '../types';

interface RobotControlProps {
  robotStatus: RobotStatus;
  onSendActions: (actions: RobotAction[]) => void;
}

export default function RobotControl({ robotStatus, onSendActions }: RobotControlProps) {
  const [actionQueue, setActionQueue] = useState<ActionQueueItem[]>([]);

  const addAction = (action: RobotAction) => {
    const newItem: ActionQueueItem = {
      action,
      id: Date.now().toString(),
    };
    setActionQueue([...actionQueue, newItem]);
  };

  const removeAction = (id: string) => {
    setActionQueue(actionQueue.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setActionQueue([]);
  };

  const executeQueue = () => {
    if (actionQueue.length === 0) return;
    const actions = actionQueue.map(item => item.action);
    onSendActions(actions);
    setActionQueue([]);
  };

  const getActionIcon = (action: RobotAction) => {
    switch (action) {
      case 'forward': return <ArrowUp className="w-4 h-4" />;
      case 'left': return <ArrowLeft className="w-4 h-4" />;
      case 'right': return <ArrowRight className="w-4 h-4" />;
      case 'stop': return <StopCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Robot Control</h2>

      {/* Robot Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-700">Status</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Moving:</span>
            <span className={`ml-2 font-semibold ${robotStatus.isMoving ? 'text-green-600' : 'text-gray-400'}`}>
              {robotStatus.isMoving ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Action:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {robotStatus.currentAction || 'None'}
            </span>
          </div>
          {robotStatus.battery !== undefined && (
            <div>
              <span className="text-gray-600">Battery:</span>
              <span className="ml-2 font-semibold text-orange-600">
                {robotStatus.battery}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Add Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => addAction('forward')}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
            Forward
          </button>
          <button
            onClick={() => addAction('left')}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Left
          </button>
          <button
            onClick={() => addAction('right')}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            Right
          </button>
          <button
            onClick={() => addAction('stop')}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <StopCircle className="w-5 h-5" />
            Stop
          </button>
        </div>
      </div>

      {/* Action Queue */}
      <div className="mb-4">
        <h3 className="font-semibold mb-3 text-gray-700">
          Action Queue ({actionQueue.length})
        </h3>
        <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
          {actionQueue.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No actions in queue</p>
          ) : (
            <div className="space-y-2">
              {actionQueue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-mono">#{index + 1}</span>
                    {getActionIcon(item.action)}
                    <span className="capitalize font-medium text-gray-700">{item.action}</span>
                  </div>
                  <button
                    onClick={() => removeAction(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={executeQueue}
          disabled={actionQueue.length === 0}
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
        >
          <Play className="w-5 h-5" />
          Execute
        </button>
        <button
          onClick={clearQueue}
          disabled={actionQueue.length === 0}
          className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Clear
        </button>
      </div>
    </div>
  );
}
