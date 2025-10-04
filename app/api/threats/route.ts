import { NextRequest, NextResponse } from 'next/server'
import { apiKeys, sensorData } from '@/lib/shared-storage'

// In-memory storage for threat logs - all security events and alerts
const threatLogs = new Map<string, any[]>()

// Initialize with some sample threat data until ESP32 devices connect
const sampleThreats = [
  {
    id: "THR001",
    timestamp: new Date().toISOString(),
    type: "System Startup",
    station: "SYSTEM",
    stationName: "Dashboard System",
    severity: "info",
    status: "active",
    description: "EV-Secure system initialized and waiting for ESP32 connections",
    source: "System",
    action: "API endpoints ready for ESP32 devices",
    mlConfidence: 100,
    device_id: "dashboard",
    details: "All 6 stations (ST001-ST006) have API keys ready for configuration"
  }
]

// Add sample threat to logs
threatLogs.set('SYSTEM', sampleThreats)

export async function GET(request: NextRequest) {
  try {
    // Collect all threats from all stations
    const allThreats: any[] = []
    
    // Add threats from all stations
    for (const [stationId, threats] of threatLogs.entries()) {
      allThreats.push(...threats.map(threat => ({
        ...threat,
        stationId
      })))
    }
    
    // Add alerts as threats (alerts are also security events)
    for (const [stationId, alerts] of threatLogs.entries()) {
      if (stationId !== 'SYSTEM') {
        const stationAlerts = alerts.filter(alert => alert.alert_type)
        allThreats.push(...stationAlerts.map(alert => ({
          id: alert.id,
          timestamp: alert.timestamp,
          type: alert.alert_type,
          station: alert.stationId,
          stationName: getStationName(alert.stationId),
          severity: alert.severity || 'medium',
          status: alert.status || 'active',
          description: alert.details || `${alert.alert_type} detected`,
          source: alert.device_id || 'ESP32',
          action: alert.acknowledged ? 'Acknowledged by operator' : 'Awaiting response',
          mlConfidence: alert.ml_confidence || 0,
          device_id: alert.device_id,
          details: alert.details
        })))
      }
    }
    
    // Sort by timestamp (newest first)
    allThreats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return NextResponse.json({
      success: true,
      threats: allThreats,
      total: allThreats.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error retrieving threat logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)
    const keyData = apiKeys.get(apiKey)

    if (!keyData || keyData.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields for threat logging
    if (!body.threat_type || !body.device_id) {
      return NextResponse.json(
        { error: 'Missing required fields: threat_type, device_id' },
        { status: 400 }
      )
    }

    // Update last used timestamp
    keyData.lastUsed = new Date()
    apiKeys.set(apiKey, keyData)

    const stationId = keyData.stationId
    if (!threatLogs.has(stationId)) {
      threatLogs.set(stationId, [])
    }

    const threat = {
      id: `THR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: body.threat_type,
      station: stationId,
      stationName: getStationName(stationId),
      severity: body.severity || 'medium',
      status: body.status || 'active', 
      description: body.description || `${body.threat_type} detected by ESP32`,
      source: body.source || body.device_id,
      action: body.action || 'Logged for analysis',
      mlConfidence: body.ml_confidence || 0,
      device_id: body.device_id,
      details: body.details || '',
      raw_data: body.sensor_data || {}
    }

    threatLogs.get(stationId)!.push(threat)
    
    // Keep last 200 threats per station for comprehensive logging
    const stationThreats = threatLogs.get(stationId)!
    if (stationThreats.length > 200) {
      stationThreats.splice(0, stationThreats.length - 200)
    }

    console.log(`Threat logged from ${stationId}:`, {
      type: threat.type,
      severity: threat.severity,
      ml_confidence: threat.mlConfidence,
      timestamp: threat.timestamp
    })

    return NextResponse.json({
      success: true,
      message: 'Threat logged successfully',
      threatId: threat.id,
      stationId,
      timestamp: threat.timestamp
    })

  } catch (error) {
    console.error('Error logging threat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getStationName(stationId: string): string {
  const stationNames: { [key: string]: string } = {
    'ST001': 'Downtown Plaza',
    'ST002': 'Mall Parking', 
    'ST003': 'Airport Terminal',
    'ST004': 'University Campus',
    'ST005': 'Business Park',
    'ST006': 'Residential Complex',
    'SYSTEM': 'Dashboard System'
  }
  return stationNames[stationId] || 'Unknown Station'
}