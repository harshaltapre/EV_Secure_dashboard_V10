import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for API keys and status
const apiKeys = new Map<string, { stationId: string; lastUsed: Date; status: 'active' | 'inactive' }>()

// Initialize with default API keys
apiKeys.set('vsr_st001_abc123def456', { stationId: 'ST001', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st002_xyz789ghi012', { stationId: 'ST002', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st003_mno345pqr678', { stationId: 'ST003', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st004_stu901vwx234', { stationId: 'ST004', lastUsed: new Date(), status: 'active' })

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

    // Update last used timestamp
    keyData.lastUsed = new Date()
    apiKeys.set(apiKey, keyData)

    const status = {
      success: true,
      message: 'API connection successful',
      stationId: keyData.stationId,
      timestamp: new Date().toISOString(),
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      endpoints: {
        data: '/api/data',
        commands: '/api/commands',
        alerts: '/api/alerts',
        status: '/api/status'
      }
    }

    console.log(`Status check from ${keyData.stationId}:`, {
      timestamp: status.timestamp,
      uptime: status.uptime
    })

    return NextResponse.json(status)

  } catch (error) {
    console.error('Error checking status:', error)
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
    
    // Update station status
    const statusUpdate = {
      stationId: keyData.stationId,
      timestamp: new Date().toISOString(),
      status: body.status || 'online',
      battery: body.battery || 100,
      signal: body.signal || -50,
      temperature: body.temperature || 25,
      lastHeartbeat: new Date().toISOString()
    }

    console.log(`Status update from ${keyData.stationId}:`, statusUpdate)

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      ...statusUpdate
    })

  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
