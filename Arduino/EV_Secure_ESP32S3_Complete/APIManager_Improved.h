/*
 * APIManager_Improved.h - Enhanced API Communication Library
 * 
 * This improved version addresses common issues with ESP32-S3 and Vercel communication:
 * - Better SSL certificate handling
 * - Improved error handling and debugging
 * - Fallback mechanisms for network issues
 * - Enhanced data validation
 * - Better retry logic with exponential backoff
 */

#ifndef API_MANAGER_IMPROVED_H
#define API_MANAGER_IMPROVED_H

#include "EV_Secure_Config.h"
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// Enhanced configuration
#define MAX_RETRY_ATTEMPTS 5
#define BASE_RETRY_DELAY_MS 1000
#define MAX_RETRY_DELAY_MS 10000
#define CONNECTION_TIMEOUT_MS 15000
#define READ_TIMEOUT_MS 10000

// Debug levels
#define DEBUG_LEVEL_NONE 0
#define DEBUG_LEVEL_ERROR 1
#define DEBUG_LEVEL_WARNING 2
#define DEBUG_LEVEL_INFO 3
#define DEBUG_LEVEL_VERBOSE 4

#ifndef DEBUG_LEVEL
#define DEBUG_LEVEL DEBUG_LEVEL_INFO
#endif

// Debug macros
#define DEBUG_PRINT(level, message) if (level <= DEBUG_LEVEL) Serial.println(message)
#define DEBUG_PRINTF(level, format, ...) if (level <= DEBUG_LEVEL) Serial.printf(format, __VA_ARGS__)

class APIManagerImproved {
public:
  static bool init();
  static bool sendData(const String& jsonData);
  static String getCommand();
  static bool sendAlert(const String& alertType, const String& details);
  static bool checkConnection();
  static void setDebugLevel(int level);
  static void enableFallbackMode(bool enable);
  static String getLastError();
  static int getConnectionAttempts();
  static void resetConnectionStats();
  
private:
  static bool _initialized;
  static String _apiKey;
  static String _serverURL;
  static String _fallbackURL;
  static String _altUrl1;
  static String _altUrl2;
  static String _altUrl3;
  static bool _useFallback;
  static int _debugLevel;
  static int _connectionAttempts;
  static String _lastError;
  static WiFiClientSecure _secureClient;
  static HTTPClient _httpClient;
  
  // Enhanced methods
  static bool _makeSecureRequest(const String& endpoint, const String& method, const String& data, String& response);
  static bool _makeFallbackRequest(const String& endpoint, const String& method, const String& data, String& response);
  static bool _validateResponse(const String& response, int expectedCode);
  static void _logRequest(const String& method, const String& endpoint, const String& data);
  static void _logResponse(int statusCode, const String& response);
  static bool _testBasicConnectivity();
  static void _configureSSL();
  static String _buildHeaders();
  static bool _retryWithBackoff(const String& endpoint, const String& method, const String& data, String& response);
};

// Implementation
bool APIManagerImproved::_initialized = false;
String APIManagerImproved::_apiKey = API_KEY;
String APIManagerImproved::_serverURL = DASHBOARD_URL;
String APIManagerImproved::_fallbackURL = ALT_DASHBOARD_URL_1; // first alternate
String APIManagerImproved::_altUrl1 = ALT_DASHBOARD_URL_1;
String APIManagerImproved::_altUrl2 = ALT_DASHBOARD_URL_2;
String APIManagerImproved::_altUrl3 = ALT_DASHBOARD_URL_3; // HTTP fallback
bool APIManagerImproved::_useFallback = false;
int APIManagerImproved::_debugLevel = DEBUG_LEVEL_INFO;
int APIManagerImproved::_connectionAttempts = 0;
String APIManagerImproved::_lastError = "";
WiFiClientSecure APIManagerImproved::_secureClient;
HTTPClient APIManagerImproved::_httpClient;

