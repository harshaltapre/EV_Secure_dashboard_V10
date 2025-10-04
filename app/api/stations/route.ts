import { NextRequest, NextResponse } from 'next/server'
import { apiKeys, sensorData, stationMetadata, type SensorDataEntry } from '@/lib/shared-storage'

// Helper function to get real ESP32 sensor data (NO SIMULATED DATA)
function getRealESP32Data(stationId: string, hasApiKey: boolean) {
  if (!hasApiKey) {
    return {
      status: "no_api_key",
      voltage: 0,
      current: 0,
      temp: 0,
      power: 0,
      relayStatus: false,
      firmwareVersion: "Unknown",
      connectedUser: null,
      carConnected: false,
      carModel: null,
      chargingProgress: 0,
      mlThreatLevel: "unknown",
      esp32Status: "no_api_key",
      batteryLevel: 0,
      lastSync: "No API key configured"
    }
  }

  // Get real sensor data from ESP32 devices
  const stationData = sensorData.get(stationId) || []
  
  if (stationData.length === 0) {
    return {
      status: "esp32_not_connected",
      voltage: 0,
      current: 0,
      temp: 0,
      power: 0,
      relayStatus: false,
      firmwareVersion: "Unknown",
      connectedUser: null,
      carConnected: false,
      carModel: null,
      chargingProgress: 0,
      mlThreatLevel: "unknown",
      esp32Status: "waiting_for_connection",
      batteryLevel: 0,
      lastSync: "No ESP32 data received"
    }
  }

  // Get the latest real sensor data from ESP32
  const latestData = stationData[stationData.length - 1]
  const sensors = latestData.sensor_data
  
  // Check if data is recent (within last 10 seconds)
  const dataAge = Date.now() - new Date(latestData.timestamp).getTime()
  const isRecentData = dataAge < 10000 // 10 seconds
  
  if (!isRecentData) {
    return {
      status: "esp32_disconnected",
      voltage: sensors.voltage || 0,
      current: sensors.current || 0,
      temp: sensors.temperature || 0,
      power: sensors.power || 0,
      relayStatus: sensors.relay_status || false,
      firmwareVersion: "ESP32-S3",
      connectedUser: null,
      carConnected: sensors.car_connected || false,
      carModel: sensors.car_model || null,
      chargingProgress: sensors.charging_progress || 0,
      mlThreatLevel: sensors.ml_threat_level || "unknown",
      esp32Status: "disconnected",
      batteryLevel: sensors.battery_level || 0,
      lastSync: `${Math.round(dataAge / 1000)}s ago (disconnected)`
    }
  }

  // ESP32 is connected and sending real data
  const isCharging = (sensors.current || 0) > 0.1
  const hasThreat = sensors.ml_threat_level === "high" || sensors.ml_threat_level === "critical"
  
  return {
    status: hasThreat ? "threat" : (isCharging ? "charging" : "online"),
    voltage: sensors.voltage || 0,
    current: sensors.current || 0,
    temp: sensors.temperature || 0,
    power: sensors.power || 0,
    relayStatus: sensors.relay_status || false,
    firmwareVersion: "ESP32-S3",
    connectedUser: isCharging ? sensors.car_model || "Unknown User" : null,
    carConnected: sensors.car_connected || isCharging,
    carModel: sensors.car_model || (isCharging ? "EV Vehicle" : null),
    chargingProgress: sensors.charging_progress || (isCharging ? Math.round((sensors.current || 0) * 10) : 0),
    mlThreatLevel: sensors.ml_threat_level || (isCharging ? "monitoring" : "safe"),
    esp32Status: "connected",
    batteryLevel: sensors.battery_level || 0,
    lastSync: `${Math.round(dataAge / 1000)}s ago`
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all stations with their REAL ESP32 sensor data (NO SIMULATED DATA)
    const stations = []
    
    for (const [stationId, metadata] of Object.entries(stationMetadata)) {
      // Check if station has an active API key
      const activeKey = Array.from(apiKeys.entries()).find(([key, data]) => 
        data.stationId === stationId && data.status === 'active'
      )
      
      const hasActiveApiKey = !!activeKey
      
      // Get ONLY real ESP32 sensor data - NO simulated values
      const realEsp32Data = getRealESP32Data(stationId, hasActiveApiKey)
      
      stations.push({
        id: stationId,
        ...metadata,
        ...realEsp32Data,
        apiKey: hasActiveApiKey ? "active" : "inactive",
        // Add debugging info for connection status
        esp32Connected: hasActiveApiKey && sensorData.has(stationId) && sensorData.get(stationId)!.length > 0,
        lastDataReceived: hasActiveApiKey && sensorData.has(stationId) && sensorData.get(stationId)!.length > 0 
          ? sensorData.get(stationId)![sensorData.get(stationId)!.length - 1].timestamp 
          : null
      })
    }

    // Count real ESP32 connections and status
    const esp32Connected = stations.filter(s => s.esp32Status === "connected").length
    const esp32Charging = stations.filter(s => s.status === "charging").length
    const esp32Threats = stations.filter(s => s.mlThreatLevel === "high" || s.mlThreatLevel === "critical").length

    return NextResponse.json({
      success: true,
      stations,
      timestamp: new Date().toISOString(),
      totalStations: stations.length,
      esp32Connected: esp32Connected,
      activeStations: stations.filter(s => s.status === "charging" || s.status === "online").length,
      connectedCars: stations.filter(s => s.carConnected).length,
      threats: esp32Threats,
      realDataOnly: true, // Indicate this is real ESP32 data only
      message: esp32Connected === 0 ? "No ESP32 devices connected. Upload Arduino code to your ESP32-S3 hardware." : `${esp32Connected} ESP32 device(s) connected and sending real sensor data.`
    })

  } catch (error) {
    console.error('Error fetching real ESP32 station data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}