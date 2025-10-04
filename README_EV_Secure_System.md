# EV-Secure ESP32-S3 Complete System

A comprehensive Arduino-compatible ESP32-S3 project for EV charging station security monitoring and threat detection.

## 🌟 Features

### Hardware Integration
- **Voltage Sensor**: ZMPT101B or voltage divider (ADC)
- **Current Sensor**: ACS712 (30A) or INA226 Energy Meter (I²C)
- **Temperature Sensor**: DS18B20 (OneWire)
- **Display**: 1.8" TFT Display (ST7735/ST7789, SPI)
- **Storage**: MicroSD Card Module (SPI)
- **Control**: Relay/Contactor Module (GPIO)
- **Status**: LED and Buzzer indicators
- **Safety**: Emergency Stop Button

### Software Features
- **Real-time Monitoring**: Continuous sensor data acquisition
- **Machine Learning**: TensorFlow Lite Micro for threat detection
- **Wi-Fi Communication**: Secure API integration with dashboard
- **Data Logging**: Comprehensive SD card logging
- **Remote Control**: Dashboard command reception
- **Safety Systems**: Emergency stop and overcurrent protection
- **Visual Interface**: Real-time TFT display updates

## 📁 Project Structure

```
EV-Secure-System/
├── EV_Secure_ESP32S3_Complete.ino    # Main Arduino sketch
├── EV_Secure_Config.h                # Configuration and pin definitions
├── MLModel.h                         # TensorFlow Lite Micro model
├── SensorManager.h                   # Sensor reading library
├── DisplayManager.h                  # TFT display management
├── SDLogger.h                        # SD card logging library
├── APIManager.h                      # Dashboard API communication
├── RelayController.h                 # Relay/contactor control
└── README_EV_Secure_System.md        # This documentation
```

## 🔧 Hardware Setup

### Pin Configuration (ESP32-S3)

| Component | Pin | Function |
|-----------|-----|----------|
| Current Sensor | GPIO1 | ADC1_CH0 |
| Voltage Sensor | GPIO2 | ADC1_CH1 |
| Temperature Sensor | GPIO3 | OneWire |
| SD Card MOSI | GPIO11 | SPI |
| SD Card MISO | GPIO13 | SPI |
| SD Card SCK | GPIO12 | SPI |
| SD Card CS | GPIO10 | SPI |
| TFT MOSI | GPIO35 | SPI |
| TFT MISO | GPIO37 | SPI |
| TFT SCK | GPIO36 | SPI |
| TFT CS | GPIO34 | SPI |
| TFT DC | GPIO14 | Control |
| TFT RST | GPIO15 | Reset |
| Relay Control | GPIO18 | Power Control |
| Status LED | GPIO2 | Status Indicator |
| Buzzer | GPIO4 | Alert Sound |
| Emergency Stop | GPIO16 | Safety Button |
| I²C SDA | GPIO21 | I²C Data |
| I²C SCL | GPIO22 | I²C Clock |

### Wiring Diagram

```
ESP32-S3 DevKit
├── ACS712 Current Sensor → GPIO1 (ADC)
├── ZMPT101B Voltage Sensor → GPIO2 (ADC)
├── DS18B20 Temperature → GPIO3 (OneWire)
├── 1.8" TFT Display → GPIO35,37,36,34,14,15 (SPI)
├── MicroSD Card → GPIO11,13,12,10 (SPI)
├── Relay Module → GPIO18 (Control)
├── Status LED → GPIO2
├── Buzzer → GPIO4
├── Emergency Stop Button → GPIO16
└── INA226 (Optional) → GPIO21,22 (I²C)
```

## ⚙️ Configuration

### 1. WiFi Configuration
Edit `EV_Secure_Config.h`:
```cpp
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
```

### 2. API Configuration
```cpp
#define DASHBOARD_URL "https://your-dashboard.com/api/endpoint"
#define API_KEY "YOUR_API_KEY_HERE"
```

### 3. Sensor Calibration
Adjust calibration factors in `EV_Secure_Config.h`:
```cpp
#define ACS712_SENSITIVITY 66.0   // mV/A for 30A module
#define ZMPT101B_CALIBRATION 0.00488  // Calibration factor
```

## 🚀 Installation & Setup

### Prerequisites
- Arduino IDE 2.0+
- ESP32 Arduino Core 2.0+
- Required Libraries:
  - `WiFi`
  - `HTTPClient`
  - `SD`
  - `SPI`
  - `ArduinoJson`
  - `Adafruit_GFX`
  - `Adafruit_ST7735`
  - `OneWire`
  - `DallasTemperature`

### Installation Steps

1. **Install ESP32 Arduino Core**
   ```
   Arduino IDE → Tools → Board → Boards Manager
   Search: "ESP32" → Install "ESP32 by Espressif Systems"
   ```

2. **Install Required Libraries**
   ```
   Arduino IDE → Tools → Manage Libraries
   Install: WiFi, HTTPClient, SD, SPI, ArduinoJson, Adafruit_GFX, Adafruit_ST7735, OneWire, DallasTemperature
   ```

3. **Configure Hardware**
   - Wire components according to pin configuration
   - Ensure proper power supply (3.3V/5V as needed)
   - Connect sensors and test basic functionality

4. **Upload Code**
   - Open `EV_Secure_ESP32S3_Complete.ino` in Arduino IDE
   - Select Board: "ESP32S3 Dev Module"
   - Configure upload settings if needed
   - Upload to ESP32-S3

5. **Configure Network**
   - Update WiFi credentials in config file
   - Update API endpoint and key
   - Re-upload if changes made

