import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for alerts
const apiKeys = new Map<string, { stationId: string; lastUsed: Date; status: 'active' | 'inactive' }>()
const alerts = new Map<string, any[]>()

// Initialize with default API keys
apiKeys.set('vsr_st001_abc123def456', { stationId: 'ST001', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st002_xyz789ghi012', { stationId: 'ST002', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st003_mno345pqr678', { stationId: 'ST003', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st004_stu901vwx234', { stationId: 'ST004', lastUsed: new Date(), status: 'active' })

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
    
    if (!body.device_id || !body.alert_type) {
      return NextResponse.json(
        { error: 'Missing required fields: device_id, alert_type' },
        { status: 400 }
      )
    }

    const stationId = keyData.stationId
    if (!alerts.has(stationId)) {
      alerts.set(stationId, [])
    }

    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      device_id: body.device_id,
      alert_type: body.alert_type,
      details: body.details || '',
      severity: body.severity || 'medium',
      timestamp: new Date().toISOString(),
      stationId,
      status: 'active',
      acknowledged: false
    }

    alerts.get(stationId)!.push(alert)
    
    // Keep only last 50 alerts per station
    const stationAlerts = alerts.get(stationId)!
    if (stationAlerts.length > 50) {
      stationAlerts.splice(0, stationAlerts.length - 50)
    }

    console.log(`Alert received from ${stationId}:`, {
      alert_type: alert.alert_type,
      severity: alert.severity,
      timestamp: alert.timestamp
    })

    return NextResponse.json({
      success: true,
      message: 'Alert received successfully',
      alertId: alert.id
    })

  } catch (error) {
    console.error('Error processing alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const stationId = keyData.stationId
    const stationAlerts = alerts.get(stationId) || []

    // Return active alerts
    const activeAlerts = stationAlerts.filter(alert => alert.status === 'active')

    return NextResponse.json({
      success: true,
      stationId,
      alerts: activeAlerts.slice(-10), // Return last 10 active alerts
      totalAlerts: stationAlerts.length,
      activeAlerts: activeAlerts.length
    })

  } catch (error) {
    console.error('Error retrieving alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
