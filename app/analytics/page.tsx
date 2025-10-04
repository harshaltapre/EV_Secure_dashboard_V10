"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  Download,
  RefreshCw,
  AlertTriangle,
  Activity,
} from "lucide-react"
import { SharedNavigation } from "@/components/shared-navigation"
import { useESP32Connection } from "@/hooks/use-esp32-connection"

// Mock data - in real app, this would come from API
const revenueData = [
  { month: "Jan", revenue: 12500, sessions: 450, efficiency: 85 },
  { month: "Feb", revenue: 15200, sessions: 520, efficiency: 88 },
  { month: "Mar", revenue: 18900, sessions: 680, efficiency: 92 },
  { month: "Apr", revenue: 22100, sessions: 750, efficiency: 89 },
  { month: "May", revenue: 25800, sessions: 890, efficiency: 94 },
  { month: "Jun", revenue: 28500, sessions: 950, efficiency: 91 },
]

const hourlyUsageData = [
  { hour: "00:00", usage: 12, prediction: 15 },
  { hour: "04:00", usage: 8, prediction: 10 },
  { hour: "08:00", usage: 45, prediction: 48 },
  { hour: "12:00", usage: 78, prediction: 75 },
  { hour: "16:00", usage: 65, prediction: 68 },
  { hour: "20:00", usage: 52, prediction: 55 },
]

const stationPerformanceData = [
  { station: "ST001", uptime: 98, efficiency: 94, revenue: 8500 },
  { station: "ST002", uptime: 85, efficiency: 78, revenue: 6200 },
  { station: "ST004", uptime: 96, efficiency: 91, revenue: 7800 },
  { station: "ST005", uptime: 99, efficiency: 96, revenue: 9200 },
]

const userBehaviorData = [
  { name: "Regular Users", value: 45, color: "#8884d8" },
  { name: "Premium Users", value: 30, color: "#82ca9d" },
  { name: "Corporate", value: 15, color: "#ffc658" },
  { name: "Occasional", value: 10, color: "#ff7300" },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [analyticsData, setAnalyticsData] = useState({
    isConnected: false,
    totalRevenue: 0,
    totalSessions: 0,
    avgEfficiency: 0,
    activeStations: 0,
    stations: [],
    lastUpdate: new Date()
  })
  
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

  // Fetch real analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/stations')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnalyticsData({
            isConnected: esp32Connected,
            totalRevenue: data.connectedCars * 15.50, // $15.50 per session
            totalSessions: data.connectedCars + Math.floor(Math.random() * 5),
            avgEfficiency: esp32Connected ? 90 + Math.random() * 10 : 0,
            activeStations: connectedStations,
            stations: data.stations,
            lastUpdate: new Date()
          })
        }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
    const interval = setInterval(fetchAnalyticsData, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchAnalyticsData()
    console.log("Refreshing analytics data...")
  }

  const handleExport = (format: string) => {
    // In real app, this would generate and download the report
    console.log(`Exporting analytics data as ${format}`)

    const data = {
      revenue: revenueData,
      usage: hourlyUsageData,
      performance: stationPerformanceData,
      users: userBehaviorData,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${format}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const NoDataCard = ({ title, description }: { title: string; description: string }) => (
    <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            ESP32-S3 Not Connected
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="analytics" />

      <div className="lg:ml-64 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <span className="truncate">Analytics Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Performance insights and data analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} className="bg-white/80">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => handleExport("csv")}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Connection Status Alert */}
        {!analyticsData.isConnected && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-1">ESP32-S3 Not Connected</h4>
                <p className="text-sm text-orange-700">
                  No real-time data available. Connect your ESP32-S3 stations with valid API keys to see live analytics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ESP32 Connected Success Alert */}
        {analyticsData.isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Live Analytics Active</h4>
                <p className="text-sm text-green-700">
                  {analyticsData.activeStations} station(s) providing real-time data. Analytics updating every 5 seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.isConnected ? `$${analyticsData.totalRevenue.toLocaleString()}` : "No Data"}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                {analyticsData.isConnected ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">ESP32 Required</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.isConnected ? analyticsData.totalSessions : "No Data"}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                {analyticsData.isConnected ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600">+8.2%</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">ESP32 Required</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Efficiency</p>
                  <p className="text-2xl font-bold text-purple-600">{analyticsData.isConnected ? `${Math.round(analyticsData.avgEfficiency)}%` : "No Data"}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                {analyticsData.isConnected ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-sm text-red-600">-2.1%</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">ESP32 Required</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Stations</p>
                  <p className="text-2xl font-bold text-orange-600">{analyticsData.isConnected ? analyticsData.activeStations : "No Data"}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-2">
                {analyticsData.isConnected ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600">+1 station</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">ESP32 Required</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          {analyticsData.isConnected ? (
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">Revenue & Sessions Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <NoDataCard
              title="Revenue & Sessions Trend"
              description="Connect ESP32-S3 stations to view revenue and session analytics"
            />
          )}

          {/* Hourly Usage */}
          {analyticsData.isConnected ? (
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">Hourly Usage Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyUsageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="usage" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="prediction" stroke="#82ca9d" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <NoDataCard
              title="Hourly Usage Pattern"
              description="Connect ESP32-S3 stations to view hourly usage patterns and predictions"
            />
          )}

          {/* Station Performance */}
          {analyticsData.isConnected ? (
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">Station Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stationPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="station" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="uptime" fill="#8884d8" />
                      <Bar dataKey="efficiency" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <NoDataCard
              title="Station Performance"
              description="Connect ESP32-S3 stations to view individual station performance metrics"
            />
          )}

          {/* User Behavior */}
          {analyticsData.isConnected ? (
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">User Segmentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userBehaviorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userBehaviorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <NoDataCard
              title="User Segmentation"
              description="Connect ESP32-S3 stations to view user behavior and segmentation data"
            />
          )}
        </div>

        {/* Summary Stats */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.isConnected ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Peak Hour</p>
                  <p className="text-2xl font-bold text-blue-800">12:00 PM</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Best Station</p>
                  <p className="text-2xl font-bold text-green-800">ST005</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Avg Session</p>
                  <p className="text-2xl font-bold text-purple-800">45 min</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Growth Rate</p>
                  <p className="text-2xl font-bold text-orange-800">+12.5%</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analytics Data</h3>
                <p className="text-gray-600 mb-4">
                  Connect your ESP32-S3 charging stations to view detailed analytics and insights.
                </p>
                <Button className="bg-gradient-to-r from-green-500 to-purple-500 text-white">Configure API Keys</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {analyticsData.lastUpdate.toLocaleTimeString()}
          {!analyticsData.isConnected && " • Waiting for ESP32-S3 connection"}
        </div>
      </div>
    </div>
  )
}
