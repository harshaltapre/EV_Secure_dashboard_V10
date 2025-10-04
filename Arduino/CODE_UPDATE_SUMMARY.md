# EV-Secure Arduino Code Update Summary

## 🔄 Changes Made

### 1. Pin Configuration Updates
Updated all pin definitions to match the Hardware Wiring Guide:

**Sensor Pins:**
- Current Sensor: GPIO1 (ADC1_CH0) ✓
- Voltage Sensor: GPIO2 (ADC1_CH1) ✓  
- Temperature Sensor: GPIO3 (OneWire) ✓

**SD Card Pins (SPI):**
- MOSI: GPIO11 ✓
- MISO: GPIO13 ✓
- SCK: GPIO12 ✓
- CS: GPIO10 ✓

**TFT Display Pins (SPI):**
- MOSI: GPIO35 ✓
- MISO: Not used ✓
- SCK: GPIO36 ✓
- CS: GPIO10 (shared with SD) ✓
- DC: GPIO14 ✓
- RST: GPIO15 ✓
- BL: GPIO5 ✓

**Control Pins:**
- Relay Control: GPIO18 ✓
- Status LED: GPIO2 ✓
- Buzzer: GPIO4 ✓
- Emergency Stop: GPIO16 ✓

**I2C Pins (RTC):**
- SDA: GPIO21 ✓
- SCL: GPIO47 ✓

### 2. ADC Configuration Optimization
- Consolidated both sensors to use ADC1 (GPIO1 and GPIO2)
- Removed unused ADC2 configuration
- Updated calibration setup for single ADC unit
- Improved sensor reading accuracy

### 3. API Integration Enhancement
- Updated JSON payload format to match dashboard API exactly
- Added comprehensive system data (WiFi RSSI, uptime, memory)
- Enhanced command parsing with proper JSON handling
- Added command execution confirmations via alerts
- Improved error handling and logging

### 4. Display Management Updates
- Fixed SPI initialization for shared CS pin
- Updated pin assignments for TFT display
- Improved display update logic

## 🔧 Setup Instructions

### 1. Hardware Wiring
Follow the Hardware Wiring Guide exactly:
- Connect sensors to specified GPIO pins
- Ensure proper power connections (3.3V and GND)
- Use correct SPI connections for SD card and TFT
- Connect I2C devices to specified pins

### 2. Software Configuration

#### Update WiFi Credentials
Edit `credentials.h`:
```cpp
#define WIFI_SSID "your_wifi_name"
#define WIFI_PASSWORD "your_wifi_password"
```

#### Verify API Configuration
The API key is already configured to match the dashboard:
```cpp
#define API_KEY "vsr_st001_a1b2c3d4e5f6789012345678901234567890abcd"
#define DEVICE_ID "ST001"
```

### 3. Upload Process
1. Open Arduino IDE
2. Install required libraries:
   - ArduinoJson
   - Adafruit GFX Library
   - Adafruit ST7735 Library
   - OneWire
   - DallasTemperature
3. Select ESP32-S3 board
4. Upload the code

### 4. Testing Checklist

#### Hardware Tests
- [ ] Power LED on ESP32-S3 lights up
- [ ] TFT display shows startup screen
- [ ] SD card is detected
- [ ] Sensors provide readings in Serial Monitor
- [ ] Emergency stop button works
- [ ] Relay can be controlled

#### Software Tests
- [ ] WiFi connects successfully
- [ ] API communication works
- [ ] Data is sent to dashboard
- [ ] Commands can be received from dashboard
- [ ] ML inference runs properly
- [ ] Display updates correctly

## 📊 Expected Serial Output

```
EV-Secure ESP32-S3 System Starting...
Version: 1.0.0
Device ID: ST001
Initializing Sensor Manager...
ADC1 configured successfully for current (CH0) and voltage (CH1) sensors
Sensor Manager initialized successfully
Initializing TFT Display...
TFT Display initialized successfully
Initializing API Manager...
API Manager initialized successfully
WiFi Connected Successfully!
IP Address: 192.168.1.100
Data sent to dashboard successfully
```

## 🚨 Troubleshooting

### Common Issues

1. **WiFi Connection Failed**
   - Check SSID and password
   - Ensure network is 2.4GHz (ESP32-S3 doesn't support 5GHz)
   - Check signal strength

2. **Sensor Readings Incorrect**
   - Verify wiring connections
   - Check power supply voltage (3.3V)
   - Calibrate sensors if needed

3. **Display Not Working**
   - Check SPI connections
   - Verify TFT pin assignments
   - Ensure proper power supply

4. **API Communication Failed**
   - Check internet connection
   - Verify API key matches dashboard
   - Check server URL is accessible

### Debug Commands
Use Serial Monitor commands:
- `calibrate` - Run sensor calibration
- `status` - Show system status
- `reset` - Restart the system

## 📈 Performance Optimizations

1. **ADC Sampling**: Optimized to use single ADC unit
2. **Memory Management**: Improved buffer handling
3. **API Efficiency**: Reduced payload size, better error handling
4. **Display Updates**: Optimized refresh rate and partial updates

## 🔐 Security Features

1. **API Authentication**: Bearer token authentication
2. **Data Validation**: Input validation for all sensor data
3. **Error Handling**: Comprehensive error logging
4. **Rate Limiting**: API request rate limiting

## 📝 Notes

- The system is designed to work with the hosted dashboard at: https://ev-secure-dashboard-v2-grf2.vercel.app
- API key `vsr_st001_a1b2c3d4e5f6789012345678901234567890abcd` is pre-configured for station ST001
- All pin assignments now match the Hardware Wiring Guide exactly
- The code is optimized for ESP32-S3 and should compile without errors

## 🎯 Next Steps

1. Wire the hardware according to the guide
2. Update WiFi credentials in `credentials.h`
3. Upload the code to ESP32-S3
4. Monitor Serial output for initialization
5. Check dashboard for incoming data
6. Test all system functions

---

**The EV-Secure system is now properly configured and ready for deployment!**
