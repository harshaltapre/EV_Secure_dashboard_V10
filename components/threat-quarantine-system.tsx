"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  Activity,
  Zap,
  Thermometer,
  Gauge,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Trash2,
  Settings,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ThreatData {
  id: string
  timestamp: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  status: "quarantined" | "monitoring" | "resolved" | "false_positive"
  stationId: string
  stationName: string
  description: string
  mlConfidence: number
  sensorData: {
    voltage: number
    current: number
    temperature: number
    power: number
    frequency: number
  }
  attackType: string
  quarantineReason: string
  autoQuarantine: boolean
  manualOverride: boolean
  resolvedBy?: string
  resolvedAt?: string
}

interface QuarantineSystemProps {
  threats: ThreatData[]
  onQuarantineAction: (threatId: string, action: string) => void
  onRefresh: () => void
  isConnected: boolean
}

export function ThreatQuarantineSystem({ threats, onQuarantineAction, onRefresh, isConnected }: QuarantineSystemProps) {
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")

  // Filter threats based on status and severity
  const filteredThreats = threats.filter(threat => {
    const statusMatch = filterStatus === "all" || threat.status === filterStatus
    const severityMatch = filterSeverity === "all" || threat.severity === filterSeverity
    return statusMatch && severityMatch
  })

  // Get quarantine statistics
  const quarantineStats = {
    total: threats.length,
    quarantined: threats.filter(t => t.status === "quarantined").length,
    monitoring: threats.filter(t => t.status === "monitoring").length,
    resolved: threats.filter(t => t.status === "resolved").length,
    critical: threats.filter(t => t.severity === "critical").length,
    high: threats.filter(t => t.severity === "high").length,
    medium: threats.filter(t => t.severity === "medium").length,
    low: threats.filter(t => t.severity === "low").length,
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white"
      case "high": return "bg-orange-500 text-white"
      case "medium": return "bg-yellow-500 text-black"
      case "low": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "quarantined": return "bg-red-100 text-red-800 border-red-200"
      case "monitoring": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved": return "bg-green-100 text-green-800 border-green-200"
      case "false_positive": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "quarantined": return <Lock className="w-4 h-4" />
      case "monitoring": return <Eye className="w-4 h-4" />
      case "resolved": return <CheckCircle className="w-4 h-4" />
      case "false_positive": return <XCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const handleQuarantineAction = (threatId: string, action: string) => {
    onQuarantineAction(threatId, action)
    setShowDetails(false)
    setSelectedThreat(null)
  }

  if (!isConnected) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Threat Quarantine System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ESP32-S3 Not Connected</h3>
            <p className="text-gray-600 mb-4">
              Connect your ESP32-S3 charging stations to enable real-time threat detection and quarantine system.
            </p>
            <Button className="bg-gradient-to-r from-green-500 to-purple-500 text-white">
              Configure API Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quarantine Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quarantined</p>
                <p className="text-2xl font-bold text-red-600">{quarantineStats.quarantined}</p>
              </div>
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-red-600 mt-2">Active threats blocked</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monitoring</p>
                <p className="text-2xl font-bold text-yellow-600">{quarantineStats.monitoring}</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xs text-yellow-600 mt-2">Under surveillance</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{quarantineStats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">Threats cleared</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{quarantineStats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-red-600 mt-2">High priority threats</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="quarantined">Quarantined</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="bg-white/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                onClick={() => {/* Export functionality */}}
                variant="outline"
                size="sm"
                className="bg-white/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat List */}
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Active Threats & Quarantine Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredThreats.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Threats Detected</h3>
              <p className="text-gray-600">All charging stations are operating normally.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(threat.status)}>
                          {getStatusIcon(threat.status)}
                          <span className="ml-1">{threat.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(threat.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {threat.type} - {threat.stationName}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {threat.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {threat.sensorData.voltage}V
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {threat.sensorData.current}A
                        </span>
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-4 h-4" />
                          {threat.sensorData.temperature}°C
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-4 h-4" />
                          {threat.mlConfidence}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedThreat(threat)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-blue-600" />
                              Threat Details - {threat.type}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Station</label>
                                <p className="text-sm text-gray-900">{threat.stationName} ({threat.stationId})</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Attack Type</label>
                                <p className="text-sm text-gray-900">{threat.attackType}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Severity</label>
                                <Badge className={getSeverityColor(threat.severity)}>
                                  {threat.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <Badge variant="outline" className={getStatusColor(threat.status)}>
                                  {getStatusIcon(threat.status)}
                                  <span className="ml-1">{threat.status.replace('_', ' ')}</span>
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700">Description</label>
                              <p className="text-sm text-gray-900 mt-1">{threat.description}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700">Quarantine Reason</label>
                              <p className="text-sm text-gray-900 mt-1">{threat.quarantineReason}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700">Sensor Data</label>
                              <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm">Voltage: {threat.sensorData.voltage}V</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-green-500" />
                                  <span className="text-sm">Current: {threat.sensorData.current}A</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Thermometer className="w-4 h-4 text-red-500" />
                                  <span className="text-sm">Temperature: {threat.sensorData.temperature}°C</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Gauge className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm">Power: {threat.sensorData.power}W</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700">ML Confidence</label>
                              <div className="mt-1">
                                <Progress value={threat.mlConfidence} className="h-2" />
                                <p className="text-xs text-gray-500 mt-1">{threat.mlConfidence}% confidence</p>
                              </div>
                            </div>
                            
                            {threat.resolvedBy && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Resolved By</label>
                                <p className="text-sm text-gray-900">{threat.resolvedBy} on {threat.resolvedAt}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 pt-4 border-t">
                            {threat.status === "quarantined" && (
                              <>
                                <Button
                                  onClick={() => handleQuarantineAction(threat.id, "unquarantine")}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Unquarantine
                                </Button>
                                <Button
                                  onClick={() => handleQuarantineAction(threat.id, "resolve")}
                                  variant="outline"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Resolved
                                </Button>
                              </>
                            )}
                            
                            {threat.status === "monitoring" && (
                              <Button
                                onClick={() => handleQuarantineAction(threat.id, "quarantine")}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Quarantine
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => handleQuarantineAction(threat.id, "false_positive")}
                              variant="outline"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Mark False Positive
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
