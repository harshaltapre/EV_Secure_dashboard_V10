import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { apiKeys } from '@/lib/shared-storage'

export async function GET(request: NextRequest) {
  try {
    // Get all API keys for the dashboard
    const keysArray = Array.from(apiKeys.entries()).map(([key, data]) => ({
      key: key.substring(0, 10) + '...', // Partial key for security
      fullKey: key,
      stationId: data.stationId,
      status: data.status,
      lastUsed: data.lastUsed,
      createdAt: data.createdAt
    }))

    return NextResponse.json({
      success: true,
      keys: keysArray
    })

  } catch (error) {
    console.error('Error retrieving API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.stationId) {
      return NextResponse.json(
        { error: 'Missing required field: stationId' },
        { status: 400 }
      )
    }

    // Generate new API key with consistent, longer format
    // Format: vsr_<station>_<24-hex chars> (e.g., vsr_st001_a1b2...)
    const stationSlug = String(body.stationId).toLowerCase()
    const suffix = crypto.randomBytes(16).toString('hex') // 32 hex chars
    const newKey = `vsr_${stationSlug}_${suffix}`
    
    // Check if station already has an active key
    const existingKey = Array.from(apiKeys.entries()).find(([_, data]) => 
      data.stationId === body.stationId && data.status === 'active'
    )

    if (existingKey) {
      // Deactivate existing key
      const [oldKey, oldData] = existingKey
      oldData.status = 'inactive'
      apiKeys.set(oldKey, oldData)
    }

    // Add new key
    apiKeys.set(newKey, {
      stationId: body.stationId,
      lastUsed: new Date(),
      status: 'active',
      createdAt: new Date()
    })

    console.log(`New API key generated for ${body.stationId}:`, newKey.substring(0, 10) + '...')

    return NextResponse.json({
      success: true,
      message: 'API key generated successfully',
      key: newKey,
      stationId: body.stationId,
      createdAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.key) {
      return NextResponse.json(
        { error: 'Missing required field: key' },
        { status: 400 }
      )
    }

    const keyData = apiKeys.get(body.key)
    
    if (!keyData) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Revoke the key
    keyData.status = 'inactive'
    apiKeys.set(body.key, keyData)

    console.log(`API key revoked for ${keyData.stationId}:`, body.key.substring(0, 10) + '...')

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
      stationId: keyData.stationId
    })

  } catch (error) {
    console.error('Error revoking API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
