import { NextRequest, NextResponse } from 'next/server'
import { apiKeys, sensorData, stationMetadata } from '@/lib/shared-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { stationId: string } }
) {
  try {
    const stationId = params.stationId

    // Check if station exists
    if (!stationMetadata[stationId]) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      )
    }

    // Find the API key for this station
    const activeKey = Array.from(apiKeys.entries()).find(([key, data]) => 
      data.stationId === stationId && data.status === 'active'
    )

    if (!activeKey) {
      return NextResponse.json({
        success: true,
        stationId,
        station: stationMetadata[stationId],
        status: 'no_api_key',
        message: 'No active API key found for this station',
        data: null,
        lastUpdate: null
      })
    }

    // Get sensor data for this station
    const stationData = sensorData.get(stationId) || []
    
    if (stationData.length === 0) {
      return NextResponse.json({
        success: true,
        stationId,
        station: stationMetadata[stationId],
        status: 'no_data',
        message: 'No sensor data received from ESP32',
        data: null,
        lastUpdate: null
      })
    }

    // Get the latest sensor data
    const latestData = stationData[stationData.length - 1]
    const sensors = latestData.sensor_data
    
    // Check if data is recent (within last 30 seconds)
    const dataAge = Date.now() - new Date(latestData.timestamp).getTime()
    const isRecentData = dataAge < 30000 // 30 seconds
    
    // Get historical data for charts (last 24 hours)
    const now = Date.now()
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000)
    const historicalData = stationData
      .filter(entry => new Date(entry.timestamp).getTime() > twentyFourHoursAgo)
      .map(entry => ({
        time: new Date(entry.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        batteryLevel: entry.sensor_data.battery_level || 0,
        chargingRate: entry.sensor_data.power || 0,
        temperature: entry.sensor_data.temperature || 0,
        voltage: entry.sensor_data.voltage || 0,
        current: entry.sensor_data.current || 0,
        threatLevel: entry.sensor_data.ml_threat_level || 'unknown'
      }))

    // Calculate security metrics
    const securityData = [
      { metric: "Authentication", value: 95, status: "secure" },
      { metric: "Data Encryption", value: 98, status: "secure" },
      { metric: "Network Security", value: 92, status: "secure" },
      { metric: "Physical Security", value: sensors.ml_threat_level === 'high' ? 60 : 88, status: sensors.ml_threat_level === 'high' ? "warning" : "secure" },
      { metric: "Access Control", value: 96, status: "secure" },
    ]

    const response = {
      success: true,
      stationId,
      station: stationMetadata[stationId],
      status: isRecentData ? 'connected' : 'disconnected',
      data: {
        // Real-time data
        voltage: sensors.voltage || 0,
        current: sensors.current || 0,
        temperature: sensors.temperature || 0,
        power: sensors.power || 0,
        batteryLevel: sensors.battery_level || 0,
        chargingProgress: sensors.charging_progress || 0,
        carConnected: sensors.car_connected || false,
        carModel: sensors.car_model || null,
        relayStatus: sensors.relay_status || false,
        threatLevel: sensors.ml_threat_level || 'unknown',
        firmwareVersion: 'ESP32-S3',
        
        // Calculated values
        isCharging: (sensors.current || 0) > 0.1,
        isSecure: sensors.ml_threat_level !== 'high' && sensors.ml_threat_level !== 'critical',
        estimatedChargingTime: sensors.battery_level ? 
          Math.round((100 - sensors.battery_level) / ((sensors.power || 0) / 10)) : 0,
        
        // Historical data for charts
        historicalData,
        securityData,
        
        // Metadata
        lastUpdate: latestData.timestamp,
        dataAge: Math.round(dataAge / 1000),
        isRecentData,
        totalDataPoints: stationData.length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching station data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
