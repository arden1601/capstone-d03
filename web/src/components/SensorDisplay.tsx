import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import type { SensorData } from '../types';

interface SensorDisplayProps {
  currentData: SensorData | null;
}

export default function SensorDisplay({ currentData }: SensorDisplayProps) {
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const maxDataPoints = 20;

  useEffect(() => {
    if (currentData) {
      setHistoricalData(prev => {
        const newData = [...prev, currentData];
        // Keep only the last maxDataPoints
        if (newData.length > maxDataPoints) {
          return newData.slice(newData.length - maxDataPoints);
        }
        return newData;
      });
    }
  }, [currentData]);

  const getTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const chartData = historicalData.map(data => ({
    time: getTimeLabel(data.timestamp),
    temperature: data.temperature,
    humidity: data.humidity,
    soilMoisture: data.soilMoisture,
  }));

  const getMoistureLevel = (value: number) => {
    if (value < 30) return { label: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
    if (value < 60) return { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'High', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 20) return 'text-blue-600';
    if (temp < 30) return 'text-green-600';
    return 'text-red-600';
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity < 40) return 'text-orange-600';
    if (humidity < 70) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Sensor Data</h2>

      {/* Current Readings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Soil Moisture */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Soil Moisture</h3>
          </div>
          {currentData ? (
            <>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currentData.soilMoisture.toFixed(1)}%
              </div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getMoistureLevel(currentData.soilMoisture).bg} ${getMoistureLevel(currentData.soilMoisture).color}`}>
                {getMoistureLevel(currentData.soilMoisture).label}
              </div>
            </>
          ) : (
            <div className="text-gray-400">No data</div>
          )}
        </div>

        {/* Temperature */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-700">Temperature</h3>
          </div>
          {currentData ? (
            <>
              <div className={`text-3xl font-bold mb-1 ${getTemperatureColor(currentData.temperature)}`}>
                {currentData.temperature.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-600">
                DHT22 Sensor
              </div>
            </>
          ) : (
            <div className="text-gray-400">No data</div>
          )}
        </div>

        {/* Humidity */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-700">Humidity</h3>
          </div>
          {currentData ? (
            <>
              <div className={`text-3xl font-bold mb-1 ${getHumidityColor(currentData.humidity)}`}>
                {currentData.humidity.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">
                DHT22 Sensor
              </div>
            </>
          ) : (
            <div className="text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Historical Chart */}
      {historicalData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-gray-700">Historical Data</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                name="Temperature (°C)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#14b8a6"
                name="Humidity (%)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="soilMoisture"
                stroke="#3b82f6"
                name="Soil Moisture (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {historicalData.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
          Waiting for sensor data...
        </div>
      )}
    </div>
  );
}
