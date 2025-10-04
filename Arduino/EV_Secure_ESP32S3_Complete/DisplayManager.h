/*
 * DisplayManager.h - TFT Display Management Library - CORRECTED
 * 
 * This library handles the 1.8" TFT display for the EV-Secure system.
 * It provides real-time status display, alerts, and system information.
 */

 #ifndef DISPLAY_MANAGER_H
 #define DISPLAY_MANAGER_H
 
 #include "EV_Secure_Config.h"
 #include <Adafruit_GFX.h>
 #include <Adafruit_ST7735.h>
 #include <SPI.h>
 
 // Display colors (ST7735 color format)
 #define COLOR_BLACK    0x0000
 #define COLOR_WHITE    0xFFFF
 #define COLOR_RED      0xF800
 #define COLOR_GREEN    0x07E0
 #define COLOR_BLUE     0x001F
 #define COLOR_YELLOW   0xFFE0
 #define COLOR_CYAN     0x07FF
 #define COLOR_MAGENTA  0xF81F
 #define COLOR_ORANGE   0xFC00
 #define COLOR_PURPLE   0x8000
 #define COLOR_GRAY     0x8410
 #define COLOR_DARK_GRAY 0x4208
 
 // Display layout constants
 #define HEADER_HEIGHT 20
 #define STATUS_BAR_HEIGHT 15
 #define CONTENT_HEIGHT (TFT_HEIGHT - HEADER_HEIGHT - STATUS_BAR_HEIGHT)
 #define SENSOR_ROWS 5
 #define SENSOR_ROW_HEIGHT (CONTENT_HEIGHT / SENSOR_ROWS)
 
 // Display states
 enum DisplayState {
   DISPLAY_STARTUP,
   DISPLAY_NORMAL,
   DISPLAY_ALERT,
   DISPLAY_ERROR,
   DISPLAY_LOCKDOWN
 };
 
 class DisplayManager {
 public:
   static bool init();
   static void updateDisplay(const SensorData& sensorData, 
                            const MLPrediction& mlResult,
                            SystemState systemState,
                            bool isCharging,
                            bool threatDetected,
                            const String& sessionId);
   static void showStartupScreen();
   static void showErrorScreen(const String& error);
   static void showAlertScreen(const String& alert);
   static void showLockdownScreen();
   static void clearScreen();
   static void setBrightness(uint8_t brightness);
   static bool isInitialized();
   
 private:
   static bool _initialized;
   static Adafruit_ST7735* _tft;
   static DisplayState _currentState;
   static unsigned long _lastUpdate;
   static String _lastSessionId;
   static bool _lastChargingState;
   static bool _lastThreatState;
   
   // Display methods
   static void _drawHeader(const String& sessionId, SystemState state);
   static void _drawSensorData(const SensorData& sensorData);
   static void _drawMLPrediction(const MLPrediction& mlResult, bool threatDetected);
   static void _drawStatusBar(bool isCharging, bool threatDetected, bool wifiConnected);
   static void _drawSystemState(SystemState state);
   static void _drawThreatIndicator(bool threatDetected, float confidence);
   
   // Helper methods
   static void _drawText(int x, int y, const String& text, uint16_t color = COLOR_WHITE, uint8_t size = 1);
   static void _drawCenteredText(int y, const String& text, uint16_t color = COLOR_WHITE, uint8_t size = 1);
   static void _drawProgressBar(int x, int y, int width, int height, float progress, uint16_t color);
   static void _drawIcon(int x, int y, int size, uint16_t color, const char* icon);
   static String _formatFloat(float value, int decimals);
   static String _getCurrentTime();
   static String _getStateText(SystemState state);
   static uint16_t _getStateColor(SystemState state);
   static String _createDotString(int count); // FIXED: Helper for loading animation
 };
 
 // Implementation
 bool DisplayManager::_initialized = false;
 Adafruit_ST7735* DisplayManager::_tft = nullptr;
 DisplayState DisplayManager::_currentState = DISPLAY_STARTUP;
 unsigned long DisplayManager::_lastUpdate = 0;
 String DisplayManager::_lastSessionId = "";
 bool DisplayManager::_lastChargingState = false;
 bool DisplayManager::_lastThreatState = false;
 
 bool DisplayManager::init() {
   if (_initialized) {
     return true;
   }
   
   Serial.println("Initializing TFT Display...");
   
   // Initialize SPI for TFT (shared with SD card)
   SPI.begin(TFT_SCK_PIN, TFT_MISO_PIN, TFT_MOSI_PIN, -1); // CS handled separately
   
   // Create TFT object
   _tft = new Adafruit_ST7735(TFT_CS_PIN, TFT_DC_PIN, TFT_RST_PIN);
   
   // Initialize display
   _tft->initR(INITR_BLACKTAB); // Initialize for ST7735S chip, black tab
   _tft->setRotation(TFT_ROTATION);
   _tft->fillScreen(COLOR_BLACK);
   
   // Set text properties
   _tft->setTextColor(COLOR_WHITE);
   _tft->setTextSize(1);
   
   _initialized = true;
   Serial.println("TFT Display initialized successfully");
   return true;
 }
 
 void DisplayManager::updateDisplay(const SensorData& sensorData, 
                                   const MLPrediction& mlResult,
                                   SystemState systemState,
                                   bool isCharging,
                                   bool threatDetected,
                                   const String& sessionId) {
   if (!_initialized) {
     return;
   }
   
   // Check if update is needed
   unsigned long currentTime = millis();
   if (currentTime - _lastUpdate < DISPLAY_UPDATE_INTERVAL) {
     return;
   }
   
   // Clear screen if state changed significantly
   bool needsFullRedraw = (
     sessionId != _lastSessionId ||
     isCharging != _lastChargingState ||
     threatDetected != _lastThreatState ||
     systemState == STATE_LOCKDOWN ||
     systemState == STATE_ERROR
   );
   
   if (needsFullRedraw) {
     clearScreen();
   }
   
  // Clear regions to avoid text overlap/ghosting
  // Header region
  _tft->fillRect(0, 0, TFT_WIDTH, HEADER_HEIGHT, COLOR_BLACK);
  // Content region
  _tft->fillRect(0, HEADER_HEIGHT, TFT_WIDTH, CONTENT_HEIGHT, COLOR_BLACK);
  // Status bar region
  _tft->fillRect(0, TFT_HEIGHT - STATUS_BAR_HEIGHT, TFT_WIDTH, STATUS_BAR_HEIGHT, COLOR_BLACK);

  // Draw display elements after clearing
  _drawHeader(sessionId, systemState);
  _drawSensorData(sensorData);
  _drawMLPrediction(mlResult, threatDetected);
  _drawStatusBar(isCharging, threatDetected, WiFi.status() == WL_CONNECTED);
   
   // Update state tracking
   _lastUpdate = currentTime;
   _lastSessionId = sessionId;
   _lastChargingState = isCharging;
   _lastThreatState = threatDetected;
 }
 
 void DisplayManager::showStartupScreen() {
   if (!_initialized) {
     return;
   }
   
   clearScreen();
   
   // Draw title
   _drawCenteredText(20, "EV-Secure System", COLOR_CYAN, 2);
   _drawCenteredText(40, "ESP32-S3", COLOR_WHITE, 1);
   _drawCenteredText(55, "Version " + String(DEVICE_VERSION), COLOR_GRAY, 1);
   
   // Draw loading animation - FIXED
   for (int i = 0; i < 3; i++) {
     String dots = _createDotString(i + 1);
     _drawCenteredText(80, "Initializing" + dots, COLOR_YELLOW, 1);
     delay(500);
   }
   
   _drawCenteredText(80, "Ready!", COLOR_GREEN, 1);
   delay(1000);
 }
 
 void DisplayManager::showErrorScreen(const String& error) {
   if (!_initialized) {
     return;
   }
   
   clearScreen();
   
   _drawCenteredText(20, "ERROR", COLOR_RED, 2);
   _drawCenteredText(50, error, COLOR_WHITE, 1);
   _drawCenteredText(80, "Check connections", COLOR_YELLOW, 1);
   _drawCenteredText(100, "Restarting...", COLOR_GRAY, 1);
 }
 
 void DisplayManager::showAlertScreen(const String& alert) {
   if (!_initialized) {
     return;
   }
   
   clearScreen();
   
   _drawCenteredText(20, "ALERT", COLOR_ORANGE, 2);
   _drawCenteredText(50, alert, COLOR_WHITE, 1);
   _drawCenteredText(80, "Threat Detected!", COLOR_RED, 1);
 }
 
 void DisplayManager::showLockdownScreen() {
   if (!_initialized) {
     return;
   }
   
   clearScreen();
   
   _drawCenteredText(20, "LOCKDOWN", COLOR_RED, 2);
   _drawCenteredText(50, "System Secured", COLOR_WHITE, 1);
   _drawCenteredText(80, "Power Disabled", COLOR_YELLOW, 1);
   _drawCenteredText(100, "Contact Admin", COLOR_GRAY, 1);
 }
 
 void DisplayManager::clearScreen() {
   if (_tft) {
     _tft->fillScreen(COLOR_BLACK);
   }
 }
 
 void DisplayManager::setBrightness(uint8_t brightness) {
   // Brightness control would be implemented here
   // Most ST7735 displays don't have brightness control
   // This is a placeholder for future enhancement
 }
 
 bool DisplayManager::isInitialized() {
   return _initialized;
 }
 
 // Private methods implementation
 
 void DisplayManager::_drawHeader(const String& sessionId, SystemState state) {
   // Draw session ID
   _drawText(2, 2, "ID: " + sessionId.substring(0, 8), COLOR_CYAN, 1);
   
   // Draw system state
   String stateText = _getStateText(state);
   uint16_t stateColor = _getStateColor(state);
   _drawText(TFT_WIDTH - (stateText.length() * 6) - 2, 2, stateText, stateColor, 1);
   
   // Draw separator line
   _tft->drawFastHLine(0, HEADER_HEIGHT - 1, TFT_WIDTH, COLOR_DARK_GRAY);
 }
 
 void DisplayManager::_drawSensorData(const SensorData& sensorData) {
   int startY = HEADER_HEIGHT + 5;
   
   // Voltage
   _drawText(2, startY, "V:", COLOR_WHITE, 1);
   _drawText(20, startY, _formatFloat(sensorData.voltage, 1) + "V", COLOR_GREEN, 1);
   
   // Current
   _drawText(2, startY + 15, "I:", COLOR_WHITE, 1);
   _drawText(20, startY + 15, _formatFloat(sensorData.current, 2) + "A", COLOR_BLUE, 1);
   
   // Power
   _drawText(2, startY + 30, "P:", COLOR_WHITE, 1);
   _drawText(20, startY + 30, _formatFloat(sensorData.power, 1) + "W", COLOR_YELLOW, 1);
   
   // Frequency
   _drawText(2, startY + 45, "F:", COLOR_WHITE, 1);
   _drawText(20, startY + 45, _formatFloat(sensorData.frequency, 1) + "Hz", COLOR_CYAN, 1);
   
   // Temperature
   _drawText(2, startY + 60, "T:", COLOR_WHITE, 1);
   _drawText(20, startY + 60, _formatFloat(sensorData.temperature, 1) + "C", COLOR_MAGENTA, 1);
 }
 
 void DisplayManager::_drawMLPrediction(const MLPrediction& mlResult, bool threatDetected) {
   int startY = HEADER_HEIGHT + CONTENT_HEIGHT - 40;
   
   // ML Prediction - Fixed formatting to prevent apostrophe
   _drawText(2, startY, "ML:", COLOR_WHITE, 1);
   String predictionText = String(mlResult.prediction, 2); // Use 2 decimal places
   uint16_t predictionColor = threatDetected ? COLOR_RED : COLOR_GREEN;
   _drawText(20, startY, predictionText, predictionColor, 1);
   
   // Confidence - Fixed formatting
   _drawText(2, startY + 15, "Conf:", COLOR_WHITE, 1);
   String confidenceText = String(mlResult.confidence, 2); // Use 2 decimal places
   _drawText(35, startY + 15, confidenceText, COLOR_YELLOW, 1);
   
   // Threat indicator
   if (threatDetected) {
     _drawText(TFT_WIDTH - 30, startY, "!", COLOR_RED, 2);
   }
 }
 
 void DisplayManager::_drawStatusBar(bool isCharging, bool threatDetected, bool wifiConnected) {
   int startY = TFT_HEIGHT - STATUS_BAR_HEIGHT;
   
   // WiFi indicator
   _drawText(2, startY, wifiConnected ? "WiFi" : "NoWiFi", 
            wifiConnected ? COLOR_GREEN : COLOR_RED, 1);
   
   // Time display (center)
   String timeStr = _getCurrentTime();
   int timeWidth = timeStr.length() * 6; // Approximate character width
   int timeX = (TFT_WIDTH - timeWidth) / 2;
   _drawText(timeX, startY, timeStr, COLOR_WHITE, 1);
   
   // Charging indicator
   _drawText(40, startY, isCharging ? "CHG" : "IDLE", 
            isCharging ? COLOR_BLUE : COLOR_GRAY, 1);
   
   // Alert indicator
   if (threatDetected) {
     _drawText(TFT_WIDTH - 20, startY, "!", COLOR_RED, 1);
   }
 }
 
 void DisplayManager::_drawSystemState(SystemState state) {
   // This method can be used for more detailed state visualization
   // For now, state is shown in the header
 }
 
 void DisplayManager::_drawThreatIndicator(bool threatDetected, float confidence) {
   if (threatDetected) {
     // Draw a pulsing red indicator
     uint16_t color = (millis() / 500) % 2 ? COLOR_RED : COLOR_DARK_GRAY;
     _tft->fillCircle(TFT_WIDTH - 10, TFT_HEIGHT - 10, 5, color);
   }
 }
 
 // Helper methods
 
 void DisplayManager::_drawText(int x, int y, const String& text, uint16_t color, uint8_t size) {
   _tft->setTextColor(color);
   _tft->setTextSize(size);
   _tft->setCursor(x, y);
   _tft->print(text);
 }
 
 void DisplayManager::_drawCenteredText(int y, const String& text, uint16_t color, uint8_t size) {
   _tft->setTextColor(color);
   _tft->setTextSize(size);
   int x = (TFT_WIDTH - text.length() * 6 * size) / 2;
   _tft->setCursor(x, y);
   _tft->print(text);
 }
 
 void DisplayManager::_drawProgressBar(int x, int y, int width, int height, float progress, uint16_t color) {
   // Draw background
   _tft->fillRect(x, y, width, height, COLOR_DARK_GRAY);
   
   // Draw progress
   int progressWidth = (int)(width * progress);
   _tft->fillRect(x, y, progressWidth, height, color);
   
   // Draw border
   _tft->drawRect(x, y, width, height, COLOR_WHITE);
 }
 
 String DisplayManager::_formatFloat(float value, int decimals) {
   String result = String(value, decimals);
   // Remove trailing zeros
   while (result.endsWith("0") && result.indexOf(".") != -1) {
     result = result.substring(0, result.length() - 1);
   }
   if (result.endsWith(".")) {
     result = result.substring(0, result.length() - 1);
   }
   return result;
 }
 
 String DisplayManager::_getStateText(SystemState state) {
   switch (state) {
     case STATE_IDLE: return "IDLE";
     case STATE_HANDSHAKE: return "HANDSHAKE";
     case STATE_CHARGING: return "CHARGING";
     case STATE_SUSPICIOUS: return "SUSPICIOUS";
     case STATE_LOCKDOWN: return "LOCKDOWN";
     case STATE_ERROR: return "ERROR";
     default: return "UNKNOWN";
   }
 }
 
 uint16_t DisplayManager::_getStateColor(SystemState state) {
   switch (state) {
     case STATE_IDLE: return COLOR_GRAY;
     case STATE_HANDSHAKE: return COLOR_YELLOW;
     case STATE_CHARGING: return COLOR_GREEN;
     case STATE_SUSPICIOUS: return COLOR_ORANGE;
     case STATE_LOCKDOWN: return COLOR_RED;
     case STATE_ERROR: return COLOR_RED;
     default: return COLOR_WHITE;
   }
 }
 
// FIXED: Helper function to create dot strings for loading animation
String DisplayManager::_createDotString(int count) {
  String dots = "";
  for (int i = 0; i < count; i++) {
    dots += ".";
  }
  return dots;
}

// Get current time from RTC
String DisplayManager::_getCurrentTime() {
  // Get current time from ESP32 RTC
  time_t now = time(nullptr);
  struct tm* timeinfo = localtime(&now);
  
  char timeStr[9];
  sprintf(timeStr, "%02d:%02d:%02d", timeinfo->tm_hour, timeinfo->tm_min, timeinfo->tm_sec);
  return String(timeStr);
}
 
 #endif // DISPLAY_MANAGER_H