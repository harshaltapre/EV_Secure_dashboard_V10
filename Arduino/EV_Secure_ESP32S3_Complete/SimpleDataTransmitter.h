/*
 * SimpleDataTransmitter.h - Simplified Data Transmission for ESP32-S3
 * 
 * This provides a simplified, reliable method for sending data to the dashboard
 * that matches the exact API schema expected by the Next.js backend.
 */

#ifndef SIMPLE_DATA_TRANSMITTER_H
#define SIMPLE_DATA_TRANSMITTER_H

#include "EV_Secure_Config.h"
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

class SimpleDataTransmitter {
public:
  static bool init();
  static bool sendSensorData(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected);
  static bool sendAlert(const String& alertType, const String& message);
  static bool checkConnection();
  static String getLastError();
  static void setDebugMode(bool enable);
  
private:
  static bool _initialized;
  static bool _debugMode;
  static String _lastError;
  static WiFiClientSecure _secureClient;
  static HTTPClient _httpClient;
  
  static bool _makeRequest(const String& endpoint, const String& method, const String& jsonData);
  static String _createSensorDataJson(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected);
  static void _log(const String& message);
};

// Implementation
bool SimpleDataTransmitter::_initialized = false;
bool SimpleDataTransmitter::_debugMode = true;
String SimpleDataTransmitter::_lastError = "";
WiFiClientSecure SimpleDataTransmitter::_secureClient;
HTTPClient SimpleDataTransmitter::_httpClient;

bool SimpleDataTransmitter::init() {
  if (_initialized) {
    return true;
  }
  
  _log("Initializing Simple Data Transmitter...");
  
  // Configure SSL client
  _secureClient.setInsecure(); // For development
  _secureClient.setTimeout(10000);
  
  // Test connection
  if (checkConnection()) {
    _log("✓ Simple Data Transmitter initialized successfully");
    _initialized = true;
    return true;
  } else {
    _log("✗ Simple Data Transmitter initialization failed");
    return false;
  }
}

bool SimpleDataTransmitter::sendSensorData(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected) {
  if (!_initialized) {
    _lastError = "Not initialized";
    return false;
  }
  
  String jsonData = _createSensorDataJson(sensorData, mlResult, isCharging, threatDetected);
  _log("Sending sensor data...");
  
  if (_debugMode) {
    _log("JSON Data: " + jsonData);
  }
  
  return _makeRequest("/api/data", "POST", jsonData);
}

bool SimpleDataTransmitter::sendAlert(const String& alertType, const String& message) {
  if (!_initialized) {
    _lastError = "Not initialized";
    return false;
  }
  
  DynamicJsonDocument doc(512);
  doc["device_id"] = DEVICE_ID;
  doc["alert_type"] = alertType;
  doc["details"] = message;
  doc["timestamp"] = millis();
  doc["severity"] = "high";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  _log("Sending alert: " + alertType);
  return _makeRequest("/api/alerts", "POST", jsonString);
}

bool SimpleDataTransmitter::checkConnection() {
  return _makeRequest("/api/status", "GET", "");
}

String SimpleDataTransmitter::getLastError() {
  return _lastError;
}

void SimpleDataTransmitter::setDebugMode(bool enable) {
  _debugMode = enable;
  _log("Debug mode " + String(enable ? "enabled" : "disabled"));
}

bool SimpleDataTransmitter::_makeRequest(const String& endpoint, const String& method, const String& jsonData) {
  String url = DASHBOARD_URL + endpoint;
  
  _log("Making request to: " + url);
  _log("API Key: " + String(API_KEY).substring(0, 20) + "...");
  _log("Data: " + jsonData.substring(0, 100) + "...");
  
  // Configure HTTP client with proper SSL
  _secureClient.setInsecure(); // For development - use proper certificates in production
  _secureClient.setTimeout(15000);
  
  _httpClient.begin(_secureClient, url);
  _httpClient.setTimeout(15000);
  
  // Set headers exactly as the working test
  _httpClient.addHeader("Content-Type", "application/json");
  _httpClient.addHeader("Authorization", "Bearer " + String(API_KEY));
  _httpClient.addHeader("User-Agent", "EV-Secure-ESP32/1.0.0");
  _httpClient.addHeader("Accept", "application/json");
  
  // Make request
  int httpCode = 0;
  if (method == "GET") {
    httpCode = _httpClient.GET();
  } else if (method == "POST") {
    httpCode = _httpClient.POST(jsonData);
  }
  
  String response = _httpClient.getString();
  _httpClient.end();
  
  _log("Response code: " + String(httpCode));
  _log("Response: " + response);
  
  if (httpCode == 200) {
    _log("✅ Data transmission successful!");
    return true;
  } else {
    _lastError = "HTTP " + String(httpCode) + ": " + response;
    _log("❌ Data transmission failed: " + _lastError);
    return false;
  }
}

String SimpleDataTransmitter::_createSensorDataJson(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected) {
  DynamicJsonDocument doc(1024);
  
  // Required fields for the API
  doc["device_id"] = DEVICE_ID;
  doc["session_id"] = "SESS_" + String(millis()) + "_" + String(random(1000, 9999));
  doc["timestamp"] = millis();
  doc["state"] = isCharging ? 2 : 0; // 0=idle, 2=charging
  doc["is_charging"] = isCharging;
  doc["threat_detected"] = threatDetected;
  
  // Sensor data (exactly as expected by the API)
  JsonObject sensors = doc.createNestedObject("sensor_data");
  sensors["current"] = sensorData.current;
  sensors["voltage"] = sensorData.voltage;
  sensors["power"] = sensorData.power;
  sensors["frequency"] = sensorData.frequency;
  sensors["temperature"] = sensorData.temperature;
  sensors["timestamp"] = sensorData.timestamp;
  sensors["relay_status"] = true; // Add relay status
  sensors["car_connected"] = isCharging;
  sensors["car_model"] = isCharging ? "EV Vehicle" : "";
  sensors["charging_progress"] = isCharging ? (int)(mlResult.prediction * 100) : 0;
  sensors["battery_level"] = isCharging ? 85 : 0;
  sensors["ml_threat_level"] = threatDetected ? (mlResult.prediction > 0.7 ? "high" : "medium") : "safe";
  
  // System data
  JsonObject system = doc.createNestedObject("system_data");
  system["wifi_rssi"] = WiFi.RSSI();
  system["uptime"] = millis();
  system["free_heap"] = ESP.getFreeHeap();
  system["cpu_freq"] = ESP.getCpuFreqMHz();
  
  // ML prediction data
  JsonObject ml = doc.createNestedObject("ml_prediction");
  ml["standard_prediction"] = mlResult.prediction;
  ml["standard_confidence"] = mlResult.confidence;
  ml["enhanced_prediction"] = mlResult.prediction; // Use same value for simplicity
  ml["enhanced_confidence"] = mlResult.confidence;
  ml["enhanced_uncertainty"] = 1.0 - mlResult.confidence;
  ml["attack_type"] = 0; // 0 = normal
  ml["attack_confidence"] = 0.0;
  ml["is_anomaly"] = threatDetected;
  ml["threat_level"] = threatDetected ? "HIGH" : "NORMAL";
  ml["timestamp"] = mlResult.timestamp;
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

void SimpleDataTransmitter::_log(const String& message) {
  if (_debugMode) {
    Serial.println("[SimpleDataTransmitter] " + message);
  }
}

#endif // SIMPLE_DATA_TRANSMITTER_H
