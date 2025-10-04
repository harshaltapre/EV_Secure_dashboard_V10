# EV-Secure Dashboard API Troubleshooting Guide

## Overview
This guide helps diagnose and fix API key management and data transmission issues between ESP32 S3 devices and the EV-Secure dashboard hosted on Vercel.

## Quick Diagnosis Steps

### 1. Test API Connectivity
Run the connectivity test script:
```bash
cd /media/harshal/CCCOMA_X64FRE_EN-US_DV9/EV_Secure_dashboard_V2/EV_Secure_dashboard_V2
python3 test_api_connectivity.py
```

### 2. Check ESP32 Serial Output
Monitor the ESP32 serial output for these key messages:
- `WiFi Connected Successfully!`
- `API Manager initialized successfully`
- `Data sent to dashboard successfully`

### 3. Verify Dashboard Logs
Check Vercel deployment logs for incoming requests and errors.

## Common Issues and Solutions

### Issue 1: WiFi Connection Problems
**Symptoms:**
- ESP32 fails to connect to WiFi
- Serial shows "WiFi Connection Failed!"

**Solutions:**
1. Verify WiFi credentials in `credentials.h`:
   ```cpp
   #define WIFI_SSID "your_network_name"
   #define WIFI_PASSWORD "your_password"
   ```

2. Check network availability:
   - Ensure network is 2.4GHz (ESP32-S3 doesn't support 5GHz)
   - Verify signal strength is adequate (-80 dBm or better)
   - Check if network requires additional authentication

3. Test with different networks:
   - Try mobile hotspot
   - Use a different WiFi network

### Issue 2: SSL Certificate Problems
**Symptoms:**
- Connection fails with SSL errors
- "Certificate verification failed"

**Solutions:**
1. Use the improved APIManager with fallback:
   ```cpp
   #include "APIManager_Improved.h"
   ```

2. Enable fallback mode:
   ```cpp
   APIManagerImproved::enableFallbackMode(true);
   ```

3. Alternative: Use HTTP instead of HTTPS (less secure):
   ```cpp
   #define DASHBOARD_URL "http://ev-secure-dashboard-v2-grf2.vercel.app"
   ```

### Issue 3: API Key Authentication Failures
**Symptoms:**
- HTTP 401 Unauthorized errors
- "Invalid or inactive API key"

**Solutions:**
1. Verify API key matches exactly:
   ```cpp
   #define API_KEY "vsr_st001_a1b2c3d4e5f6789012345678901234567890abcd"
   ```

2. Check API key in dashboard:
   - Visit `/api/keys` endpoint
   - Ensure key status is 'active'

3. Generate new API key if needed:
   ```bash
   curl -X POST https://ev-secure-dashboard-v2-grf2.vercel.app/api/keys \
     -H "Content-Type: application/json" \
     -d '{"stationId": "ST001"}'
   ```

### Issue 4: Data Format Mismatch
**Symptoms:**
- HTTP 400 Bad Request errors
- "Missing required fields" errors

**Solutions:**
1. Use the simplified data transmitter:
   ```cpp
   #include "SimpleDataTransmitter.h"
   ```

2. Ensure data structure matches API expectations:
   ```cpp
   {
     "device_id": "ST001",
     "sensor_data": {
       "current": 12.5,
       "voltage": 240.0,
       "power": 3000.0,
       "frequency": 50.0,
       "temperature": 25.5,
       "timestamp": 1234567890
     }
   }
   ```

### Issue 5: Network Timeout Issues
**Symptoms:**
- Requests timeout
- "Connection failed" errors

**Solutions:**
1. Increase timeout values:
   ```cpp
   #define CONNECTION_TIMEOUT_MS 30000
   #define READ_TIMEOUT_MS 15000
   ```

2. Implement retry logic with exponential backoff
3. Use MQTT as fallback transmission method

## Alternative Transmission Methods

### Method 1: MQTT Fallback
If HTTP API continues to fail, use MQTT:

```cpp
#include "MQTTTransmitter.h"

void setup() {
  // Initialize MQTT transmitter
  MQTTTransmitter::init();
}

void loop() {
  // Send data via MQTT
  MQTTTransmitter::sendSensorData(sensorData, mlResult, isCharging, threatDetected);
  MQTTTransmitter::loop(); // Required for MQTT
}
```

### Method 2: Direct Database Connection
For critical applications, consider direct database connection:

```cpp
// Use Firebase or similar service
#include <FirebaseESP32.h>
```

### Method 3: Local Data Storage
Store data locally and sync when connection is available:

```cpp
// Use SD card or SPIFFS for local storage
#include "SDLogger.h"
```

## Debugging Tools

### 1. Enhanced Serial Logging
Enable verbose logging:
```cpp
APIManagerImproved::setDebugLevel(DEBUG_LEVEL_VERBOSE);
```

### 2. Network Diagnostics
Add network diagnostic functions:
```cpp
void printNetworkInfo() {
  Serial.println("=== Network Information ===");
  Serial.println("WiFi Status: " + String(WiFi.status()));
  Serial.println("IP Address: " + WiFi.localIP().toString());
  Serial.println("Signal Strength: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("Gateway: " + WiFi.gatewayIP().toString());
  Serial.println("DNS: " + WiFi.dnsIP().toString());
}
```

### 3. API Response Monitoring
Monitor API responses:
```cpp
void monitorAPIResponse() {
  String response = APIManagerImproved::getLastError();
  if (response.length() > 0) {
    Serial.println("API Error: " + response);
  }
}
```

## Testing Checklist

- [ ] WiFi connection established
- [ ] Dashboard URL accessible from browser
- [ ] API endpoints responding correctly
- [ ] API key authentication working
- [ ] Data format matches API schema
- [ ] SSL certificates properly configured
- [ ] Network timeouts appropriate
- [ ] Error handling implemented
- [ ] Fallback mechanisms in place

## Emergency Procedures

### If All Else Fails:
1. **Use MQTT**: Switch to MQTT transmission method
2. **Local Storage**: Store data locally and sync later
3. **Direct Connection**: Use alternative cloud service
4. **Manual Upload**: Implement manual data upload mechanism

## Support Resources

- ESP32-S3 Documentation: https://docs.espressif.com/projects/esp-idf/en/latest/
- Arduino HTTPClient Library: https://github.com/espressif/arduino-esp32
- Vercel API Documentation: https://vercel.com/docs/concepts/functions/serverless-functions
- MQTT Broker Services: https://mqtt.org/

## Contact Information

For additional support:
- Check project GitHub repository
- Review ESP32-S3 community forums
- Consult Arduino ESP32 documentation