## 📊 System Operation

### Normal Operation Flow

1. **Initialization**
   - System boots and initializes all peripherals
   - Connects to WiFi network
   - Loads ML model and calibrates sensors
   - Shows startup screen on TFT display

2. **Continuous Monitoring**
   - Reads sensor data every 100ms
   - Runs ML inference every 1 second
   - Updates display every 500ms
   - Logs data to SD card every 5 seconds
   - Sends data to dashboard every 2 seconds

3. **Threat Detection**
   - ML model analyzes sensor patterns
   - Compares against learned normal behavior
   - Triggers alerts for suspicious patterns
   - Activates safety systems if needed

4. **Safety Response**
   - Emergency stop button immediately cuts power
   - Overcurrent protection trips relay
   - Dashboard can send remote stop commands
   - System logs all events for analysis

### Display Information

The TFT display shows:
- **Header**: Session ID and system state
- **Sensor Data**: Voltage, Current, Power, Frequency, Temperature
- **ML Prediction**: Threat probability and confidence
- **Status Bar**: WiFi, Charging, Alert indicators

### Data Logging

SD card contains:
- `sensor_data.csv`: Continuous sensor readings
- `ml_predictions.csv`: ML model predictions
- `system_events.csv`: State changes and events
- `alerts.csv`: Threat detections and alerts
- `error_log.txt`: System errors and debugging

## 🔒 Security Features

### Threat Detection
- **ML-based Anomaly Detection**: Identifies unusual charging patterns
- **Rule-based Safety**: Overcurrent, overvoltage, frequency deviation
- **Real-time Monitoring**: Continuous analysis of sensor data
- **Confidence Scoring**: ML model provides confidence levels

### Safety Systems
- **Emergency Stop**: Hardware button for immediate power cutoff
- **Overcurrent Protection**: Automatic relay trip on excessive current
- **Remote Control**: Dashboard can send stop commands
- **Fault Detection**: Monitors relay health and sensor status
- **Manual Override**: Bypass safety systems when needed (with caution)

### Communication Security
- **HTTPS/TLS**: Encrypted communication with dashboard
- **API Key Authentication**: Secure API access
- **Rate Limiting**: Prevents API abuse
- **Error Handling**: Robust error recovery and logging

## 📡 API Integration

### Data Transmission
```json
{
  "device_id": "EV_SECURE_001",
  "session_id": "SESS_1234567890_1234",
  "timestamp": 1234567890,
  "state": 2,
  "is_charging": true,
  "threat_detected": false,
  "sensors": {
    "current": 15.5,
    "voltage": 230.0,
    "power": 3565.0,
    "frequency": 50.0,
    "temperature": 25.0
  },
  "ml_prediction": {
    "prediction": 0.15,
    "confidence": 0.85,
    "threat_level": "NORMAL"
  }
}
```

### Command Reception
```json
{
  "command": "STOP",
  "parameters": "",
  "timestamp": 1234567890
}
```

### Alert Transmission
```json
{
  "device_id": "EV_SECURE_001",
  "alert_type": "THREAT_DETECTED",
  "details": "Suspicious charging pattern detected",
  "timestamp": 1234567890,
  "severity": "high"
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **WiFi Connection Failed**
   - Check SSID and password
   - Verify signal strength
   - Check router settings

2. **Sensor Readings Incorrect**
   - Calibrate sensor factors
   - Check wiring connections
   - Verify power supply

3. **Display Not Working**
   - Check SPI connections
   - Verify power supply
   - Check display initialization

4. **SD Card Issues**
   - Format SD card (FAT32)
   - Check SPI connections
   - Verify card compatibility

5. **API Communication Failed**
   - Check API endpoint URL
   - Verify API key
   - Check network connectivity

### Debug Mode

Enable debug output in `EV_Secure_Config.h`:
```cpp
#define DEBUG_MODE true
#define DEBUG_LEVEL 2  // 0=Errors, 1=Warnings, 2=Info, 3=Debug
```

### Serial Monitor

Use Arduino Serial Monitor (115200 baud) to view:
- System initialization status
- Sensor readings
- ML predictions
- API communication
- Error messages

## 🔄 Updates & Maintenance

### Firmware Updates
- Use OTA (Over-The-Air) updates when available
- Manual upload via Arduino IDE
- Backup configuration before updates

### Model Updates
- Replace `model_data.h` with new model
- Recompile and upload firmware
- Test with known data patterns

### Configuration Updates
- Modify `EV_Secure_Config.h`
- Recompile and upload
- Or use dashboard commands (if implemented)

## 📈 Performance Optimization

### Memory Usage
- Monitor heap usage with `ESP.getFreeHeap()`
- Optimize ML model size
- Use efficient data structures

### Power Consumption
- Implement sleep modes when idle
- Optimize sensor reading frequency
- Use efficient display updates

### Network Optimization
- Compress data before transmission
- Batch multiple readings
- Use efficient JSON formatting

## 🚨 Safety Warnings

⚠️ **Important Safety Information**

- This system controls high-voltage AC power
- Always follow electrical safety procedures
- Test thoroughly before deployment
- Ensure proper grounding and isolation
- Use appropriate safety equipment
- Follow local electrical codes and regulations

## 📞 Support

For technical support:
- Check troubleshooting section
- Review error logs on SD card
- Monitor serial output
- Verify hardware connections
- Test individual components

## 📄 License

This project is provided as-is for educational and development purposes. Use at your own risk and ensure compliance with local regulations.

---

**EV-Secure ESP32-S3 System** - Protecting EV charging infrastructure through intelligent monitoring and threat detection.
