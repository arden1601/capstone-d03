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
    const newItem: ActionQueueItem = { action, id: Date.now().toString() };
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
    console.log('Executing actions:', actions);
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
    <div className="robot-control-card">
      <h2 className="card-title">Robot Control</h2>

      {/* Robot Status */}
      <div className="status-section">
        <h3 className="section-subtitle">Status</h3>
        <div className="status-grid">
          <div>
            <span className="label">Moving:</span>
            <span className={`value ${robotStatus.isMoving ? 'text-green' : 'text-muted'}`}>
              {robotStatus.isMoving ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="label">Action:</span>
            <span className="value text-blue">
              {robotStatus.currentAction || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions-section">
        <h3 className="section-subtitle">Add Actions</h3>
        <div className="actions-grid">
          <button onClick={() => addAction('forward')} className="btn btn-blue">
            <ArrowUp className="w-5 h-5" /> Forward
          </button>
          <button onClick={() => addAction('left')} className="btn btn-purple">
            <ArrowLeft className="w-5 h-5" /> Left
          </button>
          <button onClick={() => addAction('right')} className="btn btn-purple">
            <ArrowRight className="w-5 h-5" /> Right
          </button>
          <button onClick={() => addAction('stop')} className="btn btn-red">
            <StopCircle className="w-5 h-5" /> Stop
          </button>
        </div>
      </div>

      {/* Action Queue */}
      <div className="queue-section">
        <h3 className="section-subtitle">
          Action Queue <span className="queue-count">({actionQueue.length})</span>
        </h3>
        <div className="queue-list">
          {actionQueue.length === 0 ? (
            <p className="empty-queue">No actions in queue</p>
          ) : (
            <div className="space-y-2">
              {actionQueue.map((item, index) => (
                <div key={item.id} className="queue-item">
                  <div className="queue-item-content">
                    <span className="queue-index">#{index + 1}</span>
                    {getActionIcon(item.action)}
                    <span className="queue-label">{item.action}</span>
                  </div>
                  <button onClick={() => removeAction(item.id)} className="delete-btn">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bottom-buttons">
        <button
          onClick={executeQueue}
          disabled={actionQueue.length === 0}
          className="btn btn-green"
        >
          <Play className="w-5 h-5" /> Execute
        </button>
        <button
          onClick={clearQueue}
          disabled={actionQueue.length === 0}
          className="btn btn-gray"
        >
          <Trash2 className="w-5 h-5" /> Clear
        </button>
      </div>
    </div>
  );
}
