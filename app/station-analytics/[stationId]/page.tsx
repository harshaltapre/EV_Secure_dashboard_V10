"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Battery,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Activity,
  Gauge,
  Thermometer,
  Wifi,
  RefreshCw,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface StationData {
  success: boolean
  stationId: string
  station: {
    id: string
    name: string
    location: string
    power: string
  }
  status: 'connected' | 'disconnected' | 'no_api_key' | 'no_data'
  data: {
    voltage: number
    current: number
    temperature: number
    power: number
    batteryLevel: number
    chargingProgress: number
    carConnected: boolean
    carModel: string | null
    relayStatus: boolean
    threatLevel: string
    firmwareVersion: string
    isCharging: boolean
    isSecure: boolean
    estimatedChargingTime: number
    historicalData: Array<{
      time: string
      batteryLevel: number
      chargingRate: number
      temperature: number
      voltage: number
      current: number
      threatLevel: string
    }>
    securityData: Array<{
      metric: string
      value: number
      status: string
    }>
    lastUpdate: string
    dataAge: number
    isRecentData: boolean
    totalDataPoints: number
  } | null
  message?: string
}

export default function StationAnalytics() {
  const params = useParams()
  const router = useRouter()
  const stationId = params.stationId as string
  
  const [stationData, setStationData] = useState<StationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchStationData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/station/${stationId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch station data')
      }
      
      setStationData(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching station data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch station data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const userSession = localStorage.getItem("userSession")
    if (!userSession) {
      router.push("/login")
      return
    }

    const session = JSON.parse(userSession)
    if (session.role !== "end_user") {
      router.push("/")
      return
    }

    // Fetch station data
    fetchStationData()

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchStationData, 10000)
    
    return () => clearInterval(interval)
  }, [stationId, router])

  if (isLoading && !stationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading station analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => fetchStationData()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => router.push("/user-dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!stationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Station Not Found</h2>
          <p className="text-gray-600 mb-4">The requested station could not be found.</p>
          <Button onClick={() => router.push("/user-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "disconnected":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "no_api_key":
        return "bg-red-100 text-red-800 border-red-200"
      case "no_data":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSecurityStatus = (isSecure: boolean, threatLevel: string) => {
    if (threatLevel === 'high' || threatLevel === 'critical') {
      return { color: "text-red-600", icon: AlertTriangle, text: "Threat Detected" }
    }
    if (!isSecure) {
      return { color: "text-yellow-600", icon: AlertTriangle, text: "Warning" }
    }
    return { color: "text-green-600", icon: CheckCircle, text: "Secure" }
  }

  // Handle different data states
  const isConnected = stationData.status === 'connected'
  const hasData = stationData.data !== null
  const data = stationData.data

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/user-dashboard")}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{stationData.station.name}</h1>
                <p className="text-sm text-gray-600">Station ID: {stationData.station.id}</p>
              </div>
            </div>
            <Badge className={getStatusColor(stationData.status)}>
              {stationData.status.toUpperCase()}
            </Badge>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {stationData.status === 'no_api_key' ? 'No API Key' : 'No Data Available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {stationData.message || 'This station is not sending data to the system.'}
                </p>
                <div className="space-x-2">
                  <Button onClick={() => fetchStationData()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/user-dashboard")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const securityStatus = getSecurityStatus(data!.isSecure, data!.threatLevel)
  const SecurityIcon = securityStatus.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/user-dashboard")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{stationData.station.name}</h1>
              <p className="text-sm text-gray-600">Station ID: {stationData.station.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(stationData.status)}>
              {stationData.status.toUpperCase()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchStationData()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Station Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Power Output</p>
                  <p className="text-lg font-semibold text-gray-800">{data!.power.toFixed(1)} kW</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gauge className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Voltage</p>
                  <p className="text-lg font-semibold text-gray-800">{data!.voltage.toFixed(1)}V</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current</p>
                  <p className="text-lg font-semibold text-gray-800">{data!.current.toFixed(1)}A</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Thermometer className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-lg font-semibold text-gray-800">{data!.temperature.toFixed(1)}°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Status */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <SecurityIcon className={`w-6 h-6 ${securityStatus.color}`} />
                <div>
                  <p className="font-semibold text-gray-800">Overall Security</p>
                  <p className={`text-sm ${securityStatus.color}`}>{securityStatus.text}</p>
                </div>
              </div>
              <Badge className={securityStatus.color.replace('text-', 'bg-').replace('-600', '-100') + ' ' + securityStatus.color}>
                {data!.threatLevel.toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {data!.securityData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-gray-800">{item.value}%</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.metric}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs mt-1 ${
                      item.status === 'secure' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charging Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-green-600" />
                Battery Level (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data!.historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="batteryLevel" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Charging Rate (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data!.historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="chargingRate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Station Information */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-purple-600" />
              Station Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Location</h4>
                <p className="text-gray-600">{stationData.station.location}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Last Update</h4>
                <p className="text-gray-600">{data!.lastUpdate ? new Date(data!.lastUpdate).toLocaleString() : 'Never'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Data Age</h4>
                <p className="text-gray-600">{data!.dataAge}s ago</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Data Points</h4>
                <p className="text-gray-600">{data!.totalDataPoints} records</p>
              </div>
            </div>
            
            {/* Additional real-time info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Charging Status</h4>
                <p className="text-blue-600">
                  {data.isCharging ? 'Currently Charging' : 'Not Charging'}
                </p>
                {data.carConnected && (
                  <p className="text-sm text-blue-500 mt-1">
                    Car: {data.carModel || 'Unknown Model'}
                  </p>
                )}
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Battery Progress</h4>
                <p className="text-green-600">{data.batteryLevel.toFixed(1)}%</p>
                {data.estimatedChargingTime > 0 && (
                  <p className="text-sm text-green-500 mt-1">
                    Est. {data.estimatedChargingTime} min remaining
                  </p>
                )}
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Firmware</h4>
                <p className="text-purple-600">{data.firmwareVersion}</p>
                <p className="text-sm text-purple-500 mt-1">
                  Relay: {data.relayStatus ? 'ON' : 'OFF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
