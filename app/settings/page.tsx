"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Key,
  Shield,
  Bell,
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  FileText,
} from "lucide-react"
import { SharedNavigation } from "@/components/shared-navigation"
import { useAPIKeys } from "@/hooks/use-api-keys"

// Type definitions
interface ApiKeyData {
  key: string
  status: "active" | "inactive" | "expired"
  lastUsed: string | null
  station: string
}

type StationId = "ST001" | "ST002" | "ST003" | "ST004" | "ST005" | "ST006"
type ApiKeysState = Record<StationId, ApiKeyData>
type ShowApiKeysState = Record<string, boolean>

const initialApiKeys: ApiKeysState = {
  ST001: { key: "", status: "inactive", lastUsed: null, station: "Downtown Plaza" },
  ST002: { key: "", status: "inactive", lastUsed: null, station: "Mall Parking" },
  ST003: { key: "", status: "inactive", lastUsed: null, station: "Airport Terminal" },
  ST004: { key: "", status: "inactive", lastUsed: null, station: "University Campus" },
  ST005: { key: "", status: "inactive", lastUsed: null, station: "Business Park" },
  ST006: { key: "", status: "inactive", lastUsed: null, station: "Residential Complex" },
}

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState<ShowApiKeysState>({})
  const [notifications, setNotifications] = useState({
    threats: true,
    maintenance: true,
    reports: false,
    system: true,
  })
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    dataRetention: "90",
    mlSensitivity: "medium",
    updateFrequency: "5",
  })
  
  // Use API keys hook for real-time management
  const {
    apiKeys: apiKeysData,
    stats: apiKeyStats,
    isLoading: apiKeysLoading,
    error: apiKeysError,
    createAPIKey,
    updateAPIKey,
    deleteAPIKey,
    getAPIKeyByStation,
    hasActiveKey,
    refreshAPIKeys
  } = useAPIKeys()

  // Convert API keys data to the format expected by the UI
  const apiKeys = Object.keys(initialApiKeys).reduce((acc, stationId) => {
    const keyData = getAPIKeyByStation(stationId)
    acc[stationId as StationId] = {
      key: keyData?.key || "",
      status: keyData?.status || "inactive",
      lastUsed: keyData?.lastUsed || null,
      station: initialApiKeys[stationId as StationId].station
    }
    return acc
  }, {} as ApiKeysState)

  const generateApiKey = async (stationId: string) => {
    try {
      const stationName = initialApiKeys[stationId as StationId].station
      await createAPIKey(stationId, stationName, ['read', 'write'])
      alert(`API key generated successfully for ${stationId}`)
    } catch (error) {
      console.error('Error generating API key:', error)
      alert('Failed to generate API key. Please try again.')
    }
  }

  const revokeApiKey = async (stationId: StationId) => {
    const keyData = getAPIKeyByStation(stationId)
    if (!keyData) return

    try {
      const response = await fetch('/api/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: keyData.key }),
      })

      if (!response.ok) {
        throw new Error('Failed to revoke API key')
      }

      // Refresh the API keys data
      await refreshAPIKeys()

      alert(`API key revoked successfully for ${stationId}`)
    } catch (error) {
      console.error('Error revoking API key:', error)
      alert('Failed to revoke API key. Please try again.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleShowApiKey = (stationId: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [stationId]: !prev[stationId],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="settings" />

      <div className="lg:ml-64 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0" />
              <span className="truncate">System Settings</span>
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Configure API keys, notifications, and system preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-white/80">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-purple-500 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg w-full sm:w-auto">
            <TabsTrigger value="api-keys" className="text-xs sm:text-sm">
              API Keys
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  ESP32-S3 API Key Management
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Generate and manage API keys for your ESP32-S3 charging stations. Each station requires a unique API
                  key for authentication.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(apiKeys).map(([stationId, config]) => (
                  <div
                    key={stationId}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{config.station}</h4>
                          <Badge
                            variant={config.status === "active" ? "default" : "secondary"}
                            className={
                              config.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {config.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Station ID: {stationId}</p>
                        {config.key && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <Input
                                type={showApiKeys[stationId] ? "text" : "password"}
                                value={showApiKeys[stationId] ? config.key : `${config.key.substring(0, 10)}...`}
                                readOnly
                                className="bg-white/50 text-sm font-mono"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleShowApiKey(stationId)}
                              className="bg-white/50"
                            >
                              {showApiKeys[stationId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(config.key)}
                              className="bg-white/50"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {config.lastUsed && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last used: {new Date(config.lastUsed).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {config.status === "inactive" ? (
                          <Button
                            onClick={() => generateApiKey(stationId)}
                            className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Generate Key
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            onClick={() => revokeApiKey(stationId as StationId)}
                            className="bg-gradient-to-r from-red-500 to-orange-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Important Security Notice</h4>
                      <p className="text-sm text-yellow-700">
                        • Keep your API keys secure and never share them publicly
                        <br />• Each ESP32-S3 station must use its designated API key
                        <br />• Revoke and regenerate keys if compromised
                        <br />• Only stations with valid API keys will display data on the dashboard
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800">Threat Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when ML models detect security threats</p>
                    </div>
                    <Switch
                      checked={notifications.threats}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, threats: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800">Maintenance Alerts</h4>
                      <p className="text-sm text-gray-600">Receive notifications for scheduled maintenance</p>
                    </div>
                    <Switch
                      checked={notifications.maintenance}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, maintenance: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800">Report Generation</h4>
                      <p className="text-sm text-gray-600">Get notified when reports are ready</p>
                    </div>
                    <Switch
                      checked={notifications.reports}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, reports: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800">System Updates</h4>
                      <p className="text-sm text-gray-600">Receive notifications about system updates</p>
                    </div>
                    <Switch
                      checked={notifications.system}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, system: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ml-sensitivity" className="text-sm font-medium text-gray-700">
                      ML Threat Detection Sensitivity
                    </Label>
                    <Select
                      value={systemSettings.mlSensitivity}
                      onValueChange={(value) => setSystemSettings((prev) => ({ ...prev, mlSensitivity: value }))}
                    >
                      <SelectTrigger className="bg-white/50 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Fewer false positives</SelectItem>
                        <SelectItem value="medium">Medium - Balanced detection</SelectItem>
                        <SelectItem value="high">High - Maximum security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data-retention" className="text-sm font-medium text-gray-700">
                      Data Retention Period (days)
                    </Label>
                    <Input
                      id="data-retention"
                      type="number"
                      value={systemSettings.dataRetention}
                      onChange={(e) => setSystemSettings((prev) => ({ ...prev, dataRetention: e.target.value }))}
                      className="bg-white/50 mt-2"
                    />
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Security Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">SSL/TLS encryption enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">API key authentication active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">ML threat detection running</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800">Automatic Backup</h4>
                      <p className="text-sm text-gray-600">Enable automatic daily backups</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, autoBackup: checked }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="update-frequency" className="text-sm font-medium text-gray-700">
                      Data Update Frequency (seconds)
                    </Label>
                    <Input
                      id="update-frequency"
                      type="number"
                      value={systemSettings.updateFrequency}
                      onChange={(e) => setSystemSettings((prev) => ({ ...prev, updateFrequency: e.target.value }))}
                      className="bg-white/50 mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">How often to refresh data from ESP32-S3 stations</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">System Health</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">CPU Usage</p>
                        <p className="text-lg font-bold text-green-700">23%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Memory Usage</p>
                        <p className="text-lg font-bold text-green-700">45%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Storage</p>
                        <p className="text-lg font-bold text-green-700">67%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="text-lg font-bold text-green-700">99.8%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
