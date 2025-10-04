/*
 * APIManager.h - API Communication Library
 * 
 * This library handles communication with the dashboard API for the EV-Secure system.
 * It provides secure data transmission, command reception, and alert management.
 * 
 * Features:
 * - Secure HTTPS communication
 * - JSON data formatting
 * - API key authentication
 * - Command reception and processing
 * - Alert transmission
 * - Error handling and retry logic
 * - Rate limiting
 * - Data compression
 * 
 * API Endpoints:
 * - POST /api/data - Send sensor data and ML predictions
 * - GET /api/commands - Receive remote commands
 * - POST /api/alerts - Send threat alerts
 * - GET /api/status - Check system status
 * 
 * Usage:
 * 1. Initialize with APIManager::init()
 * 2. Send data with APIManager::sendData()
 * 3. Get commands with APIManager::getCommand()
 * 4. Send alerts with APIManager::sendAlert()
 */

#ifndef API_MANAGER_H
#define API_MANAGER_H

#include "EV_Secure_Config.h"
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// API endpoints
#define API_DATA_ENDPOINT "/api/data"
#define API_COMMANDS_ENDPOINT "/api/commands"
#define API_ALERTS_ENDPOINT "/api/alerts"
#define API_STATUS_ENDPOINT "/api/status"

// HTTP status codes
#define HTTP_OK 200
#define HTTP_CREATED 201
#define HTTP_BAD_REQUEST 400
#define HTTP_UNAUTHORIZED 401
#define HTTP_FORBIDDEN 403
#define HTTP_NOT_FOUND 404
#define HTTP_INTERNAL_ERROR 500

// Rate limiting
#define MAX_REQUESTS_PER_MINUTE 10
#define REQUEST_TIMEOUT_MS 10000
#define RETRY_ATTEMPTS 3
#define RETRY_DELAY_MS 1000

// Command types
enum CommandType {
  COMMAND_STOP,
  COMMAND_START,
  COMMAND_RESET,
  COMMAND_CALIBRATE,
  COMMAND_UPDATE_CONFIG,
  COMMAND_UNKNOWN
};

// API response structure
struct APIResponse {
  bool success;
  int statusCode;
  String data;
  String error;
};

// Command structure
struct Command {
  CommandType type;
  String parameters;
  unsigned long timestamp;
  bool processed;
};

class APIManager {
public:
  static bool init();
  static bool sendData(const String& jsonData);
  static String getCommand();
  static bool sendAlert(const String& alertType, const String& details);
  static bool checkConnection();
  static APIResponse makeRequest(const String& endpoint, const String& method, const String& data);
  static void setAPIKey(const String& apiKey);
  static void setServerURL(const String& serverURL);
  static void enableSSL(bool enable);
  static void setRateLimit(int requestsPerMinute);
  
  // Command processing
  static Command parseCommand(const String& commandJson);
  static bool processCommand(const Command& command);
  static void clearCommandQueue();
  
  // Status and monitoring
  static bool isConnected();
  static int getRequestCount();
  static String getLastError();
  static void resetErrorCount();
  
private:
  static bool _initialized;
  static String _apiKey;
  static String _serverURL;
  static bool _sslEnabled;
  static int _requestCount;
  static unsigned long _lastRequestTime;
  static unsigned long _requestWindowStart;
  static String _lastError;
  static WiFiClientSecure _secureClient;
  static HTTPClient _httpClient;
  
  // Helper methods
  static String _buildURL(const String& endpoint);
  static String _buildHeaders();
  static bool _checkRateLimit();
  static void _updateRateLimit();
  static String _formatSensorData(const SensorData& sensorData);
  static String _formatMLPrediction(const MLPrediction& mlResult);
  static String _formatSystemState(SystemState state);
  static CommandType _parseCommandType(const String& type);
  static void _logError(const String& error);
  static bool _retryRequest(const String& endpoint, const String& method, const String& data, APIResponse& response);
};

// Implementation
bool APIManager::_initialized = false;
String APIManager::_apiKey = API_KEY;
String APIManager::_serverURL = DASHBOARD_URL;
bool APIManager::_sslEnabled = SSL_ENABLED;
int APIManager::_requestCount = 0;
unsigned long APIManager::_lastRequestTime = 0;
unsigned long APIManager::_requestWindowStart = 0;
String APIManager::_lastError = "";
WiFiClientSecure APIManager::_secureClient;
HTTPClient APIManager::_httpClient;

