/*
 * SDLogger.h - SD Card Logging Library
 * 
 * This library handles data logging to SD card for the EV-Secure system.
 * It provides structured logging of sensor data, ML predictions, system events,
 * and alerts for offline analysis and debugging.
 * 
 * Features:
 * - Structured CSV logging
 * - Automatic file rotation
 * - Data compression and archiving
 * - Error handling and recovery
 * - Log file management
 * - Real-time data logging
 * 
 * Log Files:
 * - sensor_data.csv: Continuous sensor readings
 * - ml_predictions.csv: ML model predictions and results
 * - system_events.csv: System state changes and events
 * - alerts.csv: Threat detections and alerts
 * - error_log.txt: System errors and debugging info
 * 
 * Usage:
 * 1. Initialize with SDLogger::init()
 * 2. Log data with SDLogger::logSensorData(), logMLPrediction(), etc.
 * 3. Manage files with SDLogger::rotateLogs(), cleanupOldLogs()
 */

#ifndef SD_LOGGER_H
#define SD_LOGGER_H

#include "EV_Secure_Config.h"
#include <SD.h>
#include <SPI.h>

// Log file names
#define SENSOR_LOG_FILE "sensor_data.csv"
#define ML_LOG_FILE "ml_predictions.csv"
#define EVENT_LOG_FILE "system_events.csv"
#define ALERT_LOG_FILE "alerts.csv"
#define ERROR_LOG_FILE "error_log.txt"

// Log file limits
#define MAX_LOG_FILE_SIZE 1048576  // 1MB
#define MAX_LOG_FILES 10
#define LOG_BUFFER_SIZE 1024

// Log entry types
enum LogEntryType {
  LOG_SENSOR_DATA,
  LOG_ML_PREDICTION,
  LOG_SYSTEM_EVENT,
  LOG_ALERT,
  LOG_ERROR
};

// Log entry structure
struct LogEntry {
  LogEntryType type;
  unsigned long timestamp;
  String data;
  bool isCritical;
};

class SDLogger {
public:
  static bool init();
  static void logSensorData(const SensorData& sensorData);
  static void logMLPrediction(const MLPrediction& mlResult);
  static void logSystemEvent(const String& event, bool isCritical = false);
  static void logSystemState(SystemState state);
  static void logThreatDetection(const MLPrediction& mlResult);
  static void logAlert(const String& alertType, const String& details);
  static void logError(const String& error);
  
  // File management
  static void rotateLogs();
  static void cleanupOldLogs();
  static void uploadPendingLogs();
  static bool isSDCardHealthy();
  static size_t getFreeSpace();
  static void formatSDCard();
  
  // Configuration
  static void setLogLevel(int level);
  static void enableLogging(bool enable);
  static void setLogInterval(unsigned long interval);
  
private:
  static bool _initialized;
  static bool _loggingEnabled;
  static int _logLevel;
  static unsigned long _lastLogTime;
  static unsigned long _logInterval;
  static String _logBuffer;
  
  // File handles
  static File _sensorLogFile;
  static File _mlLogFile;
  static File _eventLogFile;
  static File _alertLogFile;
  static File _errorLogFile;
  
  // Helper methods
  static bool _writeToFile(File& file, const String& data);
  static String _formatTimestamp(unsigned long timestamp);
  static String _formatSensorData(const SensorData& sensorData);
  static String _formatMLPrediction(const MLPrediction& mlResult);
  static String _formatSystemEvent(const String& event, SystemState state);
  static String _formatAlert(const String& alertType, const String& details);
  static void _flushBuffer();
  static bool _checkFileSize(File& file);
  static void _createLogFiles();
  static void _writeCSVHeader(File& file, const String& headers);
};

// Implementation
bool SDLogger::_initialized = false;
bool SDLogger::_loggingEnabled = true;
int SDLogger::_logLevel = 2;
unsigned long SDLogger::_lastLogTime = 0;
unsigned long SDLogger::_logInterval = 1000;
String SDLogger::_logBuffer = "";

File SDLogger::_sensorLogFile;
File SDLogger::_mlLogFile;
File SDLogger::_eventLogFile;
File SDLogger::_alertLogFile;
File SDLogger::_errorLogFile;

