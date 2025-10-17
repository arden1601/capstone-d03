// Mock WebSocket server for testing the dashboard without STM32 hardware
// Run with: node mock-server.js

import { WebSocketServer } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`Mock STM32 WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial robot status
  ws.send(JSON.stringify({
    type: 'robot_status',
    data: {
      currentPosition: null,
      isMoving: false,
      currentAction: null,
      battery: 100
    }
  }));

  // Simulate sensor data every 2 seconds
  const sensorInterval = setInterval(() => {
    const sensorData = {
      type: 'sensor',
      data: {
        soilMoisture: 30 + Math.random() * 40, // 30-70%
        temperature: 20 + Math.random() * 10, // 20-30°C
        humidity: 40 + Math.random() * 30, // 40-70%
        timestamp: new Date().toISOString()
      }
    };
    ws.send(JSON.stringify(sensorData));
  }, 2000);

  // Simulate RFID card detection every 5 seconds
  const rfidCards = ['RFID_001', 'RFID_002', 'RFID_003', 'RFID_004', 'RFID_005'];
  const positions = [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 5, y: 1 },
    { x: 5, y: 3 },
    { x: 3, y: 3 }
  ];
  let currentPositionIndex = 0;

  const rfidInterval = setInterval(() => {
    const rfidData = {
      type: 'rfid',
      data: {
        cardId: rfidCards[currentPositionIndex],
        position: positions[currentPositionIndex],
        timestamp: new Date().toISOString()
      }
    };
    ws.send(JSON.stringify(rfidData));

    currentPositionIndex = (currentPositionIndex + 1) % rfidCards.length;
  }, 5000);

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      if (data.type === 'robot_actions') {
        console.log('Executing actions:', data.data.actions);

        // Simulate action execution
        const actions = data.data.actions;
        let delay = 0;

        actions.forEach((action, index) => {
          setTimeout(() => {
            // Send robot status update
            ws.send(JSON.stringify({
              type: 'robot_status',
              data: {
                currentPosition: {
                  cardId: rfidCards[currentPositionIndex],
                  position: positions[currentPositionIndex],
                  timestamp: new Date().toISOString()
                },
                isMoving: true,
                currentAction: action,
                battery: 100 - Math.floor(Math.random() * 20)
              }
            }));

            // After last action, set isMoving to false
            if (index === actions.length - 1) {
              setTimeout(() => {
                ws.send(JSON.stringify({
                  type: 'robot_status',
                  data: {
                    currentPosition: {
                      cardId: rfidCards[currentPositionIndex],
                      position: positions[currentPositionIndex],
                      timestamp: new Date().toISOString()
                    },
                    isMoving: false,
                    currentAction: null,
                    battery: 100 - Math.floor(Math.random() * 20)
                  }
                }));
              }, 1000);
            }
          }, delay);
          delay += 1000; // 1 second per action
        });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(sensorInterval);
    clearInterval(rfidInterval);
  });
});

console.log('Press Ctrl+C to stop the server');