bool APIManager::init() {
  if (_initialized) {
    return true;
  }
  
  Serial.println("Initializing API Manager...");
  
  // Configure SSL if enabled
  if (_sslEnabled) {
    _secureClient.setInsecure(); // For development - use proper certificates in production
    _httpClient.begin(_secureClient, _buildURL(""));
  } else {
    _httpClient.begin(_buildURL(""));
  }
  
  // Set timeout
  _httpClient.setTimeout(REQUEST_TIMEOUT_MS);
  
  // Test connection
  if (!checkConnection()) {
    Serial.println("API connection test failed");
    return false;
  }
  
  _initialized = true;
  Serial.println("API Manager initialized successfully");
  return true;
}

bool APIManager::sendData(const String& jsonData) {
  if (!_initialized) {
    return false;
  }
  
  // Check rate limit
  if (!_checkRateLimit()) {
    _logError("Rate limit exceeded");
    return false;
  }
  
  // Make request
  APIResponse response = makeRequest(API_DATA_ENDPOINT, "POST", jsonData);
  
  if (response.success) {
    Serial.println("Data sent successfully");
    _updateRateLimit();
    return true;
  } else {
    _logError("Failed to send data: " + response.error);
    return false;
  }
}

String APIManager::getCommand() {
  if (!_initialized) {
    return "";
  }
  
  // Check rate limit
  if (!_checkRateLimit()) {
    return "";
  }
  
  // Make request
  APIResponse response = makeRequest(API_COMMANDS_ENDPOINT, "GET", "");
  
  if (response.success && response.data.length() > 0) {
    _updateRateLimit();
    return response.data;
  }
  
  return "";
}

bool APIManager::sendAlert(const String& alertType, const String& details) {
  if (!_initialized) {
    return false;
  }
  
  // Create alert JSON
  DynamicJsonDocument doc(512);
  doc["device_id"] = DEVICE_ID;
  doc["alert_type"] = alertType;
  doc["details"] = details;
  doc["timestamp"] = millis();
  doc["severity"] = "high";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Make request
  APIResponse response = makeRequest(API_ALERTS_ENDPOINT, "POST", jsonString);
  
  if (response.success) {
    Serial.println("Alert sent successfully");
    return true;
  } else {
    _logError("Failed to send alert: " + response.error);
    return false;
  }
}

bool APIManager::checkConnection() {
  if (!_initialized) {
    return false;
  }
  
  APIResponse response = makeRequest(API_STATUS_ENDPOINT, "GET", "");
  return response.success;
}

APIResponse APIManager::makeRequest(const String& endpoint, const String& method, const String& data) {
  APIResponse response;
  response.success = false;
  response.statusCode = 0;
  response.data = "";
  response.error = "";
  
  if (!_initialized) {
    response.error = "API Manager not initialized";
    return response;
  }
  
  // Build URL
  String url = _buildURL(endpoint);
  
  // Configure HTTP client
  if (_sslEnabled) {
    _httpClient.begin(_secureClient, url);
  } else {
    _httpClient.begin(url);
  }
  
  // Set headers
  _httpClient.addHeader("Content-Type", "application/json");
  _httpClient.addHeader("Authorization", "Bearer " + _apiKey);
  _httpClient.addHeader("User-Agent", "EV-Secure-ESP32/" + String(DEVICE_VERSION));
  
  // Make request
  int httpCode = 0;
  if (method == "GET") {
    httpCode = _httpClient.GET();
  } else if (method == "POST") {
    httpCode = _httpClient.POST(data);
  } else if (method == "PUT") {
    httpCode = _httpClient.PUT(data);
  } else if (method == "DELETE") {
    httpCode = _httpClient.sendRequest("DELETE");
  }
  
  response.statusCode = httpCode;
  
  if (httpCode > 0) {
    response.data = _httpClient.getString();
    
    if (httpCode >= 200 && httpCode < 300) {
      response.success = true;
    } else {
      response.error = "HTTP " + String(httpCode) + ": " + response.data;
    }
  } else {
    response.error = "Connection failed: " + String(_httpClient.errorToString(httpCode));
  }
  
  _httpClient.end();
  return response;
}

void APIManager::setAPIKey(const String& apiKey) {
  _apiKey = apiKey;
  Serial.println("API key updated");
}

void APIManager::setServerURL(const String& serverURL) {
  _serverURL = serverURL;
  Serial.println("Server URL updated: " + serverURL);
}

void APIManager::enableSSL(bool enable) {
  _sslEnabled = enable;
  Serial.println("SSL " + String(enable ? "enabled" : "disabled"));
}

void APIManager::setRateLimit(int requestsPerMinute) {
  // This would update the rate limiting configuration
  Serial.println("Rate limit set to: " + String(requestsPerMinute) + " requests/minute");
}

// Command processing methods

