/*
 * MQTTTransmitter.h - MQTT-based Data Transmission Alternative
 * 
 * This provides an alternative data transmission method using MQTT
 * when HTTP API communication fails. Uses public MQTT brokers for reliability.
 */

#ifndef MQTT_TRANSMITTER_H
#define MQTT_TRANSMITTER_H

#include "EV_Secure_Config.h"
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

class MQTTTransmitter {
public:
  static bool init();
  static bool sendSensorData(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected);
  static bool sendAlert(const String& alertType, const String& message);
  static bool isConnected();
  static void loop(); // Call this in main loop
  static String getLastError();
  static void setDebugMode(bool enable);
  
private:
  static bool _initialized;
  static bool _debugMode;
  static String _lastError;
  static WiFiClientSecure _secureClient;
  static PubSubClient _mqttClient;
  static String _clientId;
  static String _topicPrefix;
  
  static void _callback(char* topic, byte* payload, unsigned int length);
  static bool _reconnect();
  static String _createSensorDataJson(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected);
  static void _log(const String& message);
};

// Implementation
bool MQTTTransmitter::_initialized = false;
bool MQTTTransmitter::_debugMode = true;
String MQTTTransmitter::_lastError = "";
WiFiClientSecure MQTTTransmitter::_secureClient;
PubSubClient MQTTTransmitter::_mqttClient(_secureClient);
String MQTTTransmitter::_clientId = "EV-Secure-" + String(DEVICE_ID) + "-" + String(random(1000, 9999));
String MQTTTransmitter::_topicPrefix = "ev-secure/" + String(DEVICE_ID);

bool MQTTTransmitter::init() {
  if (_initialized) {
    return true;
  }
  
  _log("Initializing MQTT Transmitter...");
  
  // Configure MQTT client
  _mqttClient.setServer("broker.hivemq.com", 8883); // Public MQTT broker with SSL
  _mqttClient.setCallback(_callback);
  
  // Configure SSL
  _secureClient.setInsecure(); // For development
  
  // Connect to MQTT broker
  if (_reconnect()) {
    _log("✓ MQTT Transmitter initialized successfully");
    _initialized = true;
    return true;
  } else {
    _log("✗ MQTT Transmitter initialization failed");
    return false;
  }
}

bool MQTTTransmitter::sendSensorData(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected) {
  if (!_initialized) {
    _lastError = "Not initialized";
    return false;
  }
  
  if (!isConnected()) {
    if (!_reconnect()) {
      _lastError = "MQTT connection failed";
      return false;
    }
  }
  
  String jsonData = _createSensorDataJson(sensorData, mlResult, isCharging, threatDetected);
  String topic = _topicPrefix + "/sensor-data";
  
  _log("Publishing sensor data to: " + topic);
  
  if (_debugMode) {
    _log("JSON Data: " + jsonData);
  }
  
  bool success = _mqttClient.publish(topic.c_str(), jsonData.c_str());
  
  if (success) {
    _log("✓ Sensor data published successfully");
  } else {
    _lastError = "Failed to publish sensor data";
    _log("✗ Failed to publish sensor data");
  }
  
  return success;
}

bool MQTTTransmitter::sendAlert(const String& alertType, const String& message) {
  if (!_initialized) {
    _lastError = "Not initialized";
    return false;
  }
  
  if (!isConnected()) {
    if (!_reconnect()) {
      _lastError = "MQTT connection failed";
      return false;
    }
  }
  
  DynamicJsonDocument doc(512);
  doc["device_id"] = DEVICE_ID;
  doc["alert_type"] = alertType;
  doc["details"] = message;
  doc["timestamp"] = millis();
  doc["severity"] = "high";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  String topic = _topicPrefix + "/alerts";
  
  _log("Publishing alert to: " + topic);
  
  bool success = _mqttClient.publish(topic.c_str(), jsonString.c_str());
  
  if (success) {
    _log("✓ Alert published successfully");
  } else {
    _lastError = "Failed to publish alert";
    _log("✗ Failed to publish alert");
  }
  
  return success;
}

bool MQTTTransmitter::isConnected() {
  return _mqttClient.connected();
}

void MQTTTransmitter::loop() {
  if (_initialized) {
    _mqttClient.loop();
  }
}

String MQTTTransmitter::getLastError() {
  return _lastError;
}

void MQTTTransmitter::setDebugMode(bool enable) {
  _debugMode = enable;
  _log("Debug mode " + String(enable ? "enabled" : "disabled"));
}

void MQTTTransmitter::_callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  _log("Received message on topic: " + String(topic));
  _log("Message: " + message);
  
  // Parse command if it's a command topic
  String topicStr = String(topic);
  if (topicStr.endsWith("/commands")) {
    // Parse and execute command
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      String command = doc["command"];
      _log("Executing command: " + command);
      
      // Execute command based on type
      if (command == "STOP" || command == "EMERGENCY_STOP") {
        // Emergency stop logic
        _log("Emergency stop command received!");
      } else if (command == "START") {
        // Start logic
        _log("Start command received!");
      } else if (command == "RESET") {
        // Reset logic
        _log("Reset command received!");
        ESP.restart();
      }
    }
  }
}

bool MQTTTransmitter::_reconnect() {
  int attempts = 0;
  while (!_mqttClient.connected() && attempts < 5) {
    _log("Attempting MQTT connection...");
    
    if (_mqttClient.connect(_clientId.c_str())) {
      _log("✓ MQTT connected");
      
      // Subscribe to command topic
      String commandTopic = _topicPrefix + "/commands";
      _mqttClient.subscribe(commandTopic.c_str());
      _log("Subscribed to: " + commandTopic);
      
      return true;
    } else {
      _log("✗ MQTT connection failed, retrying in 5 seconds...");
      delay(5000);
      attempts++;
    }
  }
  
  _lastError = "MQTT connection failed after 5 attempts";
  return false;
}

String MQTTTransmitter::_createSensorDataJson(const SensorData& sensorData, const MLPrediction& mlResult, bool isCharging, bool threatDetected) {
  DynamicJsonDocument doc(1024);
  
  // Required fields
  doc["device_id"] = DEVICE_ID;
  doc["session_id"] = "SESS_" + String(millis()) + "_" + String(random(1000, 9999));
  doc["timestamp"] = millis();
  doc["state"] = isCharging ? 2 : 0;
  doc["is_charging"] = isCharging;
  doc["threat_detected"] = threatDetected;
  
  // Sensor data
  JsonObject sensors = doc.createNestedObject("sensor_data");
  sensors["current"] = sensorData.current;
  sensors["voltage"] = sensorData.voltage;
  sensors["power"] = sensorData.power;
  sensors["frequency"] = sensorData.frequency;
  sensors["temperature"] = sensorData.temperature;
  sensors["timestamp"] = sensorData.timestamp;
  
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
  ml["enhanced_prediction"] = mlResult.prediction;
  ml["enhanced_confidence"] = mlResult.confidence;
  ml["enhanced_uncertainty"] = 1.0 - mlResult.confidence;
  ml["attack_type"] = 0;
  ml["attack_confidence"] = 0.0;
  ml["is_anomaly"] = threatDetected;
  ml["threat_level"] = threatDetected ? "HIGH" : "NORMAL";
  ml["timestamp"] = mlResult.timestamp;
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

void MQTTTransmitter::_log(const String& message) {
  if (_debugMode) {
    Serial.println("[MQTTTransmitter] " + message);
  }
}

#endif // MQTT_TRANSMITTER_H
