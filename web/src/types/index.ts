// Robot action types
export type RobotAction = 'forward' | 'left' | 'right' | 'stop';

// Sensor data types
export interface SensorData {
  soil_moisture: number; // Percentage (0-100)
  temperature: number; // Celsius
  humidity: number; // Percentage (0-100)
  timestamp: string;
}

// RFID position data
export interface RFIDPosition {
  cardId: string;
  position: {
    x: number;
    y: number;
  };
  timestamp: string;
}

// Robot status
export interface RobotStatus {
  currentPosition: RFIDPosition | null;
  isMoving: boolean;
  currentAction: RobotAction | null;
  battery?: number; // Percentage (0-100)
}

// Action queue
export interface ActionQueueItem {
  action: RobotAction;
  id: string;
}

// WebSocket message types
export interface WSMessage {
  type: 'sensor' | 'rfid' | 'robot_status' | 'action_response';
  data: SensorData | RFIDPosition | RobotStatus | any;
}
