import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings } from 'lucide-react';
import RobotControl from './components/RobotControl';
import SensorDisplay from './components/SensorDisplay';
import RFIDNavigation from './components/RFIDNavigation';
import robotService from './services/robotService';
import type { RobotAction, SensorData, RFIDPosition, RobotStatus } from './types';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080');
  const [showSettings, setShowSettings] = useState(false);

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [rfidPosition, setRfidPosition] = useState<RFIDPosition | null>(null);
  const [robotStatus, setRobotStatus] = useState<RobotStatus>({
    currentPosition: null,
    isMoving: false,
    currentAction: null,
    battery: 100,
  });

  useEffect(() => {
    robotService.onConnectionChange((isConnected) => setConnected(isConnected));
    robotService.onSensorData((data: SensorData) => setSensorData(data));
    robotService.onRFIDPosition((position: RFIDPosition) => {
      setRfidPosition(position);
      setRobotStatus((prev) => ({ ...prev, currentPosition: position }));
    });
    robotService.onRobotStatus((status: RobotStatus) => setRobotStatus(status));
    robotService.connect();
    return () => robotService.disconnect();
  }, []);

  const handleSendActions = (actions: RobotAction[]) => {
    const success = robotService.sendActions(actions);
    if (!success) alert('Failed to send actions. Please check connection.');
  };

  const handleUpdateUrl = () => {
    robotService.setUrl(wsUrl);
    setShowSettings(false);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">IoT Robot</h2>
        <nav className="sidebar-nav">
          <button className="nav-item active">Dashboard</button>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <header className="header">
          <div>
            <h1 className="header-title">STM32 IoT Dashboard</h1>
            <p className="header-subtitle">Robot Control & Monitoring System</p>
          </div>
          <div className="header-controls">
            <div
              className={`connection-status ${
                connected ? 'connected' : 'disconnected'
              }`}
            >
              {connected ? (
                <>
                  <Wifi className="w-5 h-5" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5" />
                  <span>Disconnected</span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="settings-btn"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {showSettings && (
          <div className="settings-panel">
            <h3>WebSocket Settings</h3>
            <div className="settings-input">
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://localhost:8080"
              />
              <button onClick={handleUpdateUrl}>Update</button>
            </div>
          </div>
        )}

        <main className="content">
          <div className="grid-layout">
            <section className="card">
              <RobotControl
                robotStatus={robotStatus}
                onSendActions={handleSendActions}
              />
            </section>
            <section className="card">
              <RFIDNavigation currentPosition={rfidPosition} />
            </section>
            <section className="card col-span-2">
              <SensorDisplay currentData={sensorData} />
            </section>
          </div>
        </main>

        <footer className="footer">
          <p>© 2025 STM32 IoT Robot Dashboard — Vite + React + TypeScript</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
