# EV-Secure ESP32-S3 Upload Guide

## Essential Files to Upload

### Main Project Files (Required)
1. **`EV_Secure_ESP32S3_Complete.ino`** - Main Arduino sketch
2. **`EV_Secure_Config.h`** - Hardware configuration
3. **`credentials.h`** - WiFi and API settings
4. **`SensorManager.h`** - Sensor reading functions
5. **`DisplayManager.h`** - TFT display functions
6. **`APIManager.h`** - Dashboard communication
7. **`SDLogger.h`** - Data logging functions
8. **`RelayController.h`** - Relay control functions
9. **`MLModel.h`** - Machine learning model
10. **`AdvancedThreatDetection.h`** - Threat detection
11. **`EnhancedMLModel.h`** - Enhanced ML functions

## Quick Upload Steps

### 1. Open Arduino IDE
- Open `EV_Secure_ESP32S3_Complete.ino`

### 2. Check Configuration
- Verify WiFi settings in `credentials.h`
- Check pin configuration in `EV_Secure_Config.h`

### 3. Select Board
- Board: ESP32S3 Dev Module
- Upload Speed: 921600
- CPU Frequency: 240MHz
- Flash Mode: QIO
- Flash Size: 16MB
- Partition Scheme: Huge APP (3MB No OTA/1MB SPIFFS)

### 4. Upload
- Click Upload button
- Hold BOOT button if needed

### 5. Monitor
- Open Serial Monitor (115200 baud)
- Check for initialization messages

## Current Configuration

### WiFi Settings
- SSID: `harshal`
- Password: `harshal27`

### Device Settings
- Device ID: `ST001`
- Dashboard: `https://ev-secure-dashboard-v2-grf2.vercel.app`

### Pin Configuration
- TFT CS: GPIO6
- TFT DC: GPIO7
- TFT RST: GPIO8
- Current Sensor: GPIO1
- Voltage Sensor: GPIO2

## Expected Serial Output
```
EV-Secure ESP32-S3 System Starting...
Version: 1.0.0
Device ID: ST001
Scanning for available WiFi networks...
Found X networks:
1: harshal (-50 dBm) WPA2
  *** THIS IS YOUR TARGET NETWORK ***
Connecting to WiFi: harshal
WiFi Connected Successfully!
IP Address: 192.168.1.xxx
TFT Display initialized successfully
ADC configured successfully
EV-Secure System Initialized Successfully!
```

## Troubleshooting

### Upload Issues
- Check USB cable connection
- Try different USB port
- Hold BOOT button during upload

### WiFi Issues
- Check SSID and password in `credentials.h`
- Ensure network is 2.4GHz
- Move closer to router

### Display Issues
- Check TFT pin connections
- Verify GPIO6 (CS pin) connection
- Check power supply

## File Structure
```
EV_Secure_ESP32S3_Complete/
├── EV_Secure_ESP32S3_Complete.ino  (Main file)
├── EV_Secure_Config.h              (Hardware config)
├── credentials.h                   (WiFi/API settings)
├── SensorManager.h                 (Sensor functions)
├── DisplayManager.h                (Display functions)
├── APIManager.h                    (API communication)
├── SDLogger.h                      (Data logging)
├── RelayController.h               (Relay control)
├── MLModel.h                       (ML model)
├── AdvancedThreatDetection.h       (Threat detection)
└── EnhancedMLModel.h               (Enhanced ML)
```
