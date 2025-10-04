/*
 * RelayController.h - Relay/Contactor Control Library
 * 
 * This library handles relay and contactor control for the EV-Secure system.
 * It provides safe power control, emergency stop functionality, and status monitoring.
 * 
 * Features:
 * - Safe relay control with debouncing
 * - Emergency stop functionality
 * - Status monitoring and feedback
 * - Overcurrent protection
 * - Fault detection
 * - Manual override capabilities
 * - Safety interlocks
 * 
 * Safety Features:
 * - Hardware and software interlocks
 * - Emergency stop button
 * - Overcurrent protection
 * - Fault detection and reporting
 * - Manual override with safety checks
 * 
 * Usage:
 * 1. Initialize with RelayController::init()
 * 2. Control relay with RelayController::setRelayState()
 * 3. Check status with RelayController::getRelayStatus()
 * 4. Handle emergency stop with RelayController::emergencyStop()
 */

#ifndef RELAY_CONTROLLER_H
#define RELAY_CONTROLLER_H

#include "EV_Secure_Config.h"

// Relay states
enum RelayState {
  RELAY_OFF = 0,
  RELAY_ON = 1,
  RELAY_FAULT = 2,
  RELAY_EMERGENCY_STOP = 3
};

// Relay status structure
struct RelayStatus {
  RelayState state;
  bool isHealthy;
  bool emergencyStopActive;
  bool manualOverride;
  unsigned long lastStateChange;
  unsigned long faultCount;
  String lastFaultReason;
};

// Safety limits
#define MAX_CURRENT_THRESHOLD 35.0    // Maximum current before emergency stop
#define OVERCURRENT_TIME_MS 1000      // Time to allow overcurrent before trip
#define RELAY_DEBOUNCE_MS 100          // Debounce time for relay switching
#define FAULT_RESET_TIME_MS 5000       // Time before fault can be reset

class RelayController {
public:
  static bool init();
  static bool setRelayState(RelayState state);
  static bool setRelayOn();
  static bool setRelayOff();
  static RelayState getRelayState();
  static RelayStatus getRelayStatus();
  static bool emergencyStop();
  static bool resetEmergencyStop();
  static bool isEmergencyStopActive();
  static bool isRelayHealthy();
  static void enableManualOverride(bool enable);
  static bool isManualOverrideEnabled();
  static void checkSafetyLimits(float current, float voltage);
  static void handleEmergencyStopButton();
  static void updateStatus();
  static void resetFaults();
  static String getFaultHistory();
  
private:
  static bool _initialized;
  static RelayState _currentState;
  static RelayStatus _status;
  static bool _emergencyStopActive;
  static bool _manualOverrideEnabled;
  static bool _safetyLimitsEnabled;
  static unsigned long _lastStateChange;
  static unsigned long _overcurrentStartTime;
  static unsigned long _lastEmergencyStopTime;
  static String _faultHistory;
  
  // Safety monitoring
  static float _lastCurrent;
  static float _lastVoltage;
  static bool _overcurrentDetected;
  static unsigned long _faultResetTime;
  
  // Helper methods
  static void _writeRelayPin(bool state);
  static bool _readRelayFeedback();
  static void _updateRelayStatus();
  static void _logFault(const String& faultReason);
  static bool _checkSafetyInterlocks();
  static void _handleOvercurrent(float current);
  static void _handleUndervoltage(float voltage);
  static void _handleOvervoltage(float voltage);
  static bool _canChangeState(RelayState newState);
  static void _debounceRelay();
};

// Implementation
bool RelayController::_initialized = false;
RelayState RelayController::_currentState = RELAY_OFF;
RelayStatus RelayController::_status = {RELAY_OFF, true, false, false, 0, 0, ""};
bool RelayController::_emergencyStopActive = false;
bool RelayController::_manualOverrideEnabled = false;
bool RelayController::_safetyLimitsEnabled = true;
unsigned long RelayController::_lastStateChange = 0;
unsigned long RelayController::_overcurrentStartTime = 0;
unsigned long RelayController::_lastEmergencyStopTime = 0;
String RelayController::_faultHistory = "";

float RelayController::_lastCurrent = 0.0;
float RelayController::_lastVoltage = 0.0;
bool RelayController::_overcurrentDetected = false;
unsigned long RelayController::_faultResetTime = 0;

