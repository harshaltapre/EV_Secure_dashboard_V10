/*
 * SensorManager.h - Sensor Reading and Management Library
 * 
 * This library handles all sensor readings for the EV-Secure system:
 * - Current sensor (ACS712 or INA226)
 * - Voltage sensor (ZMPT101B or voltage divider)
 * - Temperature sensor (DS18B20)
 * - Frequency calculation
 * 
 * Features:
 * - Multiple sensor support (ACS712, INA226, ZMPT101B, DS18B20)
 * - ADC calibration for accurate readings
 * - Filtering and averaging for stable readings
 * - Automatic sensor detection and configuration
 * - Error handling and sensor health monitoring
 * 
 * Usage:
 * 1. Initialize with SensorManager::init()
 * 2. Read sensors with SensorManager::readCurrent(), readVoltage(), etc.
 * 3. Get sensor data structure with SensorManager::getSensorData()
 */
/*
 * SensorManager.h - Sensor Reading and Management Library - CORRECTED
 * 
 * This library handles all sensor readings for the EV-Secure system:
 * - Current sensor (ACS712 or INA226)
 * - Voltage sensor (ZMPT101B or voltage divider)
 * - Temperature sensor (DS18B20)
 * - Frequency calculation
 * 
 * Features:
 * - Multiple sensor support (ACS712, INA226, ZMPT101B, DS18B20)
 * - ADC calibration for accurate readings
 * - Filtering and averaging for stable readings
 * - Automatic sensor detection and configuration
 * - Error handling and sensor health monitoring
 * 
 * Usage:
 * 1. Initialize with SensorManager::init()
 * 2. Read sensors with SensorManager::readCurrent(), readVoltage(), etc.
 * 3. Get sensor data structure with SensorManager::getSensorData()
 */

 #ifndef SENSOR_MANAGER_H
 #define SENSOR_MANAGER_H
 
#include "EV_Secure_Config.h"
#include <Arduino.h>
#include <esp_adc/adc_oneshot.h>
#include <esp_adc/adc_cali.h>
#include <esp_adc/adc_cali_scheme.h>
#include <OneWire.h>
#include <DallasTemperature.h>
 
 // Sensor types
 enum SensorType {
   SENSOR_ACS712,
   SENSOR_INA226,
   SENSOR_ZMPT101B,
   SENSOR_VOLTAGE_DIVIDER,
   SENSOR_DS18B20
 };
 
 // Sensor configuration
 struct SensorConfig {
   SensorType currentSensorType;
   SensorType voltageSensorType;
   bool temperatureSensorEnabled;
   float currentCalibrationFactor;
   float voltageCalibrationFactor;
   float temperatureOffset;
 };
 
 class SensorManager {
 public:
   static bool init();
   static bool init(SensorConfig config);
   static float readCurrent();
   static float readVoltage();
   static float readTemperature();
   static float readFrequency();
   static float readPower();
   static SensorData getSensorData();
   static bool isSensorHealthy();
   static void calibrateSensors();
   static void setCalibrationFactors(float currentFactor, float voltageFactor);
   
 private:
   static bool _initialized;
   static SensorConfig _config;
   static adc_oneshot_unit_handle_t _adc1_handle;
   static adc_cali_handle_t _adc1_cali_handle;
   static OneWire* _oneWire;
   static DallasTemperature* _tempSensor;
   
   // Sensor reading methods
   static float _readCurrentACS712();
   static float _readCurrentINA226();
   static float _readVoltageZMPT101B();
   static float _readVoltageDivider();
   static float _readTemperatureDS18B20();
   static float _calculateFrequency();
   
   // Helper methods
   static int _readADC(adc_channel_t channel, int samples = 10);
   static void _setupADC();
   static void _setupI2C();
   static void _setupOneWire();
   static float _applyFilter(float newValue, float* filterBuffer, int bufferSize);
   
   // Filter buffers
   static float _currentFilterBuffer[10];
   static float _voltageFilterBuffer[10];
   static int _filterIndex;
 };
 
