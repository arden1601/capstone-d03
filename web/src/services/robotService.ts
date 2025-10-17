import type { RobotAction, SensorData, RFIDPosition, RobotStatus, WSMessage } from '../types';

type MessageCallback = (data: any) => void;

class RobotService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000; // 5 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;

  // Callbacks for different message types
  private sensorCallback: MessageCallback | null = null;
  private rfidCallback: MessageCallback | null = null;
  private statusCallback: MessageCallback | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;

  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected to STM32');
        if (this.connectionCallback) {
          this.connectionCallback(true);
        }
        // Clear reconnect timer if exists
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (this.connectionCallback) {
          this.connectionCallback(false);
        }
        // Attempt to reconnect
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, this.reconnectInterval);
  }

  private handleMessage(message: WSMessage) {
    switch (message.type) {
      case 'sensor':
        if (this.sensorCallback) {
          this.sensorCallback(message.data as SensorData);
        }
        break;
      case 'rfid':
        if (this.rfidCallback) {
          this.rfidCallback(message.data as RFIDPosition);
        }
        break;
      case 'robot_status':
        if (this.statusCallback) {
          this.statusCallback(message.data as RobotStatus);
        }
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Send robot action commands
  sendActions(actions: RobotAction[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      const message = {
        type: 'robot_actions',
        data: { actions }
      };
      this.ws.send(JSON.stringify(message));
      console.log('Sent actions:', actions);
      return true;
    } catch (error) {
      console.error('Error sending actions:', error);
      return false;
    }
  }

  // Register callbacks
  onSensorData(callback: MessageCallback) {
    this.sensorCallback = callback;
  }

  onRFIDPosition(callback: MessageCallback) {
    this.rfidCallback = callback;
  }

  onRobotStatus(callback: MessageCallback) {
    this.statusCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallback = callback;
  }

  // Disconnect
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Update WebSocket URL
  setUrl(url: string) {
    this.url = url;
    if (this.ws) {
      this.disconnect();
      this.connect();
    }
  }
}

// Create singleton instance
const robotService = new RobotService();

export default robotService;