bool RelayController::init() {
  if (_initialized) {
    return true;
  }
  
  Serial.println("Initializing Relay Controller...");
  
  // Configure relay control pin
  pinMode(RELAY_CONTROL_PIN, OUTPUT);
  
  // Configure emergency stop button pin
  pinMode(EMERGENCY_STOP_PIN, INPUT_PULLUP);
  
  // Set initial relay state (OFF)
  _writeRelayPin(RELAY_ACTIVE_LOW ? HIGH : LOW);
  _currentState = RELAY_OFF;
  _lastStateChange = millis();
  
  // Initialize status
  _status.state = RELAY_OFF;
  _status.isHealthy = true;
  _status.emergencyStopActive = false;
  _status.manualOverride = false;
  _status.lastStateChange = millis();
  _status.faultCount = 0;
  _status.lastFaultReason = "";
  
  _initialized = true;
  Serial.println("Relay Controller initialized successfully");
  return true;
}

bool RelayController::setRelayState(RelayState state) {
  if (!_initialized) {
    return false;
  }
  
  // Check if state change is allowed
  if (!_canChangeState(state)) {
    Serial.println("State change not allowed");
    return false;
  }
  
  // Check safety interlocks
  if (!_checkSafetyInterlocks()) {
    Serial.println("Safety interlocks prevent state change");
    return false;
  }
  
  // Handle emergency stop
  if (_emergencyStopActive && state == RELAY_ON) {
    Serial.println("Cannot turn relay ON - emergency stop active");
    return false;
  }
  
  // Change relay state
  bool pinState = (state == RELAY_ON) ? !RELAY_ACTIVE_LOW : RELAY_ACTIVE_LOW;
  _writeRelayPin(pinState);
  
  // Update state tracking
  RelayState oldState = _currentState;
  _currentState = state;
  _lastStateChange = millis();
  
  // Update status
  _status.state = state;
  _status.lastStateChange = millis();
  
  // Log state change
  Serial.println("Relay state changed: " + String(oldState) + " -> " + String(state));
  
  // Debounce relay
  _debounceRelay();
  
  return true;
}

bool RelayController::setRelayOn() {
  return setRelayState(RELAY_ON);
}

bool RelayController::setRelayOff() {
  return setRelayState(RELAY_OFF);
}

RelayState RelayController::getRelayState() {
  return _currentState;
}

RelayStatus RelayController::getRelayStatus() {
  _updateRelayStatus();
  return _status;
}

bool RelayController::emergencyStop() {
  if (!_initialized) {
    return false;
  }
  
  Serial.println("EMERGENCY STOP ACTIVATED!");
  
  // Turn off relay immediately
  _writeRelayPin(RELAY_ACTIVE_LOW ? HIGH : LOW);
  _currentState = RELAY_EMERGENCY_STOP;
  _emergencyStopActive = true;
  _lastEmergencyStopTime = millis();
  
  // Update status
  _status.state = RELAY_EMERGENCY_STOP;
  _status.emergencyStopActive = true;
  _status.lastStateChange = millis();
  
  // Log emergency stop
  _logFault("Emergency stop activated");
  
  return true;
}

bool RelayController::resetEmergencyStop() {
  if (!_emergencyStopActive) {
    return true; // Already reset
  }
  
  // Check if enough time has passed since emergency stop
  if (millis() - _lastEmergencyStopTime < FAULT_RESET_TIME_MS) {
    Serial.println("Cannot reset emergency stop - wait " + String(FAULT_RESET_TIME_MS) + "ms");
    return false;
  }
  
  // Check safety conditions
  if (!_checkSafetyInterlocks()) {
    Serial.println("Cannot reset emergency stop - safety conditions not met");
    return false;
  }
  
  _emergencyStopActive = false;
  _status.emergencyStopActive = false;
  
  Serial.println("Emergency stop reset");
  return true;
}

bool RelayController::isEmergencyStopActive() {
  return _emergencyStopActive;
}

bool RelayController::isRelayHealthy() {
  _updateRelayStatus();
  return _status.isHealthy;
}

void RelayController::enableManualOverride(bool enable) {
  _manualOverrideEnabled = enable;
  _status.manualOverride = enable;
  
  Serial.println("Manual override " + String(enable ? "enabled" : "disabled"));
}

bool RelayController::isManualOverrideEnabled() {
  return _manualOverrideEnabled;
}

