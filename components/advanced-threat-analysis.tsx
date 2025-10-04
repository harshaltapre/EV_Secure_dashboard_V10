"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertTriangle,
  Activity,
  Zap,
  Thermometer,
  Gauge,
  TrendingUp,
  TrendingDown,
  Eye,
  Brain,
  Cpu,
  Wifi,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Radar,
  Target,
  Flame,
  Droplets,
  Wind,
  Lightbulb,
  Battery,
  Power,
  Signal,
  WifiOff,
  WifiIcon,
} from "lucide-react"

// Advanced threat analysis interfaces
interface PowerSignatureData {
  fundamental_frequency: number
  harmonics: number[]
  total_harmonic_distortion: number
  power_factor: number
  crest_factor: number
  rms_voltage: number
  rms_current: number
  active_power: number
  reactive_power: number
  apparent_power: number
}

interface TemporalPatternData {
  charging_efficiency: number
  session_duration: number
  power_ramp_rate: number
  temperature_rise_rate: number
  frequency_stability: number
  anomalous_timing: boolean
  irregular_pattern: boolean
}

interface SensorFusionData {
  fused_threat_score: number
  sensor_consistency: number
  data_integrity: number
  sensor_tampering_detected: boolean
  confidence_level: number
}

interface AttackAnalysis {
  attack_type: string
  severity: number
  confidence: number
  description: string
  timestamp: string
  station_id: string
  mitigation_status: string
}

interface ThreatVisualization {
  powerSignatureGraph: ChartData
  temporalPatternChart: ChartData
  sensorFusionHeatmap: HeatmapData
  attackVectorDiagram: NetworkDiagram
  riskHeatmap: GeographicRiskData
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    tension?: number
  }[]
}

interface HeatmapData {
  data: number[][]
  labels: string[]
  colors: string[]
}