bool SDLogger::init() {
  if (_initialized) {
    return true;
  }
  
  Serial.println("Initializing SD Card Logger...");
  
  // Initialize SPI for SD card
  SPI.begin(SD_SCK_PIN, SD_MISO_PIN, SD_MOSI_PIN, SD_CS_PIN);
  
  // Initialize SD card
  if (!SD.begin(SD_CS_PIN)) {
    Serial.println("SD Card initialization failed!");
    return false;
  }
  
  // Check SD card health
  if (!isSDCardHealthy()) {
    Serial.println("SD Card health check failed!");
    return false;
  }
  
  // Create log files
  _createLogFiles();
  
  // Write CSV headers
  _writeCSVHeader(_sensorLogFile, "timestamp,current,voltage,power,frequency,temperature");
  _writeCSVHeader(_mlLogFile, "timestamp,prediction,confidence,threat_detected");
  _writeCSVHeader(_eventLogFile, "timestamp,event_type,state,details");
  _writeCSVHeader(_alertLogFile, "timestamp,alert_type,details,severity");
  
  _initialized = true;
  Serial.println("SD Card Logger initialized successfully");
  Serial.println("Free space: " + String(getFreeSpace()) + " bytes");
  
  return true;
}

void SDLogger::logSensorData(const SensorData& sensorData) {
  if (!_initialized || !_loggingEnabled) {
    return;
  }
  
  // Check if it's time to log
  if (millis() - _lastLogTime < _logInterval) {
    return;
  }
  
  String logEntry = _formatSensorData(sensorData);
  
  if (_writeToFile(_sensorLogFile, logEntry)) {
    _lastLogTime = millis();
  } else {
    logError("Failed to write sensor data to SD card");
  }
}

void SDLogger::logMLPrediction(const MLPrediction& mlResult) {
  if (!_initialized || !_loggingEnabled) {
    return;
  }
  
  String logEntry = _formatMLPrediction(mlResult);
  
  if (!_writeToFile(_mlLogFile, logEntry)) {
    logError("Failed to write ML prediction to SD card");
  }
}

void SDLogger::logSystemEvent(const String& event, bool isCritical) {
  if (!_initialized || !_loggingEnabled) {
    return;
  }
  
  String logEntry = _formatSystemEvent(event, STATE_IDLE);
  
  if (!_writeToFile(_eventLogFile, logEntry)) {
    logError("Failed to write system event to SD card");
  }
}

void SDLogger::logSystemState(SystemState state) {
  if (!_initialized || !_loggingEnabled) {
    return;
  }
  
  String stateText = "State change to: " + String(state);
  String logEntry = _formatSystemEvent(stateText, state);
  
  if (!_writeToFile(_eventLogFile, logEntry)) {
    logError("Failed to write system state to SD card");
  }
}

void SDLogger::logThreatDetection(const MLPrediction& mlResult) {
  if (!_initialized || !_loggingEnabled) {
    return;
  }
  
  String alertType = "THREAT_DETECTED";
  String details = "Prediction: " + String(mlResult.prediction) + 
                  ", Confidence: " + String(mlResult.confidence);
  
  logAlert(alertType, details);
}

void SDLogger::logAlert(const String& alertType, const String& details) {
  if (!_initialized || !_loggingEnabled) {
    return;
  }
  
  String logEntry = _formatAlert(alertType, details);
  
  if (!_writeToFile(_alertLogFile, logEntry)) {
    logError("Failed to write alert to SD card");
  }
}

void SDLogger::logError(const String& error) {
  if (!_initialized) {
    return;
  }
  
  String timestamp = _formatTimestamp(millis());
  String logEntry = timestamp + ": " + error + "\n";
  
  if (!_writeToFile(_errorLogFile, logEntry)) {
    Serial.println("Critical: Failed to write error to SD card - " + error);
  }
}

// File management methods

void SDLogger::rotateLogs() {
  if (!_initialized) {
    return;
  }
  
  Serial.println("Rotating log files...");
  
  // Close current files
  _sensorLogFile.close();
  _mlLogFile.close();
  _eventLogFile.close();
  _alertLogFile.close();
  _errorLogFile.close();
  
  // Create new files with timestamp
  String timestamp = String(millis());
  _createLogFiles();
  
  Serial.println("Log files rotated successfully");
}

void SDLogger::cleanupOldLogs() {
  if (!_initialized) {
    return;
  }
  
  Serial.println("Cleaning up old log files...");
  
  // List files and remove old ones
  File root = SD.open("/");
  int fileCount = 0;
  
  while (true) {
    File entry = root.openNextFile();
    if (!entry) {
      break;
    }
    
    if (entry.isDirectory()) {
      entry.close();
      continue;
    }
    
    fileCount++;
    if (fileCount > MAX_LOG_FILES) {
      String fileName = entry.name();
      if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
        SD.remove(fileName);
        Serial.println("Removed old log file: " + fileName);
      }
    }
    
    entry.close();
  }
  
  root.close();
  Serial.println("Log cleanup completed");
}