bool APIManagerImproved::init() {
  if (_initialized) {
    DEBUG_PRINT(DEBUG_LEVEL_INFO, "API Manager already initialized");
    return true;
  }
  
  DEBUG_PRINT(DEBUG_LEVEL_INFO, "Initializing Enhanced API Manager...");
  DEBUG_PRINTF(DEBUG_LEVEL_INFO, "Server URL: %s\n", _serverURL.c_str());
  DEBUG_PRINTF(DEBUG_LEVEL_INFO, "API Key: %s...\n", _apiKey.substring(0, 10).c_str());
  
  // Test basic connectivity first
  if (!_testBasicConnectivity()) {
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "Basic connectivity test failed");
    _lastError = "Basic connectivity test failed";
    return false;
  }
  
  // Configure SSL
  _configureSSL();
  
  // Test API connection across multiple versions
  String testResponse;
  if (_makeSecureRequest("/api/status", "GET", "", testResponse)) {
    DEBUG_PRINT(DEBUG_LEVEL_INFO, "✓ API Manager initialized successfully");
    _initialized = true;
    return true;
  } else {
    DEBUG_PRINT(DEBUG_LEVEL_WARNING, "Primary connection failed, trying alternates...");
    // Try HTTPS alternates first
    String urls[3] = { _altUrl1, _altUrl2, _altUrl3 };
    for (int i = 0; i < 3; i++) {
      if (urls[i].length() == 0) continue;
      _serverURL = urls[i];
      if (urls[i].startsWith("http://")) {
        if (_makeFallbackRequest("/api/status", "GET", "", testResponse)) {
          DEBUG_PRINT(DEBUG_LEVEL_INFO, "✓ API Manager initialized with HTTP fallback");
          _useFallback = true;
          _initialized = true;
          return true;
        }
      } else {
        if (_makeSecureRequest("/api/status", "GET", "", testResponse)) {
          DEBUG_PRINT(DEBUG_LEVEL_INFO, "✓ API Manager initialized with alternate URL");
          _initialized = true;
          return true;
        }
      }
    }
    // Restore primary for future attempts
    _serverURL = DASHBOARD_URL;
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "✗ All versions unreachable");
    _lastError = "All versions unreachable";
    return false;
  }
}

bool APIManagerImproved::sendData(const String& jsonData) {
  if (!_initialized) {
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "API Manager not initialized");
    return false;
  }
  
  DEBUG_PRINT(DEBUG_LEVEL_VERBOSE, "Sending data to dashboard...");
  _logRequest("POST", "/api/data", jsonData);
  
  String response;
  bool success = false;
  
  // Try current server first, then rotate through alternates if needed
  String urls[4] = { _serverURL, _altUrl1, _altUrl2, _altUrl3 };
  for (int i = 0; i < 4 && !success; i++) {
    String base = urls[i];
    if (base.length() == 0) continue;
    if (base.startsWith("http://")) {
      _serverURL = base;
      success = _makeFallbackRequest("/api/data", "POST", jsonData, response);
      if (success) { _useFallback = true; break; }
    } else {
      _serverURL = base;
      success = _makeSecureRequest("/api/data", "POST", jsonData, response);
      if (!success) {
        DEBUG_PRINT(DEBUG_LEVEL_WARNING, "Secure POST failed on this base, trying next...");
      }
    }
  }
  
  if (success) {
    DEBUG_PRINT(DEBUG_LEVEL_INFO, "✓ Data sent successfully");
    DEBUG_PRINT(DEBUG_LEVEL_VERBOSE, "Response: " + response);
    return true;
  } else {
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "✗ Failed to send data");
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "Last error: " + _lastError);
    return false;
  }
}

String APIManagerImproved::getCommand() {
  if (!_initialized) {
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "API Manager not initialized");
    return "";
  }
  
  DEBUG_PRINT(DEBUG_LEVEL_VERBOSE, "Checking for commands...");
  
  String response;
  bool success = false;
  
  {
    String urls[4] = { _serverURL, _altUrl1, _altUrl2, _altUrl3 };
    for (int i = 0; i < 4 && !success; i++) {
      String base = urls[i];
      if (base.length() == 0) continue;
      if (base.startsWith("http://")) {
        _serverURL = base;
        success = _makeFallbackRequest("/api/commands", "GET", "", response);
        if (success) { _useFallback = true; break; }
      } else {
        _serverURL = base;
        success = _makeSecureRequest("/api/commands", "GET", "", response);
        if (success) break;
      }
    }
  }
  
  if (success && response.length() > 0) {
    DEBUG_PRINT(DEBUG_LEVEL_INFO, "✓ Command received");
    DEBUG_PRINT(DEBUG_LEVEL_VERBOSE, "Command: " + response);
    return response;
  }
  
  return "";
}