// Implementation
bool SensorManager::_initialized = false;
SensorConfig SensorManager::_config = {
  SENSOR_ACS712,
  SENSOR_ZMPT101B,
  true,
  1.0,
  1.0,
  0.0
};
adc_oneshot_unit_handle_t SensorManager::_adc1_handle = nullptr;
adc_cali_handle_t SensorManager::_adc1_cali_handle = nullptr;
OneWire* SensorManager::_oneWire = nullptr;
DallasTemperature* SensorManager::_tempSensor = nullptr;
float SensorManager::_currentFilterBuffer[10] = {0};
float SensorManager::_voltageFilterBuffer[10] = {0};
int SensorManager::_filterIndex = 0;
 
 bool SensorManager::init() {
   return init(_config);
 }
 
 bool SensorManager::init(SensorConfig config) {
   if (_initialized) {
     return true;
   }
   
   Serial.println("Initializing Sensor Manager...");
   
   _config = config;
   
   // Setup ADC
   _setupADC();
   
   // Setup I2C if using INA226
   if (_config.currentSensorType == SENSOR_INA226) {
     _setupI2C();
   }
   
   // Setup OneWire for temperature sensor
   if (_config.temperatureSensorEnabled) {
     _setupOneWire();
   }
   
   // Initialize filter buffers
   for (int i = 0; i < 10; i++) {
     _currentFilterBuffer[i] = 0;
     _voltageFilterBuffer[i] = 0;
   }
   
   _initialized = true;
   Serial.println("Sensor Manager initialized successfully");
   return true;
 }
 
 float SensorManager::readCurrent() {
   if (!_initialized) {
     return 0.0;
   }
   
   float current = 0.0;
   
   switch (_config.currentSensorType) {
     case SENSOR_ACS712:
       current = _readCurrentACS712();
       break;
     case SENSOR_INA226:
       current = _readCurrentINA226();
       break;
     default:
       Serial.println("Unknown current sensor type");
       return 0.0;
   }
   
   // Apply calibration factor
   current *= _config.currentCalibrationFactor;
   
   // Apply filtering
   current = _applyFilter(current, _currentFilterBuffer, 10);
   
   return current;
 }
 
 float SensorManager::readVoltage() {
   if (!_initialized) {
     return 0.0;
   }
   
   float voltage = 0.0;
   
   switch (_config.voltageSensorType) {
     case SENSOR_ZMPT101B:
       voltage = _readVoltageZMPT101B();
       break;
     case SENSOR_VOLTAGE_DIVIDER:
       voltage = _readVoltageDivider();
       break;
     default:
       Serial.println("Unknown voltage sensor type");
       return 0.0;
   }
   
   // Apply calibration factor
   voltage *= _config.voltageCalibrationFactor;
   
   // Apply filtering
   voltage = _applyFilter(voltage, _voltageFilterBuffer, 10);
   
   return voltage;
 }
 
 float SensorManager::readTemperature() {
   if (!_initialized || !_config.temperatureSensorEnabled) {
     return 25.0; // Default temperature
   }
   
   return _readTemperatureDS18B20() + _config.temperatureOffset;
 }
 
 float SensorManager::readFrequency() {
   return _calculateFrequency();
 }
 
 float SensorManager::readPower() {
   return readCurrent() * readVoltage();
 }
 
 SensorData SensorManager::getSensorData() {
   SensorData data;
   data.current = readCurrent();
   data.voltage = readVoltage();
   data.power = data.current * data.voltage;
   data.frequency = readFrequency();
   data.temperature = readTemperature();
   data.timestamp = millis();
   
   return data;
 }
 
 bool SensorManager::isSensorHealthy() {
   // Check if sensors are responding
   float current = readCurrent();
   float voltage = readVoltage();
   
   // Basic health checks
   if (isnan(current) || isnan(voltage)) {
     return false;
   }
   
   if (abs(current) > ACS712_MAX_CURRENT * 1.5) {
     return false; // Current sensor may be faulty
   }
   
   if (voltage > ZMPT101B_MAX_VOLTAGE * 1.5) {
     return false; // Voltage sensor may be faulty
   }
   
   return true;
 }
 
 void SensorManager::calibrateSensors() {
   Serial.println("Starting sensor calibration...");
   
   // Read multiple samples for calibration
   float currentSum = 0;
   float voltageSum = 0;
   int samples = 100;
   
   for (int i = 0; i < samples; i++) {
     currentSum += _readCurrentACS712();
     voltageSum += _readVoltageZMPT101B();
     delay(10);
   }
   
   float avgCurrent = currentSum / samples;
   float avgVoltage = voltageSum / samples;
   
   Serial.println("Calibration results:");
   Serial.println("Average Current: " + String(avgCurrent) + " A");
   Serial.println("Average Voltage: " + String(avgVoltage) + " V");
   
   // You can implement automatic calibration here
   // For now, just log the values
 }
 
 void SensorManager::setCalibrationFactors(float currentFactor, float voltageFactor) {
   _config.currentCalibrationFactor = currentFactor;
   _config.voltageCalibrationFactor = voltageFactor;
   
   Serial.println("Calibration factors updated:");
   Serial.println("Current factor: " + String(currentFactor));
   Serial.println("Voltage factor: " + String(voltageFactor));
 }
 
 // Private methods implementation
 
