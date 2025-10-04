import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for commands
const apiKeys = new Map<string, { stationId: string; lastUsed: Date; status: 'active' | 'inactive' }>()
const commandQueue = new Map<string, any[]>()

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

    const stationId = keyData.stationId
    const commands = commandQueue.get(stationId) || []

    // Return the oldest unprocessed command
    const pendingCommand = commands.find(cmd => !cmd.processed)
    
    if (pendingCommand) {
      // Mark command as processed
      pendingCommand.processed = true
      pendingCommand.processedAt = new Date().toISOString()
      
      console.log(`Command sent to ${stationId}:`, pendingCommand)
      
      return NextResponse.json({
        success: true,
        command: pendingCommand
      })
    }

    return NextResponse.json({
      success: true,
      command: null,
      message: 'No pending commands'
    })

  } catch (error) {
    console.error('Error retrieving commands:', error)
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
    
    if (!body.stationId || !body.command) {
      return NextResponse.json(
        { error: 'Missing required fields: stationId, command' },
        { status: 400 }
      )
    }

    const stationId = body.stationId
    if (!commandQueue.has(stationId)) {
      commandQueue.set(stationId, [])
    }

    const command = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      command: body.command,
      parameters: body.parameters || {},
      timestamp: new Date().toISOString(),
      processed: false,
      createdBy: 'dashboard'
    }

    commandQueue.get(stationId)!.push(command)
    
    console.log(`Command queued for ${stationId}:`, command)

    return NextResponse.json({
      success: true,
      message: 'Command queued successfully',
      commandId: command.id
    })

  } catch (error) {
    console.error('Error queuing command:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
