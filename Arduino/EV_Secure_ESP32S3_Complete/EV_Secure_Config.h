/*
 * EV-Secure ESP32-S3 Configuration File
 * Complete configuration for all system components
 */

#ifndef EV_SECURE_CONFIG_H
#define EV_SECURE_CONFIG_H

#include "credentials.h"  // Include WiFi and API credentials
#include <WiFi.h>
#include <HTTPClient.h>
#include <SD.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>

// ============================================================================
// DEVICE CONFIGURATION
// ============================================================================
// DEVICE_ID is now defined in credentials.h
#define DEVICE_VERSION "1.0.0"
#define FIRMWARE_VERSION "2024.01"

// ============================================================================
// WIFI CONFIGURATION
// ============================================================================
// WIFI_SSID and WIFI_PASSWORD are now defined in credentials.h
#define WIFI_TIMEOUT_MS 10000
#define WIFI_MAX_RETRIES 6

// ============================================================================
// DASHBOARD API CONFIGURATION
// ============================================================================
// DASHBOARD_URL and API_KEY are now defined in credentials.h
#define API_TIMEOUT_MS 10000
#define DATA_TRANSMISSION_INTERVAL 2000  // Send data every 2 seconds
#define COMMAND_CHECK_INTERVAL 1000      // Check for commands every 1 second

// ============================================================================
// HARDWARE PIN CONFIGURATION (ESP32-S3) - Updated for Your Hardware
// ============================================================================

// Sensor Pins - Updated to match Hardware Wiring Guide
#define CURRENT_SENSOR_PIN 1      // Current Sensor OUT → GPIO1 (ADC1_CH0)
#define VOLTAGE_SENSOR_PIN 2      // Voltage Sensor S → GPIO2 (ADC1_CH1)
#define TEMPERATURE_SENSOR_PIN 3  // DS18B20 → GPIO3 (OneWire)

// SD Card Pins (SPI) - Updated to match Hardware Wiring Guide
#define SD_MOSI_PIN 11            // SD Card MOSI → GPIO11
#define SD_MISO_PIN 13            // SD Card MISO → GPIO13
#define SD_SCK_PIN 12             // SD Card CLK → GPIO12
#define SD_CS_PIN 10              // SD Card CS → GPIO10

// TFT Display Pins (SPI) - Updated to match Hardware Wiring Guide
#define TFT_MOSI_PIN 35           // TFT MOSI → GPIO35 (as per wiring guide)
#define TFT_MISO_PIN -1           // TFT MISO not used
#define TFT_SCK_PIN 36            // TFT SCK → GPIO36 (as per wiring guide)
#define TFT_CS_PIN 10             // TFT CS → GPIO10 (shared with SD)
#define TFT_DC_PIN 14             // TFT DC → GPIO14 (as per wiring guide)
#define TFT_RST_PIN 15            // TFT RST → GPIO15 (as per wiring guide)
#define TFT_BL_PIN 5              // TFT BL (Backlight) → GPIO5 (as per wiring guide)

// Control Pins - Updated to match Hardware Wiring Guide (FIXED PIN CONFLICT)
#define RELAY_CONTROL_PIN 18      // Relay Control → GPIO18
#define STATUS_LED_PIN 19         // Status LED → GPIO19 (FIXED: moved from GPIO2 to avoid conflict with voltage sensor)
#define BUZZER_PIN 4              // Alert Buzzer → GPIO4 (as per wiring guide)
#define EMERGENCY_STOP_PIN 16     // Emergency Stop Button → GPIO16 (as per wiring guide)

// I2C Pins - Updated to match Hardware Wiring Guide
#define I2C_SDA_PIN 21            // RTC SDA → GPIO21 (as per wiring guide)
#define I2C_SCL_PIN 47            // RTC SCL → GPIO47 (as per wiring guide)
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
// FUNCTION PROTOTYPES
// ============================================================================

// Sensor functions
float readCurrentSensor();
float readVoltageSensor();
float readTemperatureSensor();
float calculateFrequency();

// Display functions
void updateDisplay();
void showStartupScreen();
void showErrorScreen(String error);

// Logging functions
void logToSD(String message);
void logSensorData();
void logMLPrediction();

// API functions
bool sendToDashboard(String data);
String getDashboardCommand();
bool sendAlert(String alertType, String details);

// Control functions
void controlRelay(bool enable);
void handleEmergencyStop();
void updateSystemState(SystemState newState);

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
#define SSL_ENABLED true
#define CERT_VERIFICATION true
#define API_RATE_LIMIT 10  // Maximum API calls per minute

// ============================================================================
// OCPP CONFIGURATION (Future Enhancement)
// ============================================================================
#define OCPP_ENABLED false
#define OCPP_SERVER_URL "ws://your-ocpp-server.com"
#define OCPP_CHARGE_POINT_ID "EV_SECURE_001"

// ============================================================================
// VERSION INFORMATION
// ============================================================================
#define CONFIG_VERSION "1.0.0"
#define LAST_UPDATED "2024-01-01"

#endif // EV_SECURE_CONFIG_H