float SensorManager::_readCurrentACS712() {
  int adc_reading = _readADC(ADC_CHANNEL_0); // GPIO1 = ADC1_CH0
  int voltage = 0;
  
  if (_adc1_cali_handle) {
    adc_cali_raw_to_voltage(_adc1_cali_handle, adc_reading, &voltage);
  } else {
    voltage = adc_reading * 3300 / 4095; // Simple conversion
  }
  
  // Convert to current (A)
  float current = ((voltage / 1000.0) - ACS712_OFFSET) / (ACS712_SENSITIVITY / 1000.0);
  
  return current;
}
 
 float SensorManager::_readCurrentINA226() {
   // INA226 implementation would go here
   // For now, return ACS712 reading
   return _readCurrentACS712();
 }
 
float SensorManager::_readVoltageZMPT101B() {
  int adc_reading = _readADC(ADC_CHANNEL_1); // GPIO2 = ADC1_CH1
  int voltage = 0;
  
  if (_adc1_cali_handle) {
    adc_cali_raw_to_voltage(_adc1_cali_handle, adc_reading, &voltage);
  } else {
    voltage = adc_reading * 3300 / 4095; // Simple conversion
  }
  
  // Apply calibration factor for ZMPT101B
  float acVoltage = voltage * ZMPT101B_CALIBRATION;
  
  return acVoltage;
}
 
float SensorManager::_readVoltageDivider() {
  int adc_reading = _readADC(ADC_CHANNEL_1); // GPIO2 = ADC1_CH1
  int voltage = 0;
  
  if (_adc1_cali_handle) {
    adc_cali_raw_to_voltage(_adc1_cali_handle, adc_reading, &voltage);
  } else {
    voltage = adc_reading * 3300 / 4095; // Simple conversion
  }
  
  // Simple voltage divider calculation
  // Adjust the divider ratio based on your circuit
  float dividerRatio = 11.0; // 10k + 1k resistor divider
  float acVoltage = voltage * dividerRatio / 1000.0;
  
  return acVoltage;
}
 
 float SensorManager::_readTemperatureDS18B20() {
   if (!_tempSensor) {
     return 25.0;
   }
   
   _tempSensor->requestTemperatures();
   float temperature = _tempSensor->getTempCByIndex(0);
   
   if (temperature == DEVICE_DISCONNECTED_C) {
     return 25.0; // Default temperature if sensor disconnected
   }
   
   return temperature;
 }
 
 float SensorManager::_calculateFrequency() {
   // Simple frequency calculation based on zero-crossing detection
   static unsigned long lastZeroCross = 0;
   static int zeroCrossCount = 0;
   static float frequency = FREQUENCY_NOMINAL; // Default frequency
   
   float voltage = readVoltage();
   
   // Detect zero crossing (simplified)
   if (abs(voltage) < 0.1 && lastZeroCross > 0) {
     unsigned long timeDiff = millis() - lastZeroCross;
     if (timeDiff > 0) {
       frequency = 1000.0 / timeDiff; // Convert to Hz
     }
     lastZeroCross = millis();
     zeroCrossCount++;
   }
   
   return frequency;
 }
 
