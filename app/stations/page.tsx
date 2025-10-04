"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Zap,
  Power,
  Wifi,
  WifiOff,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  MoreVertical,
  Car,
  Cpu,
  Battery,
  Thermometer,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { SharedNavigation } from "@/components/shared-navigation"
import APIService from "@/lib/api-service"

interface StationData {
  id: string
  name: string
  status: string
  voltage: number
  current: number
  temp: number
  power: number
  location: string
  address: string
  apiKey: string
  lastSync: string
  relayStatus: boolean
  firmwareVersion: string
  connectedUser: string | null
  carConnected: boolean
  carModel: string | null
  chargingProgress: number
  mlThreatLevel: string
  esp32Status: string
  batteryLevel: number
}

export default function StationsPage() {
  const [stations, setStations] = useState<StationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Fetch stations data from API (supports initial vs incremental refresh)
  const fetchStationsData = async (opts?: { initial?: boolean }) => {
    const initial = !!opts?.initial
    try {
      if (initial) setLoading(true)
      setError(null)
      const response = await fetch('/api/stations', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch stations data')
      }
      const data = await response.json()
      if (data.success) {
        if (initial) {
          setStations(data.stations)
        } else {
          // Preserve scroll position and merge updates in-place by id
          const currentScroll = window.scrollY
          setStations((prev) => {
            const prevById = new Map(prev.map((s: StationData) => [s.id, s]))
            const nextList: StationData[] = []
            // Keep existing order, update values if present
            for (const s of prev) {
              const updated = data.stations.find((n: StationData) => n.id === s.id)
              nextList.push(updated ? { ...s, ...updated } : s)
            }
            // Append any new stations not seen before
            for (const n of data.stations) {
              if (!prevById.has(n.id)) nextList.push(n)
            }
            // Restore scroll after DOM paints
            requestAnimationFrame(() => window.scrollTo(0, currentScroll))
            return nextList
          })
        }
      } else {
        throw new Error(data.error || 'Failed to load stations')
      }
    } catch (error) {
      console.error('Error fetching stations:', error)
      setError(error instanceof Error ? error.message : 'Failed to load stations')
    } finally {
      if (initial) setLoading(false)
    }
  }

  // Load data on component mount and set up periodic refresh
  useEffect(() => {
    fetchStationsData({ initial: true })
    
    // Refresh data every 5 seconds with in-place update (no loading state)
    const interval = setInterval(() => fetchStationsData({}), 5000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || station.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const toggleRelay = (stationId: string) => {
    setStations((prev) =>
      prev.map((station) => (station.id === stationId ? { ...station, relayStatus: !station.relayStatus } : station)),
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
      case "threat":
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
      case "offline":
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
      default:
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "threat":
        return "bg-red-100 text-red-800 border-red-200"
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="stations" />

      <div className="lg:ml-64 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <span className="truncate">Charging Stations</span>
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Monitor and control your EV charging infrastructure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/80 text-xs sm:text-sm"
              onClick={() => fetchStationsData({ initial: true })}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-green-500 to-purple-500 text-white text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Configure</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Stations</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">{stations.length}</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Active</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {stations.filter((s) => s.status === "active").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Connected Cars</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {stations.filter((s) => s.carConnected).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">ML Threats</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">
                    {stations.filter((s) => s.mlThreatLevel === "high").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search stations by name, ID, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="threat">Threats</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && !stations.length && (
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center">
              <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Loading stations...</h3>
              <p className="text-sm sm:text-base text-gray-600">Fetching real-time data from API keys</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50/80 backdrop-blur-xl border-red-200 shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center">
              <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Error loading stations</h3>
              <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
              <Button onClick={fetchStationsData} className="bg-red-500 hover:bg-red-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stations Grid */}
        {/* ESP32 Connection Summary */}
        {!loading && !error && stations.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">ESP32-S3 Hardware Status</h3>
                    <p className="text-sm text-blue-600">
                      {stations.filter(s => s.esp32Status === "connected").length} of {stations.length} devices connected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-800">
                    {stations.filter(s => s.esp32Status === "connected").length}/{stations.length}
                  </div>
                  <div className="text-xs text-blue-600">Real Hardware</div>
                </div>
              </div>
              {stations.filter(s => s.esp32Status === "connected").length === 0 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ⚡ Upload Arduino code to your ESP32-S3 devices to see live sensor data
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stations Grid */}
        {!loading && !error && stations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredStations.map((station) => (
              <Card
                key={station.id}
                className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out"
              >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {getStatusIcon(station.status)}
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-lg text-gray-800 truncate">{station.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {station.id} • {station.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge className={`${getStatusColor(station.status)} border text-xs`}>
                      {station.status.toUpperCase()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 sm:w-8 sm:h-8">
                          <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Firmware</DropdownMenuItem>
                        <DropdownMenuItem>Reset Station</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded truncate">📍 {station.address}</div>

                {/* Car Connection Status */}
                {station.carConnected ? (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Car className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-blue-800 truncate">{station.carModel}</span>
                      </div>
                      <span className="text-xs text-blue-600 flex-shrink-0">{station.chargingProgress}%</span>
                    </div>
                    <Progress value={station.chargingProgress} className="h-2" />
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">No car connected</span>
                    </div>
                  </div>
                )}

                {/* ESP32 Hardware Status */}
                <div className={`p-3 rounded-lg border ${
                  station.esp32Status === "connected" 
                    ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200" 
                    : station.esp32Status === "waiting_for_connection"
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                    : "bg-gradient-to-r from-gray-50 to-red-50 border-gray-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Cpu className={`w-4 h-4 flex-shrink-0 ${
                        station.esp32Status === "connected" ? "text-green-600" : 
                        station.esp32Status === "waiting_for_connection" ? "text-yellow-600" : "text-gray-500"
                      }`} />
                      <span className={`text-sm font-medium truncate ${
                        station.esp32Status === "connected" ? "text-green-800" : 
                        station.esp32Status === "waiting_for_connection" ? "text-yellow-800" : "text-gray-600"
                      }`}>
                        ESP32-S3 Hardware
                      </span>
                    </div>
                    <Badge
                      className={`text-xs flex-shrink-0 ${
                        station.esp32Status === "connected" 
                          ? "bg-green-100 text-green-800 border-green-200"
                          : station.esp32Status === "waiting_for_connection"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {station.esp32Status === "connected" ? "CONNECTED" : 
                       station.esp32Status === "waiting_for_connection" ? "WAITING" : "OFFLINE"}
                    </Badge>
                  </div>
                  <div className="text-xs">
                    {station.esp32Status === "connected" ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-700">Live sensor data</span>
                        </div>
                        <div className="text-green-600">ML Threat: {station.mlThreatLevel.toUpperCase()}</div>
                      </div>
                    ) : station.esp32Status === "waiting_for_connection" ? (
                      <div className="text-yellow-700">
                        Ready for ESP32-S3 connection with API key
                      </div>
                    ) : (
                      <div className="text-red-600">
                        Upload Arduino code to ESP32-S3 device
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg transition-all duration-300">
                    <p className="text-xs text-blue-600 font-medium">Voltage</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-800 transition-all duration-300">{station.voltage}V</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg transition-all duration-300">
                    <p className="text-xs text-green-600 font-medium">Current</p>
                    <p className="text-sm sm:text-lg font-bold text-green-800 transition-all duration-300">{station.current}A</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg transition-all duration-300">
                    <div className="flex items-center justify-center space-x-1">
                      <Thermometer className="w-3 h-3 text-orange-600" />
                      <p className="text-xs text-orange-600 font-medium">Temp</p>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-orange-800 transition-all duration-300">{station.temp}°C</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg transition-all duration-300">
                    <div className="flex items-center justify-center space-x-1">
                      <Battery className="w-3 h-3 text-purple-600" />
                      <p className="text-xs text-purple-600 font-medium">Power</p>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-purple-800 transition-all duration-300">{station.power}kW</p>
                  </div>
                </div>

                {/* Connection Status Information */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 sm:gap-4 text-sm min-w-0">
                    <div className="flex items-center gap-1">
                      {station.apiKey === "active" ? (
                        <Wifi className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-600 text-xs sm:text-sm truncate">
                        API: {station.apiKey} 
                        {station.esp32Connected && <span className="text-green-600 ml-1">• ESP32 ✓</span>}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm truncate">
                      Data: {station.lastSync}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-gray-600">Relay:</span>
                      <Switch
                        checked={station.relayStatus}
                        onCheckedChange={() => toggleRelay(station.id)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/50 hover:bg-white/80 p-1 sm:p-2"
                      onClick={() => toggleRelay(station.id)}
                    >
                      <Power className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <span className="truncate">Firmware: {station.firmwareVersion}</span>
                  {station.connectedUser && <span className="truncate">User: {station.connectedUser}</span>}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredStations.length === 0 && stations.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center">
              <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No stations found</h3>
              <p className="text-sm sm:text-base text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
