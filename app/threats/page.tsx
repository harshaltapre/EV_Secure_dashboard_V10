"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, Search, Filter, Download, Eye, Clock, MapPin, Activity, Lock, Unlock, CheckCircle, XCircle } from "lucide-react"
import { SharedNavigation } from "@/components/shared-navigation"
import { ThreatQuarantineSystem } from "@/components/threat-quarantine-system"
import { useESP32Connection } from "@/hooks/use-esp32-connection"

interface ThreatData {
  id: string
  timestamp: string
  type: string
  station: string
  stationName: string
  severity: "low" | "medium" | "high" | "critical"
  status: "quarantined" | "monitoring" | "resolved" | "false_positive" | "active"
  description: string
  source: string
  action: string
  mlConfidence: number
  device_id?: string
  details?: string
  sensorData?: {
    voltage: number
    current: number
    temperature: number
    power: number
    frequency: number
  }
  attackType?: string
  quarantineReason?: string
  autoQuarantine?: boolean
  manualOverride?: boolean
  resolvedBy?: string
  resolvedAt?: string
}

export default function ThreatsPage() {
  const [threats, setThreats] = useState<ThreatData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  
  // Use ESP32 connection hook for real-time status
  const {
    isConnected: esp32Connected,
    connectedStations,
    totalStations,
    lastUpdate,
    error: connectionError,
    isLoading: connectionLoading,
    refreshConnection
  } = useESP32Connection()

  // Handle quarantine actions
  const handleQuarantineAction = async (threatId: string, action: string) => {
    try {
      // Update threat status locally
      setThreats(prevThreats => 
        prevThreats.map(threat => 
          threat.id === threatId 
            ? { 
                ...threat, 
                status: action as any,
                resolvedBy: action === "resolve" ? "System Administrator" : threat.resolvedBy,
                resolvedAt: action === "resolve" ? new Date().toISOString() : threat.resolvedAt
              }
            : threat
        )
      )
      
      // Send action to API
      const response = await fetch('/api/threats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threat_id: threatId,
          action: action,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update threat status')
      }
      
      console.log(`Threat ${threatId} ${action} successfully`)
    } catch (error) {
      console.error('Error updating threat status:', error)
    }
  }

  // Fetch all threat logs from API
  const fetchThreats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/threats')
      if (!response.ok) {
        throw new Error('Failed to fetch threat logs')
      }
      const data = await response.json()
      if (data.success) {
        setThreats(data.threats)
      } else {
        throw new Error(data.error || 'Failed to load threat logs')
      }
    } catch (error) {
      console.error('Error fetching threats:', error)
      setError(error instanceof Error ? error.message : 'Failed to load threat logs')
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount and set up real-time refresh
  useEffect(() => {
    fetchThreats()
    
    // Refresh every 5 seconds for real-time threat monitoring
    const interval = setInterval(fetchThreats, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredThreats = threats.filter((threat) => {
    const matchesSearch =
      threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.stationName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === "all" || threat.severity === filterSeverity
    const matchesStatus = filterStatus === "all" || threat.status === filterStatus
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200"
      case "mitigated":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "monitored":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case "low":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="threats" />

      <div className="lg:ml-64 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-600" />
              Threat Management & Quarantine System
            </h1>
            <p className="text-gray-600 mt-1">Advanced threat detection, quarantine, and security management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/80"
              onClick={fetchThreats}
              disabled={loading}
            >
              <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" className="bg-white/80">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                Live Monitoring
              </span>
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="quarantine" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg w-full sm:w-auto">
            <TabsTrigger value="quarantine" className="text-xs sm:text-sm">
              <Lock className="w-4 h-4 mr-2" />
              Quarantine System
            </TabsTrigger>
            <TabsTrigger value="threats" className="text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              All Threats
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quarantine" className="space-y-6">
            <ThreatQuarantineSystem
              threats={threats}
              onQuarantineAction={handleQuarantineAction}
              onRefresh={fetchThreats}
              isConnected={esp32Connected}
            />
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Threats</p>
                      <p className="text-2xl font-bold text-gray-800">{threats.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">High Severity</p>
                      <p className="text-2xl font-bold text-red-600">
                        {threats.filter((t) => t.severity === "high").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Quarantined</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {threats.filter((t) => t.status === "quarantined").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {threats.filter((t) => t.status === "resolved").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Search and Filter */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search threats by type, station, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">All Severity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="blocked">Blocked</option>
                  <option value="mitigated">Mitigated</option>
                  <option value="monitored">Monitored</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && threats.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading threat logs...</h3>
              <p className="text-gray-600">Fetching all security events from ESP32 devices</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50/80 backdrop-blur-xl border-red-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error loading threat logs</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchThreats} className="bg-red-500 hover:bg-red-600">
                <Activity className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Threats List */}
        {!loading && !error && threats.length > 0 && (
        <div className="space-y-4">
          {filteredThreats.map((threat) => (
            <Card
              key={threat.id}
              className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{getSeverityIcon(threat.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{threat.type}</h3>
                        <Badge className={`${getSeverityColor(threat.severity)} border text-xs`}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(threat.status)} border text-xs`}>
                          {threat.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{threat.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{threat.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {threat.station} - {threat.stationName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Activity className="w-4 h-4" />
                          <span>ML Confidence: {threat.mlConfidence}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <span>Source: {threat.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white/50">
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Action Taken:</strong> {threat.action}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {!loading && !error && filteredThreats.length === 0 && threats.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No threats match your filters</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}

            {!loading && !error && threats.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No threats found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Threat Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">Advanced threat analytics and reporting features will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
