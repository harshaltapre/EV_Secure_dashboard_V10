import { NextRequest, NextResponse } from 'next/server'
import { apiKeys, sensorData, type SensorDataEntry } from '@/lib/shared-storage'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
    const keyData = apiKeys.get(apiKey)

    if (!keyData || keyData.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.device_id || !body.sensor_data) {
      return NextResponse.json(
        { error: 'Missing required fields: device_id, sensor_data' },
        { status: 400 }
      )
    }

    // Update last used timestamp
    keyData.lastUsed = new Date()
    apiKeys.set(apiKey, keyData)

    // Store sensor data
    const stationId = keyData.stationId
    if (!sensorData.has(stationId)) {
      sensorData.set(stationId, [])
    }
    
    const dataEntry: SensorDataEntry = {
      device_id: body.device_id,
      sensor_data: body.sensor_data,
      timestamp: new Date().toISOString(),
      stationId,
      apiKey: apiKey.substring(0, 10) + '...' // Partial key for logging
    }
    
    sensorData.get(stationId)!.push(dataEntry)
    
    // Keep only last 100 entries per station
    const stationData = sensorData.get(stationId)!
    if (stationData.length > 100) {
      stationData.splice(0, stationData.length - 100)
    }

    console.log(`Data received from ${stationId}:`, {
      device_id: body.device_id,
      timestamp: dataEntry.timestamp,
      sensor_count: Object.keys(body.sensor_data || {}).length
    })

    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      stationId,
      timestamp: dataEntry.timestamp
    })

  } catch (error) {
    console.error('Error processing sensor data:', error)
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
    const data = sensorData.get(stationId) || []

    return NextResponse.json({
      success: true,
      stationId,
      data: data.slice(-10), // Return last 10 entries
      totalEntries: data.length
    })

  } catch (error) {
    console.error('Error retrieving sensor data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
