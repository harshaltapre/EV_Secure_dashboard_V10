// Shared storage for API keys and sensor data across endpoints
// In production, this should be replaced with a proper database

export interface ApiKeyData {
  stationId: string
  lastUsed: Date
  status: 'active' | 'inactive'
  createdAt: Date
}

export interface SensorDataEntry {
  device_id: string
  sensor_data: {
    voltage?: number
    current?: number
    temperature?: number
    power?: number
    relay_status?: boolean
    ml_threat_level?: string
    car_connected?: boolean
    car_model?: string
    charging_progress?: number
    battery_level?: number
    esp32_status?: string
  }
  timestamp: string
  stationId: string
  apiKey: string
}

// Shared in-memory storage
export const apiKeys = new Map<string, ApiKeyData>()
export const sensorData = new Map<string, SensorDataEntry[]>()

// Initialize with default API keys for all 6 stations with proper format
apiKeys.set('vsr_st001_a1b2c3d4e5f6789012345678901234567890abcd', { 
  stationId: 'ST001', 
  lastUsed: new Date(), 
  status: 'active', 
  createdAt: new Date() 
})
apiKeys.set('vsr_st002_b2c3d4e5f6789012345678901234567890abcdef', { 
  stationId: 'ST002', 
  lastUsed: new Date(), 
  status: 'active', 
  createdAt: new Date() 
})
apiKeys.set('vsr_st003_c3d4e5f6789012345678901234567890abcdef12', { 
  stationId: 'ST003', 
  lastUsed: new Date(), 
  status: 'active', 
  createdAt: new Date() 
})
apiKeys.set('vsr_st004_d4e5f6789012345678901234567890abcdef1234', { 
  stationId: 'ST004', 
  lastUsed: new Date(), 
  status: 'active', 
  createdAt: new Date() 
})
apiKeys.set('vsr_st005_e5f6789012345678901234567890abcdef123456', { 
  stationId: 'ST005', 
  lastUsed: new Date(), 
  status: 'active', 
  createdAt: new Date() 
})
apiKeys.set('vsr_st006_f6789012345678901234567890abcdef12345678', { 
  stationId: 'ST006', 
  lastUsed: new Date(), 
  status: 'active', 
  createdAt: new Date() 
})

// Station metadata
export const stationMetadata = {
  ST001: {
    name: "Downtown Plaza",
    location: "Downtown District",
    address: "123 Main St, City Center",
  },
  ST002: {
    name: "Mall Parking",
    location: "Shopping District", 
    address: "456 Commerce Ave, Mall Plaza",
  },
  ST003: {
    name: "Airport Terminal",
    location: "Airport",
    address: "789 Airport Rd, Terminal B",
  },
  ST004: {
    name: "University Campus",
    location: "Education District",
    address: "321 University Blvd, Campus North",
  },
  ST005: {
    name: "Business Park",
    location: "Business District",
    address: "555 Corporate Dr, Business Park",
  },
  ST006: {
    name: "Residential Complex",
    location: "Residential Area",
    address: "888 Home Ave, Residential Complex",
  },
}