import { useState, useEffect } from 'react';
import { Navigation, MapPin, CreditCard } from 'lucide-react';
import type { RFIDPosition } from '../types';

interface RFIDNavigationProps {
  currentPosition: RFIDPosition | null;
}

// Predefined RFID card positions on the track (you can adjust these)
const RFID_CARDS = [
  { id: 'RFID_001', x: 1, y: 1, label: 'Start' },
  { id: 'RFID_002', x: 3, y: 1, label: 'Point A' },
  { id: 'RFID_003', x: 5, y: 1, label: 'Point B' },
  { id: 'RFID_004', x: 5, y: 3, label: 'Point C' },
  { id: 'RFID_005', x: 3, y: 3, label: 'Point D' },
  { id: 'RFID_006', x: 1, y: 3, label: 'Point E' },
  { id: 'RFID_007', x: 1, y: 5, label: 'End' },
];

export default function RFIDNavigation({ currentPosition }: RFIDNavigationProps) {
  const [positionHistory, setPositionHistory] = useState<RFIDPosition[]>([]);

  useEffect(() => {
    if (currentPosition) {
      setPositionHistory(prev => {
        // Keep only last 10 positions
        const newHistory = [...prev, currentPosition];
        if (newHistory.length > 10) {
          return newHistory.slice(newHistory.length - 10);
        }
        return newHistory;
      });
    }
  }, [currentPosition]);

  const getCardInfo = (cardId: string) => {
    return RFID_CARDS.find(card => card.id === cardId);
  };

  // Calculate grid position (for visualization)
  const getGridPosition = (x: number, y: number) => {
    const gridSize = 6; // 6x6 grid
    const cellSize = 100 / gridSize;
    return {
      left: `${x * cellSize}%`,
      top: `${y * cellSize}%`,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <Navigation className="w-6 h-6" />
        RFID Navigation
      </h2>

      {/* Current Position Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Current Position
        </h3>
        {currentPosition ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span className="font-mono text-sm font-semibold text-indigo-700">
                {currentPosition.cardId}
              </span>
              {getCardInfo(currentPosition.cardId) && (
                <span className="text-xs bg-indigo-200 px-2 py-1 rounded text-indigo-800">
                  {getCardInfo(currentPosition.cardId)?.label}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Position: ({currentPosition.position.x}, {currentPosition.position.y})
            </div>
            <div className="text-xs text-gray-500">
              {new Date(currentPosition.timestamp).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Waiting for RFID scan...</div>
        )}
      </div>

      {/* Track Visualization */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Track Map</h3>
        <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 overflow-hidden">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <defs>
              <pattern id="grid" width="16.66%" height="16.66%" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* RFID Cards on track */}
          {RFID_CARDS.map(card => {
            const isActive = currentPosition?.cardId === card.id;
            return (
              <div
                key={card.id}
                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-green-500 border-green-600 scale-125 shadow-lg z-20'
                    : 'bg-blue-100 border-blue-300 hover:scale-110 z-10'
                }`}
                style={getGridPosition(card.x, card.y)}
                title={`${card.id} - ${card.label}`}
              >
                <CreditCard
                  className={`w-6 h-6 ${isActive ? 'text-white' : 'text-blue-600'}`}
                />
              </div>
            );
          })}

          {/* Robot position indicator */}
          {currentPosition && (
            <div
              className="absolute w-16 h-16 -ml-8 -mt-8 z-30"
              style={getGridPosition(currentPosition.position.x, currentPosition.position.y)}
            >
              <div className="relative w-full h-full">
                {/* Pulsing animation */}
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                {/* Robot icon */}
                <div className="absolute inset-0 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Position History */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-700">Position History</h3>
        <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
          {positionHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No history available</p>
          ) : (
            <div className="space-y-2">
              {positionHistory.slice().reverse().map((pos, index) => {
                const cardInfo = getCardInfo(pos.cardId);
                return (
                  <div
                    key={`${pos.cardId}-${pos.timestamp}`}
                    className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono">
                        #{positionHistory.length - index}
                      </span>
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span className="font-mono text-xs">{pos.cardId}</span>
                      {cardInfo && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {cardInfo.label}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(pos.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