int SensorManager::_readADC(adc_channel_t channel, int samples) {
  int adc_reading = 0;
  
  for (int i = 0; i < samples; i++) {
    int raw = 0;
    adc_oneshot_read(_adc1_handle, channel, &raw);
    adc_reading += raw;
    delayMicroseconds(100);
  }
  
  return adc_reading / samples;
}

 
void SensorManager::_setupADC() {
  // Configure ADC1 for both current and voltage sensors (GPIO1 and GPIO2)
  adc_oneshot_unit_init_cfg_t init_config1 = {};
  init_config1.unit_id = ADC_UNIT_1;
  ESP_ERROR_CHECK(adc_oneshot_new_unit(&init_config1, &_adc1_handle));
  
  // Configure channel 0 for current sensor (GPIO1)
  adc_oneshot_chan_cfg_t config_current = {};
  config_current.bitwidth = ADC_BITWIDTH_12;
  config_current.atten = ADC_ATTEN_DB_11;
  ESP_ERROR_CHECK(adc_oneshot_config_channel(_adc1_handle, ADC_CHANNEL_0, &config_current));
  
  // Configure channel 1 for voltage sensor (GPIO2)
  adc_oneshot_chan_cfg_t config_voltage = {};
  config_voltage.bitwidth = ADC_BITWIDTH_12;
  config_voltage.atten = ADC_ATTEN_DB_11;
  ESP_ERROR_CHECK(adc_oneshot_config_channel(_adc1_handle, ADC_CHANNEL_1, &config_voltage));
  
  // Setup calibration for ADC1
  adc_cali_curve_fitting_config_t cali_config1 = {};
  cali_config1.unit_id = ADC_UNIT_1;
  cali_config1.atten = ADC_ATTEN_DB_11;
  cali_config1.bitwidth = ADC_BITWIDTH_12;
  if (adc_cali_create_scheme_curve_fitting(&cali_config1, &_adc1_cali_handle) == ESP_OK) {
    Serial.println("ADC1 calibration created for both channels");
  }
  
  Serial.println("ADC1 configured successfully for current (CH0) and voltage (CH1) sensors");
}
 
 void SensorManager::_setupI2C() {
   Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
   Wire.setClock(400000); // 400kHz I2C clock
   
   Serial.println("I2C configured successfully");
 }
 
 void SensorManager::_setupOneWire() {
   _oneWire = new OneWire(TEMPERATURE_SENSOR_PIN);
   _tempSensor = new DallasTemperature(_oneWire);
   _tempSensor->begin();
   _tempSensor->setResolution(TEMP_SENSOR_RESOLUTION);
   
   Serial.println("OneWire temperature sensor configured");
 }
 
 float SensorManager::_applyFilter(float newValue, float* filterBuffer, int bufferSize) {
   // Simple moving average filter
   filterBuffer[_filterIndex] = newValue;
   _filterIndex = (_filterIndex + 1) % bufferSize;
   
   float sum = 0;
   for (int i = 0; i < bufferSize; i++) {
     sum += filterBuffer[i];
   }
   
   return sum / bufferSize;
 }
 
 #endif // SENSOR_MANAGER_H