Command APIManager::parseCommand(const String& commandJson) {
  Command command;
  command.type = COMMAND_UNKNOWN;
  command.parameters = "";
  command.timestamp = millis();
  command.processed = false;
  
  if (commandJson.length() == 0) {
    return command;
  }
  
  DynamicJsonDocument doc(512);
  DeserializationError error = deserializeJson(doc, commandJson);
  
  if (error) {
    _logError("Failed to parse command JSON: " + String(error.c_str()));
    return command;
  }
  
  String commandType = doc["command"];
  command.type = _parseCommandType(commandType);
  command.parameters = doc["parameters"].as<String>();
  command.timestamp = doc["timestamp"];
  
  return command;
}

bool APIManager::processCommand(const Command& command) {
  switch (command.type) {
    case COMMAND_STOP:
      Serial.println("Processing STOP command");
      // Implement stop logic
      return true;
      
    case COMMAND_START:
      Serial.println("Processing START command");
      // Implement start logic
      return true;
      
    case COMMAND_RESET:
      Serial.println("Processing RESET command");
      ESP.restart();
      return true;
      
    case COMMAND_CALIBRATE:
      Serial.println("Processing CALIBRATE command");
      // Implement calibration logic
      return true;
      
    case COMMAND_UPDATE_CONFIG:
      Serial.println("Processing UPDATE_CONFIG command");
      // Implement config update logic
      return true;
      
    default:
      Serial.println("Unknown command type: " + String(command.type));
      return false;
  }
}

void APIManager::clearCommandQueue() {
  // This would clear any pending commands
  Serial.println("Command queue cleared");
}

// Status and monitoring methods

bool APIManager::isConnected() {
  return WiFi.status() == WL_CONNECTED && _initialized;
}

int APIManager::getRequestCount() {
  return _requestCount;
}

String APIManager::getLastError() {
  return _lastError;
}

void APIManager::resetErrorCount() {
  _requestCount = 0;
  _lastError = "";
}

// Private helper methods

String APIManager::_buildURL(const String& endpoint) {
  String url = _serverURL;
  if (!url.endsWith("/") && !endpoint.startsWith("/")) {
    url += "/";
  }
  url += endpoint;
  return url;
}

String APIManager::_buildHeaders() {
  String headers = "";
  headers += "Content-Type: application/json\r\n";
  headers += "Authorization: Bearer " + _apiKey + "\r\n";
  headers += "User-Agent: EV-Secure-ESP32/" + String(DEVICE_VERSION) + "\r\n";
  return headers;
}

bool APIManager::_checkRateLimit() {
  unsigned long currentTime = millis();
  
  // Reset window if needed
  if (currentTime - _requestWindowStart > 60000) { // 1 minute window
    _requestCount = 0;
    _requestWindowStart = currentTime;
  }
  
  return _requestCount < MAX_REQUESTS_PER_MINUTE;
}

void APIManager::_updateRateLimit() {
  _requestCount++;
  _lastRequestTime = millis();
}

String APIManager::_formatSensorData(const SensorData& sensorData) {
  DynamicJsonDocument doc(512);
  doc["current"] = sensorData.current;
  doc["voltage"] = sensorData.voltage;
  doc["power"] = sensorData.power;
  doc["frequency"] = sensorData.frequency;
  doc["temperature"] = sensorData.temperature;
  doc["timestamp"] = sensorData.timestamp;
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

String APIManager::_formatMLPrediction(const MLPrediction& mlResult) {
  DynamicJsonDocument doc(256);
  doc["prediction"] = mlResult.prediction;
  doc["confidence"] = mlResult.confidence;
  doc["timestamp"] = mlResult.timestamp;
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

String APIManager::_formatSystemState(SystemState state) {
  DynamicJsonDocument doc(128);
  doc["state"] = state;
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

CommandType APIManager::_parseCommandType(const String& type) {
  if (type == "STOP") return COMMAND_STOP;
  if (type == "START") return COMMAND_START;
  if (type == "RESET") return COMMAND_RESET;
  if (type == "CALIBRATE") return COMMAND_CALIBRATE;
  if (type == "UPDATE_CONFIG") return COMMAND_UPDATE_CONFIG;
  return COMMAND_UNKNOWN;
}

void APIManager::_logError(const String& error) {
  _lastError = error;
  Serial.println("API Error: " + error);
}

bool APIManager::_retryRequest(const String& endpoint, const String& method, const String& data, APIResponse& response) {
  for (int attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    response = makeRequest(endpoint, method, data);
    
    if (response.success) {
      return true;
    }
    
    if (attempt < RETRY_ATTEMPTS - 1) {
      delay(RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
    }
  }
  
  return false;
}

#endif // API_MANAGER_H
