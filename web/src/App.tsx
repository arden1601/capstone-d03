import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings } from 'lucide-react';
import RobotControl from './components/RobotControl';
import SensorDisplay from './components/SensorDisplay';
import RFIDNavigation from './components/RFIDNavigation';
import robotService from './services/robotService';
import type { RobotAction, SensorData, RFIDPosition, RobotStatus } from './types';

function App() {
  const [connected, setConnected] = useState(false);
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080');
  const [showSettings, setShowSettings] = useState(false);

  // State for all data
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [rfidPosition, setRfidPosition] = useState<RFIDPosition | null>(null);
  const [robotStatus, setRobotStatus] = useState<RobotStatus>({
    currentPosition: null,
    isMoving: false,
    currentAction: null,
    battery: 100,
  });

  useEffect(() => {
    // Set up callbacks
    robotService.onConnectionChange((isConnected) => {
      setConnected(isConnected);
    });

    robotService.onSensorData((data: SensorData) => {
      setSensorData(data);
    });

    robotService.onRFIDPosition((position: RFIDPosition) => {
      setRfidPosition(position);
      // Update robot status with new position
      setRobotStatus(prev => ({
        ...prev,
        currentPosition: position,
      }));
    });

    robotService.onRobotStatus((status: RobotStatus) => {
      setRobotStatus(status);
    });

    // Connect to WebSocket
    robotService.connect();

    // Cleanup on unmount
    return () => {
      robotService.disconnect();
    };
  }, []);

  const handleSendActions = (actions: RobotAction[]) => {
    const success = robotService.sendActions(actions);
    if (success) {
      console.log('Actions sent successfully');
    } else {
      alert('Failed to send actions. Please check connection.');
    }
  };

  const handleUpdateUrl = () => {
    robotService.setUrl(wsUrl);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">STM32 IoT Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Robot Control & Monitoring System</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                connected
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {connected ? (
                  <>
                    <Wifi className="w-5 h-5" />
                    <span className="font-semibold">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5" />
                    <span className="font-semibold">Disconnected</span>
                  </>
                )}
              </div>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">WebSocket Settings</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://localhost:8080"
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleUpdateUrl}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Robot Control */}
          <div>
            <RobotControl
              robotStatus={robotStatus}
              onSendActions={handleSendActions}
            />
          </div>

          {/* RFID Navigation */}
          <div>
            <RFIDNavigation currentPosition={rfidPosition} />
          </div>

          {/* Sensor Display - Full Width */}
          <div className="lg:col-span-2">
            <SensorDisplay currentData={sensorData} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-gray-500 text-sm">
        <p>STM32 IoT Robot Dashboard - Built with Vite + React + TypeScript</p>
      </footer>
    </div>
  );
}

export default App;
