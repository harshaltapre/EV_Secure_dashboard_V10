"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Code,
  Download,
  Copy,
  Key,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileCode,
  Settings,
} from "lucide-react"
import { SharedNavigation } from "@/components/shared-navigation"

// Type definitions
interface StationConfig {
  name: string
  location: string
}

interface ApiKeyData {
  key: string
  status: "active" | "inactive"
  lastUsed: string | null
}

type StationId = "ST001" | "ST002" | "ST003" | "ST004" | "ST005" | "ST006"
type StationsState = Record<StationId, StationConfig>
type ApiKeysState = Record<string, ApiKeyData>

const stations: StationsState = {
  ST001: { name: "Downtown Plaza", location: "123 Main St, City Center" },
  ST002: { name: "Mall Parking", location: "456 Commerce Ave, Mall Plaza" },
  ST003: { name: "Airport Terminal", location: "789 Airport Rd, Terminal B" },
  ST004: { name: "University Campus", location: "321 University Blvd, Campus North" },
  ST005: { name: "Business Park", location: "555 Corporate Dr, Business Park" },
  ST006: { name: "Residential Complex", location: "888 Home Ave, Residential Complex" },
}

export default function CodeGeneratorPage() {
  const [selectedStation, setSelectedStation] = useState<string>("")
  const [apiKeys, setApiKeys] = useState<ApiKeysState>({})
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Load existing API keys
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const response = await fetch('/api/keys')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.keys) {
            const keysMap: ApiKeysState = {}
            data.keys.forEach((keyData: { stationId: string; fullKey: string; status: "active" | "inactive"; lastUsed: string | null }) => {
              keysMap[keyData.stationId] = {
                key: keyData.fullKey,
                status: keyData.status,
                lastUsed: keyData.lastUsed,
              }
            })
            setApiKeys(keysMap)
          }
        }
      } catch (error) {
        console.error('Error loading API keys:', error)
      }
    }

    loadApiKeys()
  }, [])

  const generateArduinoCode = (stationId: StationId, apiKey: string) => {
    const station = stations[stationId]
    
    return `/*
 * EV-Secure ESP32-S3 Configuration for ${station.name}
 * Station ID: ${stationId}
 * Location: ${station.location}
 * Generated: ${new Date().toLocaleString()}
 * 
 * INSTRUCTIONS:
 * 1. Copy this entire code
 * 2. Open Arduino IDE
 * 3. Open EV_Secure_Config.h file
 * 4. Replace the configuration section with this code
 * 5. Upload to your ESP32-S3 device
 */

#ifndef EV_SECURE_CONFIG_H
#define EV_SECURE_CONFIG_H

#include <WiFi.h>
#include <HTTPClient.h>
#include <SD.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <driver/adc.h>
#include <esp_adc_cal.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>

// ============================================================================
// DEVICE CONFIGURATION - ${station.name}
// ============================================================================
#define DEVICE_ID "${stationId}"
#define DEVICE_NAME "${station.name}"
#define DEVICE_LOCATION "${station.location}"
#define DEVICE_VERSION "1.0.0"
#define FIRMWARE_VERSION "2024.01"

// ============================================================================
// WIFI CONFIGURATION
// ============================================================================
#define WIFI_SSID "YOUR_WIFI_SSID"           // Replace with your WiFi SSID
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"   // Replace with your WiFi password
#define WIFI_TIMEOUT_MS 10000
#define WIFI_MAX_RETRIES 5

// ============================================================================
// DASHBOARD API CONFIGURATION - STATION ${stationId}
// ============================================================================
#define DASHBOARD_URL "http://localhost:3000"  // Change to your dashboard URL
#define API_KEY "${apiKey}"                    // Your unique API key for ${stationId}
#define API_TIMEOUT_MS 10000
#define DATA_TRANSMISSION_INTERVAL 2000  // Send data every 2 seconds
#define COMMAND_CHECK_INTERVAL 1000      // Check for commands every 1 second

// ============================================================================
// HARDWARE PIN CONFIGURATION (ESP32-S3)
// ============================================================================

// Sensor Pins
#define CURRENT_SENSOR_PIN 1      // Current Sensor OUT → GPIO1 (ADC1_CH0)
#define VOLTAGE_SENSOR_PIN 2      // Voltage Sensor S → GPIO2 (ADC1_CH1)
#define TEMPERATURE_SENSOR_PIN 3  // DS18B20 → GPIO3 (OneWire)

// SD Card Pins (SPI)
#define SD_MOSI_PIN 11            // SD Card MOSI → GPIO11
#define SD_MISO_PIN 13            // SD Card MISO → GPIO13
#define SD_SCK_PIN 12             // SD Card CLK → GPIO12
#define SD_CS_PIN 10              // SD Card CS → GPIO10

// TFT Display Pins (SPI)
#define TFT_MOSI_PIN 35           // TFT MOSI → GPIO35
#define TFT_MISO_PIN 37           // TFT MISO → GPIO37
#define TFT_SCK_PIN 36            // TFT SCK → GPIO36
#define TFT_CS_PIN 34             // TFT CS → GPIO34
#define TFT_DC_PIN 14             // TFT SDA (DC) → GPIO14
#define TFT_RST_PIN 15            // TFT RST → GPIO15
#define TFT_BL_PIN 5              // TFT BL (Backlight) → GPIO5

// Control Pins
#define RELAY_CONTROL_PIN 18      // Relay Control → GPIO18
#define STATUS_LED_PIN 2          // Status LED → GPIO2
#define BUZZER_PIN 4              // Alert Buzzer → GPIO4
#define EMERGENCY_STOP_PIN 16     // Emergency Stop Button → GPIO16

// I2C Pins - RTC Module Configuration
#define I2C_SDA_PIN 21            // RTC SDA → GPIO21
#define I2C_SCL_PIN 22            // RTC SCL → GPIO22
#define RTC_I2C_ADDRESS 0x68      // DS3231 RTC I2C Address

// ============================================================================
// SENSOR CALIBRATION CONSTANTS
// ============================================================================

// ACS712 Current Sensor (30A Module)
#define ACS712_SENSITIVITY 66.0   // mV/A for 30A module
#define ACS712_VCC 3.3            // Operating voltage
#define ACS712_OFFSET 1.65        // VCC/2 for bidirectional sensing
#define ACS712_MAX_CURRENT 30.0   // Maximum expected current

// ZMPT101B Voltage Sensor
#define ZMPT101B_SENSITIVITY 0.00488  // ADC resolution (3.3V/4095)
#define ZMPT101B_CALIBRATION 0.00488  // Calibration factor
#define ZMPT101B_MAX_VOLTAGE 250.0    // Maximum expected voltage

// Temperature Sensor (DS18B20)
#define TEMP_SENSOR_RESOLUTION 12

// ============================================================================
// ML MODEL CONFIGURATION
// ============================================================================
#define INPUT_FEATURES 6          // Number of input features
#define MODEL_INPUT_SIZE 6        // Same as INPUT_FEATURES
#define MODEL_OUTPUT_SIZE 1       // Single output (threat probability)
#define MODEL_ARENA_SIZE 32768    // Tensor arena size in bytes
#define THREAT_THRESHOLD 0.7      // Threshold for threat detection
#define CRITICAL_THRESHOLD 0.9    // Threshold for critical threat

// ============================================================================
// SYSTEM THRESHOLDS
// ============================================================================
#define CHARGING_THRESHOLD 0.1    // Minimum current to consider charging
#define VOLTAGE_MIN_THRESHOLD 200.0  // Minimum voltage threshold
#define VOLTAGE_MAX_THRESHOLD 250.0  // Maximum voltage threshold
#define CURRENT_MAX_THRESHOLD 30.0   // Maximum current threshold
#define TEMP_MAX_THRESHOLD 60.0      // Maximum temperature threshold
#define FREQUENCY_NOMINAL 50.0       // Nominal frequency (50Hz EU, 60Hz US)
#define FREQUENCY_TOLERANCE 2.0      // Frequency tolerance

// ============================================================================
// DISPLAY CONFIGURATION
// ============================================================================
#define TFT_WIDTH 128
#define TFT_HEIGHT 160
#define TFT_ROTATION 0
#define DISPLAY_UPDATE_INTERVAL 500  // Update display every 500ms

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================
#define LOG_INTERVAL 5000         // Log to SD every 5 seconds
#define MAX_LOG_FILE_SIZE 1048576 // 1MB max log file size
#define MAX_LOG_FILES 10          // Maximum number of log files
#define LOG_BUFFER_SIZE 1024      // Log buffer size

// ============================================================================
// RELAY/CONTACTOR CONFIGURATION
// ============================================================================
#define RELAY_ACTIVE_LOW true     // Set to true if relay is active low
#define RELAY_DEBOUNCE_MS 100     // Relay debounce time

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================
#define SENSOR_READ_INTERVAL 100  // Read sensors every 100ms
#define ML_INFERENCE_INTERVAL 1000 // Run ML inference every 1 second
#define SYSTEM_CHECK_INTERVAL 5000 // System health check every 5 seconds

// ============================================================================
// ERROR HANDLING
// ============================================================================
#define MAX_ERROR_COUNT 5         // Maximum consecutive errors before restart
#define ERROR_RESET_DELAY 30000   // Delay before reset after max errors

// ============================================================================
// DATA STRUCTURES
// ============================================================================

// Sensor data structure
struct SensorData {
  float current;        // Current in Amperes
  float voltage;        // Voltage in Volts
  float power;          // Power in Watts
  float frequency;      // Frequency in Hz
  float temperature;    // Temperature in Celsius
  unsigned long timestamp;
};

// ML prediction structure
struct MLPrediction {
  float prediction;     // Threat probability (0-1)
  float confidence;     // Model confidence (0-1)
  unsigned long timestamp;
};

// System state enumeration
enum SystemState {
  STATE_IDLE = 0,
  STATE_HANDSHAKE,
  STATE_CHARGING,
  STATE_SUSPICIOUS,
  STATE_LOCKDOWN,
  STATE_ERROR
};

// ============================================================================
// DEBUG CONFIGURATION
// ============================================================================
#define DEBUG_MODE true
#define SERIAL_BAUD_RATE 115200
#define DEBUG_LEVEL 2  // 0=Errors only, 1=Warnings, 2=Info, 3=Debug

// Debug macros
#if DEBUG_MODE
  #define DEBUG_PRINT(x) Serial.print(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
  #define DEBUG_PRINTF(fmt, ...) Serial.printf(fmt, __VA_ARGS__)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
  #define DEBUG_PRINTF(fmt, ...)
#endif

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================
#define SSL_ENABLED false         // Set to true for HTTPS
#define CERT_VERIFICATION false   // Set to true for production
#define API_RATE_LIMIT 10         // Maximum API calls per minute

// ============================================================================
// VERSION INFORMATION
// ============================================================================
#define CONFIG_VERSION "1.0.0"
#define LAST_UPDATED "${new Date().toISOString().split('T')[0]}"

#endif // EV_SECURE_CONFIG_H

/*
 * UPLOAD INSTRUCTIONS:
 * 
 * 1. Copy the above code
 * 2. Open Arduino IDE
 * 3. Open your EV-Secure project folder
 * 4. Open the file: EV_Secure_Config.h
 * 5. Replace ALL content in that file with the code above
 * 6. Update WiFi credentials:
 *    - Replace "YOUR_WIFI_SSID" with your actual WiFi name
 *    - Replace "YOUR_WIFI_PASSWORD" with your actual WiFi password
 * 7. If using HTTPS, change SSL_ENABLED to true
 * 8. Save the file
 * 9. Upload to your ESP32-S3 device
 * 
 * Your station ${stationId} will now communicate with the dashboard!
 */`
  }

  const handleGenerateCode = () => {
    if (!selectedStation) {
      alert("Please select a station first")
      return
    }

    const stationApiKey = apiKeys[selectedStation as StationId]
    if (!stationApiKey || !stationApiKey.key) {
      alert("No API key found for this station. Please generate an API key first.")
      return
    }

    setIsGenerating(true)
    
    // Simulate code generation delay
    setTimeout(() => {
      const code = generateArduinoCode(selectedStation as StationId, stationApiKey.key)
      setGeneratedCode(code)
      setIsGenerating(false)
    }, 1000)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
      alert('Failed to copy code to clipboard')
    }
  }

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `EV_Secure_Config_${selectedStation}.h`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateNewApiKey = async () => {
    if (!selectedStation) {
      alert("Please select a station first")
      return
    }

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stationId: selectedStation }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate API key')
      }

      const data = await response.json()
      
      setApiKeys(prev => ({
        ...prev,
        [selectedStation]: {
          key: data.key,
          status: "active",
          lastUsed: new Date().toISOString(),
        },
      }))

      alert(`New API key generated for ${selectedStation}`)
    } catch (error) {
      console.error('Error generating API key:', error)
      alert('Failed to generate API key. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="code-generator" />

      <div className="lg:ml-64 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Code className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <span className="truncate">Arduino Code Generator</span>
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Generate customized Arduino code for your ESP32-S3 stations
            </p>
          </div>
        </div>

        {/* Station Selection */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Select Station & Generate Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Station</label>
                <Select value={selectedStation} onValueChange={setSelectedStation}>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Choose a station..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stations).map(([id, station]) => (
                      <SelectItem key={id} value={id}>
                        {id} - {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">API Key Status</label>
                <div className="flex items-center gap-2">
                  {selectedStation && apiKeys[selectedStation] ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : selectedStation ? (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      No API Key
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                      Select Station
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {selectedStation && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  {stations[selectedStation as StationId].name} ({selectedStation})
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  📍 {stations[selectedStation as StationId].location}
                </p>
                
                {apiKeys[selectedStation] ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">API Key:</span>
                      <code className="text-xs bg-white/50 px-2 py-1 rounded border">
                        {apiKeys[selectedStation].key.substring(0, 20)}...
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleGenerateCode}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
                      >
                        {isGenerating ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </div>
                        ) : (
                          <>
                            <FileCode className="w-4 h-4 mr-2" />
                            Generate Arduino Code
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={generateNewApiKey}
                        variant="outline"
                        className="bg-white/50"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate API Key
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-orange-700">
                      No API key found for this station. Generate one first.
                    </p>
                    <Button
                      onClick={generateNewApiKey}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Generate API Key
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Code */}
        {generatedCode && (
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-green-600" />
                  Generated Arduino Code for {selectedStation}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    className="bg-white/50"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDownloadCode}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download .h File
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Code Generated Successfully!</h4>
                      <p className="text-sm text-green-700">
                        This code is customized for station <strong>{selectedStation}</strong> with the correct API key.
                        Copy this code and paste it into your <code>EV_Secure_Config.h</code> file in Arduino IDE.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Textarea
                    value={generatedCode}
                    readOnly
                    className="font-mono text-xs bg-gray-900 text-green-400 border-gray-700 min-h-96 max-h-96 overflow-y-auto"
                    placeholder="Generated code will appear here..."
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {selectedStation} Configuration
                    </Badge>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Upload Instructions</h4>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Copy the generated code above</li>
                        <li>Open Arduino IDE</li>
                        <li>Open your EV-Secure project</li>
                        <li>Open the file <code>EV_Secure_Config.h</code></li>
                        <li>Replace ALL content with the copied code</li>
                        <li>Update your WiFi credentials in the code</li>
                        <li>Save and upload to your ESP32-S3 device</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Key Management */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-600" />
              Current API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stations).map(([stationId, station]) => (
                <div
                  key={stationId}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedStation === stationId
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{station.name}</h4>
                    <Badge
                      variant={apiKeys[stationId]?.status === "active" ? "default" : "secondary"}
                      className={
                        apiKeys[stationId]?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {stationId}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{station.location}</p>
                  {apiKeys[stationId] ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">API Key Active</span>
                      </div>
                      <code className="text-xs bg-white/50 px-2 py-1 rounded border block">
                        {apiKeys[stationId].key.substring(0, 25)}...
                      </code>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-700">No API Key</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">How to Use</h4>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Select a station from the dropdown above</li>
                <li>Make sure the station has an active API key (generate one if needed)</li>
                <li>Click "Generate Arduino Code" to create customized code</li>
                <li>Copy the generated code and paste it into your Arduino IDE</li>
                <li>Update WiFi credentials and upload to your ESP32-S3</li>
                <li>Your station will now send data to the dashboard with the correct API key</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}