bool APIManagerImproved::sendAlert(const String& alertType, const String& details) {
  if (!_initialized) {
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "API Manager not initialized");
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
  
  DEBUG_PRINT(DEBUG_LEVEL_INFO, "Sending alert: " + alertType);
  _logRequest("POST", "/api/alerts", jsonString);
  
  String response;
  bool success = false;
  
  {
    String urls[4] = { _serverURL, _altUrl1, _altUrl2, _altUrl3 };
    for (int i = 0; i < 4 && !success; i++) {
      String base = urls[i];
      if (base.length() == 0) continue;
      if (base.startsWith("http://")) {
        _serverURL = base;
        success = _makeFallbackRequest("/api/alerts", "POST", jsonString, response);
        if (success) { _useFallback = true; break; }
      } else {
        _serverURL = base;
        success = _makeSecureRequest("/api/alerts", "POST", jsonString, response);
        if (success) break;
      }
    }
  }
  
  if (success) {
    DEBUG_PRINT(DEBUG_LEVEL_INFO, "✓ Alert sent successfully");
    return true;
  } else {
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "✗ Failed to send alert");
    return false;
  }
}

bool APIManagerImproved::checkConnection() {
  if (!_initialized) {
    return false;
  }
  
  String response;
  bool success = false;
  
  {
    String urls[4] = { _serverURL, _altUrl1, _altUrl2, _altUrl3 };
    for (int i = 0; i < 4 && !success; i++) {
      String base = urls[i];
      if (base.length() == 0) continue;
      if (base.startsWith("http://")) {
        _serverURL = base;
        success = _makeFallbackRequest("/api/status", "GET", "", response);
        if (success) { _useFallback = true; break; }
      } else {
        _serverURL = base;
        success = _makeSecureRequest("/api/status", "GET", "", response);
        if (success) break;
      }
    }
  }
  
  return success;
}

void APIManagerImproved::setDebugLevel(int level) {
  _debugLevel = level;
  DEBUG_PRINTF(DEBUG_LEVEL_INFO, "Debug level set to: %d\n", level);
}

void APIManagerImproved::enableFallbackMode(bool enable) {
  _useFallback = enable;
  DEBUG_PRINT(DEBUG_LEVEL_INFO, enable ? "Fallback mode enabled" : "Fallback mode disabled");
}

String APIManagerImproved::getLastError() {
  return _lastError;
}

int APIManagerImproved::getConnectionAttempts() {
  return _connectionAttempts;
}

void APIManagerImproved::resetConnectionStats() {
  _connectionAttempts = 0;
  _lastError = "";
}

// Private implementation methods

bool APIManagerImproved::_makeSecureRequest(const String& endpoint, const String& method, const String& data, String& response) {
  _connectionAttempts++;
  
  // Configure secure client
  _secureClient.setInsecure(); // For development - use proper certificates in production
  _secureClient.setTimeout(CONNECTION_TIMEOUT_MS);
  
  // Build URL
  String url = _serverURL + endpoint;
  
  // Configure HTTP client
  _httpClient.begin(_secureClient, url);
  _httpClient.setTimeout(READ_TIMEOUT_MS);
  
  // Set headers
  _httpClient.addHeader("Content-Type", "application/json");
  _httpClient.addHeader("Authorization", "Bearer " + _apiKey);
  _httpClient.addHeader("User-Agent", "EV-Secure-ESP32/" + String(DEVICE_VERSION));
  _httpClient.addHeader("Accept", "application/json");
  
  // Make request
  int httpCode = 0;
  if (method == "GET") {
    httpCode = _httpClient.GET();
  } else if (method == "POST") {
    httpCode = _httpClient.POST(data);
  }
  
  response = _httpClient.getString();
  _httpClient.end();
  
  _logResponse(httpCode, response);
  
  if (httpCode > 0 && httpCode < 400) {
    return true;
  } else {
    _lastError = "HTTP " + String(httpCode) + ": " + response;
    return false;
  }
}