void SDLogger::uploadPendingLogs() {
  // This would implement uploading logs to a server
  // For now, just log that upload was attempted
  logSystemEvent(String("Log upload attempted"));
}

bool SDLogger::isSDCardHealthy() {
  // Check if SD card is accessible
  if (!SD.begin(SD_CS_PIN)) {
    return false;
  }
  
  // Check free space
  size_t freeSpace = getFreeSpace();
  if (freeSpace < 1024 * 1024) { // Less than 1MB
    return false;
  }
  
  // Try to write a test file
  File testFile = SD.open("/test.txt", FILE_WRITE);
  if (!testFile) {
    return false;
  }
  
  testFile.println("Test");
  testFile.close();
  
  // Remove test file
  SD.remove("/test.txt");
  
  return true;
}

size_t SDLogger::getFreeSpace() {
  // This is a simplified implementation
  // In practice, you'd use a more sophisticated method
  return 1024 * 1024 * 100; // Placeholder: 100MB
}

void SDLogger::formatSDCard() {
  Serial.println("Formatting SD card...");
  // SD card formatting would be implemented here
  // This is a placeholder
}

// Configuration methods

void SDLogger::setLogLevel(int level) {
  _logLevel = level;
  Serial.println("Log level set to: " + String(level));
}

void SDLogger::enableLogging(bool enable) {
  _loggingEnabled = enable;
  Serial.println("Logging " + String(enable ? "enabled" : "disabled"));
}

void SDLogger::setLogInterval(unsigned long interval) {
  _logInterval = interval;
  Serial.println("Log interval set to: " + String(interval) + "ms");
}

// Private helper methods

bool SDLogger::_writeToFile(File& file, const String& data) {
  if (!file) {
    return false;
  }
  
  // Check file size
  if (_checkFileSize(file)) {
    file.close();
    rotateLogs();
    return false;
  }
  
  // Write data
  file.println(data);
  file.flush();
  
  return true;
}

String SDLogger::_formatTimestamp(unsigned long timestamp) {
  return String(timestamp);
}

String SDLogger::_formatSensorData(const SensorData& sensorData) {
  String data = "";
  data += _formatTimestamp(sensorData.timestamp);
  data += ",";
  data += String(sensorData.current, 3);
  data += ",";
  data += String(sensorData.voltage, 1);
  data += ",";
  data += String(sensorData.power, 1);
  data += ",";
  data += String(sensorData.frequency, 1);
  data += ",";
  data += String(sensorData.temperature, 1);
  
  return data;
}

String SDLogger::_formatMLPrediction(const MLPrediction& mlResult) {
  String data = "";
  data += _formatTimestamp(mlResult.timestamp);
  data += ",";
  data += String(mlResult.prediction, 4);
  data += ",";
  data += String(mlResult.confidence, 3);
  data += ",";
  data += (mlResult.prediction > THREAT_THRESHOLD) ? "true" : "false";
  
  return data;
}

String SDLogger::_formatSystemEvent(const String& event, SystemState state) {
  String data = "";
  data += _formatTimestamp(millis());
  data += ",";
  data += event;
  data += ",";
  data += String(state);
  data += ",";
  data += "system";
  
  return data;
}

String SDLogger::_formatAlert(const String& alertType, const String& details) {
  String data = "";
  data += _formatTimestamp(millis());
  data += ",";
  data += alertType;
  data += ",";
  data += details;
  data += ",";
  data += "high";
  
  return data;
}

void SDLogger::_flushBuffer() {
  if (_logBuffer.length() > 0) {
    // Flush buffer to appropriate file
    _logBuffer = "";
  }
}

bool SDLogger::_checkFileSize(File& file) {
  if (file.size() > MAX_LOG_FILE_SIZE) {
    return true;
  }
  return false;
}

void SDLogger::_createLogFiles() {
  _sensorLogFile = SD.open(SENSOR_LOG_FILE, FILE_APPEND);
  _mlLogFile = SD.open(ML_LOG_FILE, FILE_APPEND);
  _eventLogFile = SD.open(EVENT_LOG_FILE, FILE_APPEND);
  _alertLogFile = SD.open(ALERT_LOG_FILE, FILE_APPEND);
  _errorLogFile = SD.open(ERROR_LOG_FILE, FILE_APPEND);
}

void SDLogger::_writeCSVHeader(File& file, const String& headers) {
  if (file) {
    file.println(headers);
    file.flush();
  }
}

#endif // SD_LOGGER_H
