# Quick Start Guide

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### 3. Testing with Mock Server (Optional)

For testing without STM32 hardware, use the included mock server:

```bash
# Install ws package for mock server
npm install ws

# Run mock server in a separate terminal
node mock-server.js
```

The mock server will:
- Send simulated sensor data every 2 seconds
- Send RFID position updates every 5 seconds
- Respond to action commands from the dashboard

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Build output will be in the `dist/` directory.

## WebSocket Configuration

### Default Connection
- URL: `ws://localhost:8080`
- Can be changed in the dashboard settings panel (gear icon in header)

### Connecting to STM32

1. Ensure your STM32 has a WebSocket server running
2. Get the IP address and port of your STM32
3. Update the WebSocket URL in the dashboard settings:
   - Click the gear icon in the top right
   - Enter your STM32's WebSocket URL (e.g., `ws://192.168.1.100:8080`)
   - Click Update

## Dashboard Features

### Robot Control
- Add actions to queue: Forward, Left, Right, Stop
- View current action queue
- Execute actions sequentially
- Clear queue if needed

### Sensor Monitoring
- Real-time soil moisture readings
- DHT22 temperature and humidity data
- Historical charts (last 20 data points)
- Color-coded status indicators

### RFID Navigation
- Visual track map showing RFID card positions
- Real-time robot position tracking
- Position history (last 10 scans)
- Animated robot position indicator

## Troubleshooting

### WebSocket Connection Issues
- Check that your WebSocket server is running
- Verify the correct IP address and port
- Check firewall settings
- Look for connection status in browser console (F12)

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
If port 5173 is in use, Vite will automatically try the next available port. Check the terminal output for the actual URL.

## Development Tips

- Hot Module Replacement (HMR) is enabled - changes reflect instantly
- TypeScript strict mode is enabled for better type safety
- Check browser console for WebSocket connection logs
- Use browser DevTools to inspect WebSocket messages

## Project Structure

```
web/
├── src/
│   ├── components/         # React components
│   ├── services/          # WebSocket service
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Main app component
│   └── index.css          # Global styles
├── mock-server.js         # Test server
├── package.json           # Dependencies
└── README.md             # Full documentation
```

## Next Steps

1. Customize RFID card positions in `src/components/RFIDNavigation.tsx`
2. Adjust chart data point limits in `src/components/SensorDisplay.tsx`
3. Modify action types if needed in `src/types/index.ts`
4. Style customization via Tailwind classes
5. Deploy to production server

## Support

For issues or questions:
- Check the main README.md for detailed documentation
- Review WebSocket message format in README.md
- Inspect browser console for errors
- Verify STM32 WebSocket implementation