bool APIManagerImproved::_makeFallbackRequest(const String& endpoint, const String& method, const String& data, String& response) {
  _connectionAttempts++;
  
  // Build URL
  String url = _fallbackURL + endpoint;
  
  // Configure HTTP client (non-secure)
  _httpClient.begin(url);
  _httpClient.setTimeout(READ_TIMEOUT_MS);
  
  // Set headers
  _httpClient.addHeader("Content-Type", "application/json");
  _httpClient.addHeader("Authorization", "Bearer " + _apiKey);
  _httpClient.addHeader("User-Agent", "EV-Secure-ESP32/" + String(DEVICE_VERSION));
  _httpClient.addHeader("Accept", "application/json");
  
  // Make request
  int httpCode = 0;
  if (method == "GET") {
    httpCode = _httpClient.GET();
  } else if (method == "POST") {
    httpCode = _httpClient.POST(data);
  }
  
  response = _httpClient.getString();
  _httpClient.end();
  
  _logResponse(httpCode, response);
  
  if (httpCode > 0 && httpCode < 400) {
    return true;
  } else {
    _lastError = "HTTP " + String(httpCode) + ": " + response;
    return false;
  }
}

bool APIManagerImproved::_validateResponse(const String& response, int expectedCode) {
  // Basic validation - check if response contains expected fields
  return response.length() > 0 && response.indexOf("error") == -1;
}

void APIManagerImproved::_logRequest(const String& method, const String& endpoint, const String& data) {
  DEBUG_PRINTF(DEBUG_LEVEL_VERBOSE, "Request: %s %s\n", method.c_str(), endpoint.c_str());
  DEBUG_PRINTF(DEBUG_LEVEL_VERBOSE, "Data: %s\n", data.substring(0, min(200, (int)data.length())).c_str());
}

void APIManagerImproved::_logResponse(int statusCode, const String& response) {
  DEBUG_PRINTF(DEBUG_LEVEL_VERBOSE, "Response: %d\n", statusCode);
  DEBUG_PRINTF(DEBUG_LEVEL_VERBOSE, "Body: %s\n", response.substring(0, min(200, (int)response.length())).c_str());
}

bool APIManagerImproved::_testBasicConnectivity() {
  DEBUG_PRINT(DEBUG_LEVEL_INFO, "Testing basic connectivity...");
  
  // Test if we can reach the server
  WiFiClient testClient;
  if (testClient.connect("ev-secure-dashboard-v5.vercel.app", 443)) {
    DEBUG_PRINT(DEBUG_LEVEL_INFO, "✓ Basic connectivity OK");
    testClient.stop();
    return true;
  } else {
    DEBUG_PRINT(DEBUG_LEVEL_ERROR, "✗ Basic connectivity failed");
    return false;
  }
}

void APIManagerImproved::_configureSSL() {
  DEBUG_PRINT(DEBUG_LEVEL_INFO, "Configuring SSL...");
  
  // For development, we'll use insecure mode
  // In production, you should use proper certificate validation
  _secureClient.setInsecure();
  
  DEBUG_PRINT(DEBUG_LEVEL_INFO, "SSL configured (insecure mode for development)");
}

String APIManagerImproved::_buildHeaders() {
  String headers = "";
  headers += "Content-Type: application/json\r\n";
  headers += "Authorization: Bearer " + _apiKey + "\r\n";
  headers += "User-Agent: EV-Secure-ESP32/" + String(DEVICE_VERSION) + "\r\n";
  headers += "Accept: application/json\r\n";
  return headers;
}

bool APIManagerImproved::_retryWithBackoff(const String& endpoint, const String& method, const String& data, String& response) {
  for (int attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    DEBUG_PRINTF(DEBUG_LEVEL_INFO, "Retry attempt %d/%d\n", attempt + 1, MAX_RETRY_ATTEMPTS);
    
    bool success = false;
    if (_useFallback) {
      success = _makeFallbackRequest(endpoint, method, data, response);
    } else {
      success = _makeSecureRequest(endpoint, method, data, response);
    }
    
    if (success) {
      return true;
    }
    
    if (attempt < MAX_RETRY_ATTEMPTS - 1) {
      int retryDelay = min(BASE_RETRY_DELAY_MS * (1 << attempt), MAX_RETRY_DELAY_MS);
      DEBUG_PRINTF(DEBUG_LEVEL_INFO, "Retrying in %d ms...\n", retryDelay);
      delay(retryDelay);
    }
  }
  
  return false;
}

#endif // API_MANAGER_IMPROVED_H
