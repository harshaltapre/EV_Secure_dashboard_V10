"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Map,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  Layers,
  Search,
  Filter,
  Locate,
  Route,
  Car,
  Wifi,
} from "lucide-react"
import { SharedNavigation } from "@/components/shared-navigation"

const mapStations = [
  {
    id: "ST001",
    name: "Downtown Plaza",
    status: "active",
    lat: 40.7128,
    lng: -74.006,
    address: "123 Main St, City Center",
    connectedUsers: 2,
    power: 7.8,
    carConnected: true,
    carModel: "Tesla Model 3",
    chargingProgress: 65,
    apiKey: "active",
    lastSync: "2 min ago",
  },
  {
    id: "ST002",
    name: "Mall Parking",
    status: "threat",
    lat: 40.7589,
    lng: -73.9851,
    address: "456 Commerce Ave, Mall Plaza",
    connectedUsers: 1,
    power: 7.6,
    carConnected: true,
    carModel: "BMW i4",
    chargingProgress: 0,
    apiKey: "active",
    lastSync: "1 min ago",
  },
  {
    id: "ST003",
    name: "Airport Terminal",
    status: "offline",
    lat: 40.6892,
    lng: -74.1745,
    address: "789 Airport Rd, Terminal B",
    connectedUsers: 0,
    power: 0,
    carConnected: false,
    carModel: null,
    chargingProgress: 0,
    apiKey: "inactive",
    lastSync: "15 min ago",
  },
  {
    id: "ST004",
    name: "University Campus",
    status: "active",
    lat: 40.8176,
    lng: -73.9782,
    address: "321 University Blvd, Campus North",
    connectedUsers: 3,
    power: 6.9,
    carConnected: true,
    carModel: "Nissan Leaf",
    chargingProgress: 45,
    apiKey: "active",
    lastSync: "30 sec ago",
  },
  {
    id: "ST005",
    name: "Business Park",
    status: "active",
    lat: 40.7282,
    lng: -73.7949,
    address: "555 Corporate Dr, Business Park",
    connectedUsers: 1,
    power: 7.2,
    carConnected: false,
    carModel: null,
    chargingProgress: 0,
    apiKey: "active",
    lastSync: "1 min ago",
  },
]