void RelayController::checkSafetyLimits(float current, float voltage) {
  if (!_safetyLimitsEnabled) {
    return;
  }
  
  _lastCurrent = current;
  _lastVoltage = voltage;
  
  // Check overcurrent
  if (current > MAX_CURRENT_THRESHOLD) {
    _handleOvercurrent(current);
  } else {
    _overcurrentDetected = false;
    _overcurrentStartTime = 0;
  }
  
  // Check undervoltage
  if (voltage < VOLTAGE_MIN_THRESHOLD) {
    _handleUndervoltage(voltage);
  }
  
  // Check overvoltage
  if (voltage > VOLTAGE_MAX_THRESHOLD) {
    _handleOvervoltage(voltage);
  }
}

void RelayController::handleEmergencyStopButton() {
  if (digitalRead(EMERGENCY_STOP_PIN) == LOW) {
    if (!_emergencyStopActive) {
      emergencyStop();
    }
  }
}

void RelayController::updateStatus() {
  _updateRelayStatus();
}

void RelayController::resetFaults() {
  _status.faultCount = 0;
  _status.lastFaultReason = "";
  _faultHistory = "";
  _faultResetTime = millis();
  
  Serial.println("Faults reset");
}

String RelayController::getFaultHistory() {
  return _faultHistory;
}

// Private methods implementation

void RelayController::_writeRelayPin(bool state) {
  digitalWrite(RELAY_CONTROL_PIN, state);
  delay(RELAY_DEBOUNCE_MS); // Debounce
}

bool RelayController::_readRelayFeedback() {
  // This would read from a feedback pin if available
  // For now, return the expected state
  return (_currentState == RELAY_ON);
}

void RelayController::_updateRelayStatus() {
  // Check relay health
  bool expectedState = (_currentState == RELAY_ON);
  bool actualState = _readRelayFeedback();
  
  if (expectedState != actualState) {
    _status.isHealthy = false;
    _logFault("Relay feedback mismatch");
  } else {
    _status.isHealthy = true;
  }
  
  // Update emergency stop status
  _status.emergencyStopActive = _emergencyStopActive;
  
  // Update manual override status
  _status.manualOverride = _manualOverrideEnabled;
}

void RelayController::_logFault(const String& faultReason) {
  _status.faultCount++;
  _status.lastFaultReason = faultReason;
  
  String timestamp = String(millis());
  _faultHistory += timestamp + ": " + faultReason + "\n";
  
  Serial.println("Relay fault: " + faultReason);
}

bool RelayController::_checkSafetyInterlocks() {
  // Check if safety conditions are met
  if (_emergencyStopActive) {
    return false;
  }
  
  if (_status.faultCount > 5) {
    return false; // Too many faults
  }
  
  // Add more safety checks here
  return true;
}

void RelayController::_handleOvercurrent(float current) {
  if (!_overcurrentDetected) {
    _overcurrentDetected = true;
    _overcurrentStartTime = millis();
    Serial.println("Overcurrent detected: " + String(current) + "A");
  }
  
  // If overcurrent persists for too long, emergency stop
  if (millis() - _overcurrentStartTime > OVERCURRENT_TIME_MS) {
    emergencyStop();
    _logFault("Overcurrent protection triggered: " + String(current) + "A");
  }
}

void RelayController::_handleUndervoltage(float voltage) {
  Serial.println("Undervoltage detected: " + String(voltage) + "V");
  _logFault("Undervoltage: " + String(voltage) + "V");
}

void RelayController::_handleOvervoltage(float voltage) {
  Serial.println("Overvoltage detected: " + String(voltage) + "V");
  emergencyStop();
  _logFault("Overvoltage protection triggered: " + String(voltage) + "V");
}

bool RelayController::_canChangeState(RelayState newState) {
  // Check if state change is allowed
  if (_currentState == newState) {
    return true; // No change needed
  }
  
  // Check debounce time
  if (millis() - _lastStateChange < RELAY_DEBOUNCE_MS) {
    return false;
  }
  
  // Check if manual override is enabled
  if (_manualOverrideEnabled) {
    return true;
  }
  
  // Check safety conditions
  if (!_checkSafetyInterlocks()) {
    return false;
  }
  
  return true;
}

void RelayController::_debounceRelay() {
  delay(RELAY_DEBOUNCE_MS);
}

#endif // RELAY_CONTROLLER_H
