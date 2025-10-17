# STM32 IoT Robot Dashboard

A real-time web dashboard for monitoring and controlling an STM32-based robot with sensor systems.

## Features

### 1. Robot Control Panel
- Queue-based action system (forward, left, right, stop)
- Visual action queue management
- Real-time robot status display
- Execute and clear queue functionality

### 2. Sensor Data Display
- **Soil Moisture Monitoring**: Real-time soil moisture percentage
- **DHT22 Temperature Sensor**: Temperature readings in Celsius
- **DHT22 Humidity Sensor**: Relative humidity percentage
- Historical data charts with 20 data points
- Color-coded status indicators

### 3. RFID Navigation System
- Real-time robot position tracking
- Visual track map with RFID card positions
- Position history log (last 10 positions)
- Interactive map with current position indicator

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Communication**: WebSocket

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## WebSocket Communication

### Connection URL
Default: `ws://localhost:8080`

You can change the WebSocket URL from the settings panel in the dashboard header.

### Message Format

#### From STM32 to Dashboard

**Sensor Data:**
```json
{
  "type": "sensor",
  "data": {
    "soilMoisture": 65.5,
    "temperature": 25.3,
    "humidity": 60.2,
    "timestamp": "2025-10-17T10:30:00.000Z"
  }
}
```

**RFID Position:**
```json
{
  "type": "rfid",
  "data": {
    "cardId": "RFID_003",
    "position": { "x": 5, "y": 1 },
    "timestamp": "2025-10-17T10:30:00.000Z"
  }
}
```

**Robot Status:**
```json
{
  "type": "robot_status",
  "data": {
    "currentPosition": { "cardId": "RFID_003", "position": { "x": 5, "y": 1 }, "timestamp": "2025-10-17T10:30:00.000Z" },
    "isMoving": true,
    "currentAction": "forward",
    "battery": 85
  }
}
```

#### From Dashboard to STM32

**Robot Actions:**
```json
{
  "type": "robot_actions",
  "data": {
    "actions": ["forward", "forward", "right", "forward", "stop"]
  }
}
```

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── RobotControl.tsx       # Robot control panel
│   │   ├── SensorDisplay.tsx      # Sensor data visualization
│   │   └── RFIDNavigation.tsx     # RFID position tracking
│   ├── services/
│   │   └── robotService.ts        # WebSocket service
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Customization

### RFID Card Positions

Edit `src/components/RFIDNavigation.tsx` to customize RFID card positions:

```typescript
const RFID_CARDS = [
  { id: 'RFID_001', x: 1, y: 1, label: 'Start' },
  { id: 'RFID_002', x: 3, y: 1, label: 'Point A' },
  // Add more cards...
];
```

### WebSocket URL

Update the default URL in `src/App.tsx`:

```typescript
const [wsUrl, setWsUrl] = useState('ws://your-stm32-ip:port');
```

Or change it dynamically from the settings panel in the dashboard.

## STM32 Integration

### Requirements

Your STM32 firmware should:
1. Implement a WebSocket server
2. Send sensor data, RFID positions, and robot status as JSON
3. Receive and parse robot action commands
4. Execute actions in the order received

### Example STM32 WebSocket Implementation

```c
// Pseudocode - adapt to your STM32 framework

void sendSensorData() {
  char json[200];
  sprintf(json,
    "{\"type\":\"sensor\",\"data\":{\"soilMoisture\":%.1f,\"temperature\":%.1f,\"humidity\":%.1f,\"timestamp\":\"%s\"}}",
    soil_moisture, temperature, humidity, timestamp);
  websocket_send(json);
}

void sendRFIDPosition(char* cardId, int x, int y) {
  char json[200];
  sprintf(json,
    "{\"type\":\"rfid\",\"data\":{\"cardId\":\"%s\",\"position\":{\"x\":%d,\"y\":%d},\"timestamp\":\"%s\"}}",
    cardId, x, y, timestamp);
  websocket_send(json);
}

void handleWebSocketMessage(char* message) {
  // Parse JSON and extract actions array
  // Execute each action sequentially
}
```

## Development

The dashboard uses Vite's Hot Module Replacement (HMR) for fast development. Changes to components will reflect immediately without full page reloads.

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅

WebSocket support is required.

## License

MIT