export default function MapPage() {
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [mapView, setMapView] = useState("satellite")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStations = mapStations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = statusFilter === "all" || station.status === statusFilter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100"
      case "threat":
        return "text-red-600 bg-red-100"
      case "offline":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "threat":
        return <AlertTriangle className="w-4 h-4" />
      case "offline":
        return <XCircle className="w-4 h-4" />
      default:
        return <XCircle className="w-4 h-4" />
    }
  }

  const selectedStationData = filteredStations.find((s) => s.id === selectedStation)

  const centerMap = () => {
    // Simulate centering map to user location or all stations
    console.log("Centering map...")
  }

  const toggleMapView = () => {
    setMapView(mapView === "satellite" ? "street" : "satellite")
  }

  const getDirections = (station: any) => {
    // Simulate opening directions in maps app
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="map" />

      <div className="lg:ml-64 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Map className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              Station Map View
            </h1>
            <p className="text-gray-600 mt-1">Geographic overview of your charging network</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/80" onClick={centerMap}>
              <Locate className="w-4 h-4 mr-2" />
              Center Map
            </Button>
            <Button variant="outline" size="sm" className="bg-white/80" onClick={toggleMapView}>
              <Layers className="w-4 h-4 mr-2" />
              {mapView === "satellite" ? "Street View" : "Satellite"}
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search stations by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/50 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="threat">Threats</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Map Container */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg h-[600px]">
              <CardContent className="p-0 h-full">
                <div className="relative h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden">
                  {/* Enhanced Mock Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-green-100 to-blue-100 opacity-50"></div>

                  {/* Grid overlay for more realistic map feel */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-12 grid-rows-12 h-full">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border border-gray-300"></div>
                      ))}
                    </div>
                  </div>

                  {/* Map Controls */}
                  <div className="absolute top-4 left-4 z-10 space-y-2">
                    <Button variant="outline" size="icon" className="bg-white/90 shadow-lg">
                      <Search className="w-4 h-4" />
                    </Button>
                    <div className="bg-white/90 rounded-lg p-2 shadow-lg">
                      <div className="space-y-1">
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-lg font-bold">
                          +
                        </Button>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-lg font-bold">
                          -
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" className="bg-white/90 shadow-lg" onClick={centerMap}>
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Enhanced Station Markers */}
                  {filteredStations.map((station, index) => (
                    <div
                      key={station.id}
                      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 ${
                        selectedStation === station.id ? "scale-125 z-20" : "z-10"
                      }`}
                      style={{
                        left: `${20 + index * 15}%`,
                        top: `${30 + index * 10}%`,
                      }}
                      onClick={() => setSelectedStation(station.id)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center ${getStatusColor(station.status)} relative`}
                      >
                        <Zap className="w-5 h-5" />
                        {station.carConnected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Car className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      {selectedStation === station.id && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 min-w-64 z-30 border border-gray-200">
                          <div className="text-sm font-semibold text-gray-800 mb-1">{station.name}</div>
                          <div className="text-xs text-gray-600 mb-2">{station.address}</div>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`${getStatusColor(station.status)} border text-xs`}>
                              {station.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{station.power}kW</span>
                          </div>
                          {station.carConnected && (
                            <div className="text-xs text-blue-600 mb-2">
                              🚗 {station.carModel} - {station.chargingProgress}%
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Wifi className="w-3 h-3" />
                            <span>API: {station.apiKey}</span>
                            <span>• {station.lastSync}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Enhanced Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-4 shadow-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Station Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <Zap className="w-2 h-2 text-white" />
                        </div>
                        <span>Active ({filteredStations.filter((s) => s.status === "active").length})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                          <Zap className="w-2 h-2 text-white" />
                        </div>
                        <span>Threat ({filteredStations.filter((s) => s.status === "threat").length})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
                          <Zap className="w-2 h-2 text-white" />
                        </div>
                        <span>Offline ({filteredStations.filter((s) => s.status === "offline").length})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs pt-1 border-t border-gray-200">
                        <Car className="w-3 h-3 text-blue-500" />
                        <span>Car Connected</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Info */}
                  <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-lg border border-gray-200">
                    <div className="text-xs text-gray-600">
                      <div>View: {mapView}</div>
                      <div>Stations: {filteredStations.length}</div>
                      <div>Active: {filteredStations.filter((s) => s.status === "active").length}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Station List Sidebar */}
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Station List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedStation === station.id
                        ? "bg-blue-50 border-blue-200 shadow-md"
                        : "bg-white/50 border-gray-200 hover:bg-white/80"
                    }`}
                    onClick={() => setSelectedStation(station.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">{station.name}</h4>
                      <div className="flex items-center gap-1">{getStatusIcon(station.status)}</div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{station.id}</p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500">Users: {station.connectedUsers}</span>
                      <span className="text-gray-500">{station.power}kW</span>
                    </div>
                    {station.carConnected && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                        <Car className="w-3 h-3" />
                        <span>{station.carModel}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Wifi className="w-3 h-3" />
                      <span>Last: {station.lastSync}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced Selected Station Details */}
            {selectedStationData && (
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Station Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">{selectedStationData.name}</h4>
                    <p className="text-sm text-gray-600">{selectedStationData.id}</p>
                  </div>

                  <div className="text-sm space-y-2">
                    <p className="text-gray-600">📍 {selectedStationData.address}</p>
                    <p className="text-gray-600">⚡ Power: {selectedStationData.power}kW</p>
                    <p className="text-gray-600">👥 Connected: {selectedStationData.connectedUsers} users</p>

                    {selectedStationData.carConnected && (
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Car className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">{selectedStationData.carModel}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedStationData.chargingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">{selectedStationData.chargingProgress}% charged</p>
                      </div>
                    )}
                  </div>

                  <Badge className={`${getStatusColor(selectedStationData.status)} border`}>
                    {selectedStationData.status.toUpperCase()}
                  </Badge>

                  <div className="pt-2 space-y-2">
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <MapPin className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/50"
                      onClick={() => getDirections(selectedStationData)}
                    >
                      <Route className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
