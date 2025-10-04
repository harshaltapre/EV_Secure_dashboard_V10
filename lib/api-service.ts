// API Service for consistent data fetching across all pages
export interface StationData {
  id: string
  name: string
  location: string
  status: string
  voltage: number
  current: number
  temp: number
  power: number
  relayStatus: boolean
  firmwareVersion: string
  connectedUser: string | null
  carConnected: boolean
  carModel: string | null
  chargingProgress: number
  mlThreatLevel: string
  esp32Status: string
  batteryLevel: number
  lastSync: string
  apiKey: string
  esp32Connected: boolean
  lastDataReceived: string | null
}

export interface DashboardData {
  success: boolean
  stations: StationData[]
  timestamp: string
  totalStations: number
  esp32Connected: number
  activeStations: number
  connectedCars: number
  threats: number
  realDataOnly: boolean
  message: string
}

class APIService {
  private static instance: APIService
  private cache: DashboardData | null = null
  private lastFetch: number = 0
  private readonly CACHE_DURATION = 3000 // 3 seconds

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService()
    }
    return APIService.instance
  }

  async fetchStationsData(): Promise<DashboardData> {
    const now = Date.now()
    
    // Return cached data if it's still fresh
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache
    }

    try {
      const response = await fetch('/api/stations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DashboardData = await response.json()
      
      // Cache the data
      this.cache = data
      this.lastFetch = now
      
      return data
    } catch (error) {
      console.error('API Service Error:', error)
      
      // Return cached data if available, otherwise return empty data
      if (this.cache) {
        return this.cache
      }
      
      return {
        success: false,
        stations: [],
        timestamp: new Date().toISOString(),
        totalStations: 0,
        esp32Connected: 0,
        activeStations: 0,
        connectedCars: 0,
        threats: 0,
        realDataOnly: true,
        message: 'API Error - Using cached data'
      }
    }
  }

  // Get specific station data
  getStationData(stationId: string, data: DashboardData): StationData | null {
    return data.stations.find(station => station.id === stationId) || null
  }

  // Get connection status
  getConnectionStatus(data: DashboardData): {
    isConnected: boolean
    connectedCount: number
    message: string
  } {
    return {
      isConnected: data.esp32Connected > 0,
      connectedCount: data.esp32Connected,
      message: data.message
    }
  }

  // Get threat analysis
  getThreatAnalysis(data: DashboardData): {
    totalThreats: number
    highThreats: number
    criticalThreats: number
    secureStations: number
  } {
    const highThreats = data.stations.filter(s => s.mlThreatLevel === 'high').length
    const criticalThreats = data.stations.filter(s => s.mlThreatLevel === 'critical').length
    const secureStations = data.stations.filter(s => s.mlThreatLevel === 'safe' || s.mlThreatLevel === 'monitoring').length

    return {
      totalThreats: data.threats,
      highThreats,
      criticalThreats,
      secureStations
    }
  }

  // Get revenue data
  getRevenueData(data: DashboardData): {
    totalRevenue: number
    totalSessions: number
    avgSessionValue: number
  } {
    const totalRevenue = data.connectedCars * 15.50 // $15.50 per session
    const totalSessions = data.connectedCars + Math.floor(Math.random() * 5)
    const avgSessionValue = totalSessions > 0 ? totalRevenue / totalSessions : 0

    return {
      totalRevenue,
      totalSessions,
      avgSessionValue
    }
  }

  // Clear cache (useful for manual refresh)
  clearCache(): void {
    this.cache = null
    this.lastFetch = 0
  }
}

export default APIService
