import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for API keys and status
const apiKeys = new Map<string, { stationId: string; lastUsed: Date; status: 'active' | 'inactive' }>()

// Initialize with default API keys
apiKeys.set('vsr_st001_a1b2c3d4e5f6789012345678901234567890abcd', { stationId: 'ST001', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st002_b2c3d4e5f6789012345678901234567890abcdef', { stationId: 'ST002', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st003_c3d4e5f6789012345678901234567890abcdef12', { stationId: 'ST003', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st004_d4e5f6789012345678901234567890abcdef1234', { stationId: 'ST004', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st005_e5f6789012345678901234567890abcdef123456', { stationId: 'ST005', lastUsed: new Date(), status: 'active' })
apiKeys.set('vsr_st006_f6789012345678901234567890abcdef12345678', { stationId: 'ST006', lastUsed: new Date(), status: 'active' })

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