interface NetworkDiagram {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

interface NetworkNode {
  id: string
  label: string
  type: string
  status: string
  position: { x: number; y: number }
}

interface NetworkEdge {
  source: string
  target: string
  type: string
  status: string
}

interface GeographicRiskData {
  stations: StationRisk[]
  riskLevels: string[]
  colors: string[]
}

interface StationRisk {
  id: string
  name: string
  position: { lat: number; lng: number }
  riskLevel: number
  threats: string[]
  lastUpdate: string
}

// Sample data for demonstration
const samplePowerSignature: PowerSignatureData = {
  fundamental_frequency: 50.0,
  harmonics: [0.1, 0.05, 0.03, 0.02, 0.01, 0.005, 0.002],
  total_harmonic_distortion: 12.5,
  power_factor: 0.95,
  crest_factor: 1.4,
  rms_voltage: 230.0,
  rms_current: 15.5,
  active_power: 3565.0,
  reactive_power: 1200.0,
  apparent_power: 3750.0
}

const sampleTemporalPattern: TemporalPatternData = {
  charging_efficiency: 0.92,
  session_duration: 3600, // 1 hour
  power_ramp_rate: 2.5,
  temperature_rise_rate: 0.1,
  frequency_stability: 0.98,
  anomalous_timing: false,
  irregular_pattern: false
}

const sampleSensorFusion: SensorFusionData = {
  fused_threat_score: 0.15,
  sensor_consistency: 0.95,
  data_integrity: 0.98,
  sensor_tampering_detected: false,
  confidence_level: 0.96
}

const sampleAttacks: AttackAnalysis[] = [
  {
    attack_type: "Load Dumping",
    severity: 0.9,
    confidence: 0.85,
    description: "Sudden power spike detected in charging session",
    timestamp: "2024-01-15T10:30:00Z",
    station_id: "ST001",
    mitigation_status: "Blocked"
  },
  {
    attack_type: "Frequency Injection",
    severity: 0.7,
    confidence: 0.92,
    description: "Abnormal frequency deviation detected",
    timestamp: "2024-01-15T09:15:00Z",
    station_id: "ST003",
    mitigation_status: "Investigated"
  },
  {
    attack_type: "Sensor Tampering",
    severity: 0.8,
    confidence: 0.78,
    description: "Invalid sensor readings detected",
    timestamp: "2024-01-15T08:45:00Z",
    station_id: "ST002",
    mitigation_status: "Active"
  }
]

const sampleThreatVisualization: ThreatVisualization = {
  powerSignatureGraph: {
    labels: ["Fundamental", "2nd", "3rd", "4th", "5th", "6th", "7th"],
    datasets: [
      {
        label: "Harmonic Content (%)",
        data: [100, 10, 5, 3, 2, 1, 0.5],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        tension: 0.4
      }
    ]
  },
  temporalPatternChart: {
    labels: ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00"],
    datasets: [
      {
        label: "Power (kW)",
        data: [0, 2.5, 3.5, 3.2, 3.8, 3.6, 0],
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderColor: "rgba(34, 197, 94, 1)",
        tension: 0.4
      },
      {
        label: "Efficiency (%)",
        data: [0, 85, 92, 90, 94, 91, 0],
        backgroundColor: "rgba(168, 85, 247, 0.5)",
        borderColor: "rgba(168, 85, 247, 1)",
        tension: 0.4
      }
    ]
  },
  sensorFusionHeatmap: {
    data: [
      [0.1, 0.2, 0.3, 0.4, 0.5],
      [0.2, 0.3, 0.4, 0.5, 0.6],
      [0.3, 0.4, 0.5, 0.6, 0.7],
      [0.4, 0.5, 0.6, 0.7, 0.8],
      [0.5, 0.6, 0.7, 0.8, 0.9]
    ],
    labels: ["Current", "Voltage", "Power", "Frequency", "Temperature"],
    colors: ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"]
  },
  attackVectorDiagram: {
    nodes: [
      { id: "station", label: "Charging Station", type: "station", status: "active", position: { x: 100, y: 100 } },
      { id: "ev", label: "EV Vehicle", type: "vehicle", status: "charging", position: { x: 300, y: 100 } },
      { id: "grid", label: "Power Grid", type: "grid", status: "normal", position: { x: 200, y: 200 } },
      { id: "attacker", label: "Attacker", type: "threat", status: "blocked", position: { x: 200, y: 50 } }
    ],
    edges: [
      { source: "station", target: "ev", type: "power", status: "normal" },
      { source: "grid", target: "station", type: "power", status: "normal" },
      { source: "attacker", target: "station", type: "attack", status: "blocked" }
    ]
  },
  riskHeatmap: {
    stations: [
      { id: "ST001", name: "Station 1", position: { lat: 40.7128, lng: -74.0060 }, riskLevel: 0.2, threats: [], lastUpdate: "2024-01-15T10:30:00Z" },
      { id: "ST002", name: "Station 2", position: { lat: 40.7589, lng: -73.9851 }, riskLevel: 0.8, threats: ["Sensor Tampering"], lastUpdate: "2024-01-15T08:45:00Z" },
      { id: "ST003", name: "Station 3", position: { lat: 40.7505, lng: -73.9934 }, riskLevel: 0.6, threats: ["Frequency Injection"], lastUpdate: "2024-01-15T09:15:00Z" }
    ],
    riskLevels: ["Low", "Medium", "High", "Critical"],
    colors: ["#22c55e", "#eab308", "#f97316", "#ef4444"]
  }
}

export function AdvancedThreatAnalysis() {
  const [activeTab, setActiveTab] = useState("overview")
  const [powerSignature, setPowerSignature] = useState<PowerSignatureData>(samplePowerSignature)
  const [temporalPattern, setTemporalPattern] = useState<TemporalPatternData>(sampleTemporalPattern)
  const [sensorFusion, setSensorFusion] = useState<SensorFusionData>(sampleSensorFusion)
  const [attacks, setAttacks] = useState<AttackAnalysis[]>(sampleAttacks)
  const [visualization, setVisualization] = useState<ThreatVisualization>(sampleThreatVisualization)

  const getSeverityColor = (severity: number) => {
    if (severity >= 0.8) return "bg-red-500"
    if (severity >= 0.6) return "bg-orange-500"
    if (severity >= 0.4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getSeverityText = (severity: number) => {
    if (severity >= 0.8) return "Critical"
    if (severity >= 0.6) return "High"
    if (severity >= 0.4) return "Medium"
    return "Low"
  }

  const getMitigationStatusColor = (status: string) => {
    switch (status) {
      case "Blocked": return "bg-green-100 text-green-800"
      case "Investigated": return "bg-yellow-100 text-yellow-800"
      case "Active": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Threat Analysis</h2>
          <p className="text-gray-600 mt-2">
            Research-based threat detection and analysis for EV charging infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Multi-Layer Security</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>ML + Rule-Based</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="power">Power Analysis</TabsTrigger>
          <TabsTrigger value="temporal">Temporal Patterns</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Fusion</TabsTrigger>
          <TabsTrigger value="attacks">Attack Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Threat Score</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(sensorFusion.fused_threat_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <Progress 
                  value={sensorFusion.fused_threat_score * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Data Integrity</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(sensorFusion.data_integrity * 100).toFixed(1)}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <Progress 
                  value={sensorFusion.data_integrity * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Sensor Consistency</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {(sensorFusion.sensor_consistency * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <Progress 
                  value={sensorFusion.sensor_consistency * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Active Threats</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {attacks.filter(a => a.mitigation_status === "Active").length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Threat Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attacks.map((attack, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(attack.severity)}`} />
                        <div>
                          <p className="font-medium">{attack.attack_type}</p>
                          <p className="text-sm text-gray-600">{attack.station_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getMitigationStatusColor(attack.mitigation_status)}>
                          {attack.mitigation_status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {(attack.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Radar className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Power Quality</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={95} className="w-20" />
                      <span className="text-sm text-gray-600">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network Security</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={88} className="w-20" />
                      <span className="text-sm text-gray-600">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sensor Health</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-sm text-gray-600">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ML Model Accuracy</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={96} className="w-20" />
                      <span className="text-sm text-gray-600">96%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="power" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Power Signature Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fundamental Frequency</p>
                      <p className="text-2xl font-bold">{powerSignature.fundamental_frequency} Hz</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Power Factor</p>
                      <p className="text-2xl font-bold">{powerSignature.power_factor.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">THD</p>
                      <p className="text-2xl font-bold">{powerSignature.total_harmonic_distortion.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Crest Factor</p>
                      <p className="text-2xl font-bold">{powerSignature.crest_factor.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Power Components</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Power</span>
                    <span className="font-bold">{powerSignature.active_power.toFixed(1)} W</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reactive Power</span>
                    <span className="font-bold">{powerSignature.reactive_power.toFixed(1)} VAR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Apparent Power</span>
                    <span className="font-bold">{powerSignature.apparent_power.toFixed(1)} VA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">RMS Voltage</span>
                    <span className="font-bold">{powerSignature.rms_voltage.toFixed(1)} V</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">RMS Current</span>
                    <span className="font-bold">{powerSignature.rms_current.toFixed(1)} A</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5" />
                <span>Harmonic Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {powerSignature.harmonics.map((harmonic, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2 mb-2">
                        <p className="text-xs font-medium text-blue-600">
                          {index === 0 ? "Fund" : `${index + 1}th`}
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          {(harmonic * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Power Quality Alert</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    THD is within acceptable limits (&lt; 15%). No immediate action required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Charging Session Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Session Duration</span>
                    <span className="font-bold">
                      {Math.floor(temporalPattern.session_duration / 3600)}h {Math.floor((temporalPattern.session_duration % 3600) / 60)}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Charging Efficiency</span>
                    <span className="font-bold">{(temporalPattern.charging_efficiency * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Power Ramp Rate</span>
                    <span className="font-bold">{temporalPattern.power_ramp_rate.toFixed(2)} kW/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Temperature Rise Rate</span>
                    <span className="font-bold">{temporalPattern.temperature_rise_rate.toFixed(2)} °C/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Frequency Stability</span>
                    <span className="font-bold">{(temporalPattern.frequency_stability * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Pattern Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Anomalous Timing</span>
                    <Badge variant={temporalPattern.anomalous_timing ? "destructive" : "secondary"}>
                      {temporalPattern.anomalous_timing ? "Detected" : "Normal"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Irregular Pattern</span>
                    <Badge variant={temporalPattern.irregular_pattern ? "destructive" : "secondary"}>
                      {temporalPattern.irregular_pattern ? "Detected" : "Normal"}
                    </Badge>
                  </div>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Pattern Status</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Charging pattern appears normal. No temporal anomalies detected.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5" />
                  <span>Sensor Fusion</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {(sensorFusion.fused_threat_score * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Fused Threat Score</p>
                  </div>
                  <Progress value={sensorFusion.fused_threat_score * 100} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Data Integrity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {(sensorFusion.data_integrity * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Data Integrity</p>
                  </div>
                  <Progress value={sensorFusion.data_integrity * 100} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Confidence Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {(sensorFusion.confidence_level * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Confidence Level</p>
                  </div>
                  <Progress value={sensorFusion.confidence_level * 100} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Sensor Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {["Current", "Voltage", "Power", "Frequency", "Temperature"].map((sensor, index) => (
                  <div key={sensor} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2" />
                    <p className="text-sm font-medium">{sensor}</p>
                    <p className="text-xs text-gray-600">Normal</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">All Sensors Healthy</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  No sensor tampering detected. All sensors operating within normal parameters.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attacks" className="space-y-6">
          <div className="space-y-4">
            {attacks.map((attack, index) => (
              <Card key={index} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{attack.attack_type}</h3>
                        <Badge className={getSeverityColor(attack.severity)}>
                          {getSeverityText(attack.severity)}
                        </Badge>
                        <Badge variant="outline" className={getMitigationStatusColor(attack.mitigation_status)}>
                          {attack.mitigation_status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{attack.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(attack.timestamp).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{attack.station_id}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>{(attack.confidence * 100).toFixed(0)}% confidence</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-1" />
                        Mitigate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
