import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings } from 'lucide-react';
import RobotControl from './components/RobotControl';
import SensorDisplay from './components/SensorDisplay';
import RFIDNavigation from './components/RFIDNavigation';
import MapNavigation from './components/MapNavigation';
import robotService from './services/robotService';
import mqtt from 'mqtt';
import type { RobotAction, SensorData, RFIDPosition, RobotStatus } from './types';
import './App.css';



function App() {
  const [connected, setConnected] = useState(false);
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080');
  const [showSettings, setShowSettings] = useState(false);
  const [mqttStatus, setMqttStatus] = useState("disconnected");
  const [client, setClient] = useState(null);

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [rfidPosition, setRfidPosition] = useState<RFIDPosition | null>(null);
  const [robotStatus, setRobotStatus] = useState<RobotStatus>({
    currentPosition: null,
    isMoving: false,
    currentAction: null,
    battery: 100,
  });

  // useEffect(() => {
  //   robotService.onConnectionChange((isConnected) => setConnected(isConnected));
  //   robotService.onSensorData((data: SensorData) => setSensorData(data));
  //   robotService.onRFIDPosition((position: RFIDPosition) => {
  //     setRfidPosition(position);
  //     setRobotStatus((prev) => ({ ...prev, currentPosition: position }));
  //   });
  //   robotService.onRobotStatus((status: RobotStatus) => setRobotStatus(status));
  //   robotService.connect();
  //   return () => robotService.disconnect();
  // }, []);

  // MQTT Connection
  useEffect(() => {
    const mqttClient = mqtt.connect('ws://localhost:9001');

  mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      setMqttStatus('connected');
      mqttClient.subscribe('sensor/dht22');
    });

    mqttClient.on('message', (topic, message) => {
      if (topic === 'sensor/dht22') {
        try {
          const data = JSON.parse(message.toString());
          const 
          sensorData: SensorData = {
            temperature: data.temperature,
            humidity: data.humidity,
            soil_moisture: data.soil_moisture,
            timestamp: new Date().toISOString()
          };
          setSensorData(sensorData);
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      }
    });

    mqttClient.on('error', (error) => {
      console.error('MQTT connection error:', error);
      setMqttStatus('error');
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  const convertActionToNumber = (action: RobotAction): number => {
    const actionMap: Record<RobotAction, number> = {
      left: 0,
      right: 1,
      forward: 2,
      stop: 3,
    };
    return actionMap[action];
  };

  const handleSendActions = (actions: RobotAction[]) => {
    // Convert actions to numbers
    const numericActions = actions.map(convertActionToNumber);

    // Publish to MQTT
    if (client && mqttStatus) {
      client.publish('robot/control', JSON.stringify(numericActions), (error) => {
        if (error) {
          console.error('MQTT publish error:', error);
          alert('Failed to send actions via MQTT.');
        } else {
          console.log('Actions sent via MQTT:', numericActions);
        }
      });
    } else {
      alert('MQTT client not connected. Please check connection.');
    }
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
              <MapNavigation onSendActions={handleSendActions} />
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
