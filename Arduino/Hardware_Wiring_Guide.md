# EV-Secure ESP32-S3 Hardware Wiring Guide

## 🔌 Your Hardware Components

### 1. Voltage Sensor (S, +, - terminals)
- **S** = Signal output (analog)
- **+** = Positive power supply (3.3V or 5V)
- **-** = Ground

### 2. Current Sensor (VCC, OUT, GND terminals)
- **VCC** = Power supply (3.3V or 5V)
- **OUT** = Signal output (analog)
- **GND** = Ground

### 3. RTC Module (SDA, SCL terminals)
- **SDA** = I²C Data line
- **SCL** = I²C Clock line

### 4. TFT 1.8" Display with SD Card
**SD Card pins**: NC, CS, MOSI, MISO, CLK
**TFT pins**: CS, SCK, SD, SDA, RST, NC, BL, NC, VCC, GND

## 📋 Complete Wiring Diagram

```
ESP32-S3 DevKit Pinout:
┌─────────────────────────────────────┐
│  ESP32-S3 DevKit                    │
│                                     │
│  GPIO1  ←→ Current Sensor OUT      │
│  GPIO2  ←→ Voltage Sensor S        │
│  GPIO3  ←→ Temperature Sensor       │
│  GPIO10 ←→ SD Card CS              │
│  GPIO11 ←→ SD Card MOSI            │
│  GPIO12 ←→ SD Card CLK             │
│  GPIO13 ←→ SD Card MISO                          │
│  GPIO16 ←→ Emergency Stop Button   │
│  GPIO18 ←→ Relay Control           │
│  GPIO19 ←→ Status LED              │
│  GPIO21 ←→ RTC SDA (I²C)          │
│  GPIO47 ←→ RTC SCL (I²C)          │
│    │
│  3.3V   ←→ Power for sensors       │
│  GND    ←→ Common ground          │
└─────────────────────────────────────┘
```

## 🔗 Detailed Connections

### Power Supply
```
ESP32-S3 3.3V → Voltage Sensor +
ESP32-S3 3.3V → Current Sensor VCC
ESP32-S3 3.3V → RTC Module VCC
ESP32-S3 3.3V → TFT VCC
ESP32-S3 GND  → Voltage Sensor -
ESP32-S3 GND  → Current Sensor GND
ESP32-S3 GND  → RTC Module GND
ESP32-S3 GND  → TFT GND
ESP32-S3 GND  → Emergency Stop Button (one terminal)
```

### Sensor Connections
```
Voltage Sensor:
S (Signal) → GPIO2 (ADC1_CH1)

Current Sensor:
OUT (Signal) → GPIO1 (ADC1_CH0)

Temperature Sensor (DS18B20):
Data → GPIO3
VCC → 3.3V
GND → GND
```

### I²C Connections (RTC Module)
```
RTC Module SDA → GPIO21
RTC Module SCL → GPIO22
```

### SD Card Connections (SPI)
```
SD Card CS   → GPIO10
SD Card MOSI → GPIO11
SD Card CLK  → GPIO12
SD Card MISO → GPIO13
```

### TFT Display Connections (SPI)
```
define TFT_MOSI_PIN 35   // DIN (as you requested)
#define TFT_MISO_PIN -1   // not used for TFT
#define TFT_SCK_PIN  36   // CLK (as you requested)
#define TFT_CS_PIN   10   // <-- CS updated to GPIO10
#define TFT_DC_PIN   14   // D/C
#define TFT_RST_PIN  15   // Reset
#define TFT_BL_PIN   5    // Backlight
```

### Control Connections
```
Relay Control → GPIO18
Status LED    → GPIO19 (UPDATED: moved from GPIO2 to avoid conflict with voltage sensor)
Buzzer        → GPIO4
Emergency Stop Button → GPIO16 (other terminal to GND)
```

## ⚡ Power Requirements

### ESP32-S3 Power
- **Input**: 5V via USB or external supply
- **Internal**: 3.3V regulated output
- **Current**: ~500mA during operation

### Sensor Power Requirements
- **Voltage Sensor**: 3.3V, ~10mA
- **Current Sensor**: 3.3V, ~10mA
- **RTC Module**: 3.3V, ~1mA
- **TFT Display**: 3.3V, ~50mA
- **SD Card**: 3.3V, ~20mA

### Total Power Consumption
- **Idle**: ~100mA
- **Active**: ~200mA
- **Peak**: ~300mA

## 🛠️ Assembly Steps

### Step 1: Power Connections
1. Connect all GND terminals together
2. Connect all VCC/3.3V terminals to ESP32-S3 3.3V
3. Verify power supply can handle total current

### Step 2: Sensor Connections
1. Connect voltage sensor signal to GPIO2
2. Connect current sensor signal to GPIO1
3. Connect temperature sensor to GPIO3

### Step 3: I²C Connections
1. Connect RTC SDA to GPIO21
2. Connect RTC SCL to GPIO22
3. Add 4.7kΩ pull-up resistors (optional, ESP32-S3 has internal pull-ups)

### Step 4: SPI Connections
1. Connect SD card SPI pins (CS, MOSI, MISO, CLK)
2. Connect TFT SPI pins (CS, MOSI, MISO, CLK)
3. Connect TFT control pins (DC, RST)

### Step 5: Control Connections
1. Connect relay control to GPIO18
2. Connect status LED to GPIO2
3. Connect buzzer to GPIO4
4. Connect emergency stop button to GPIO16

## 🔍 Testing Connections

### Before Power On:
1. **Double-check all connections**
2. **Verify no short circuits**
3. **Check power supply voltage**
4. **Ensure proper grounding**

### After Power On:
1. **Check 3.3V supply voltage**
2. **Verify sensor readings in Serial Monitor**
3. **Test display initialization**
4. **Check SD card detection**
5. **Verify I²C communication**

## ⚠️ Safety Considerations

### Electrical Safety:
- **Use proper insulation**
- **Avoid loose connections**
- **Use appropriate wire gauge**
- **Follow local electrical codes**

### Component Protection:
- **Add protection diodes for inductive loads**
- **Use proper voltage dividers**
- **Implement current limiting**
- **Add fuses for protection**

## 🔧 Troubleshooting

### Common Issues:

1. **Sensor readings incorrect**
   - Check power supply voltage
   - Verify signal connections
   - Check for loose connections

2. **Display not working**
   - Verify SPI connections
   - Check power supply
   - Ensure proper initialization

3. **SD card not detected**
   - Check SPI connections
   - Verify card formatting (FAT32)
   - Check power supply

4. **I²C communication failed**
   - Check SDA/SCL connections
   - Verify pull-up resistors
   - Check device addresses

## 📊 Pin Usage Summary

| GPIO | Function | Component | Notes |
|------|----------|-----------|-------|
| GPIO1 | ADC Input | Current Sensor | Analog reading |
| GPIO2 | ADC Input | Voltage Sensor | Analog reading |
| GPIO3 | Digital I/O | Temperature Sensor | OneWire |
| GPIO10 | SPI CS | SD Card | Chip Select |
| GPIO11 | SPI MOSI | SD Card | Master Out |
| GPIO12 | SPI CLK | SD Card | Clock |
| GPIO13 | SPI MISO | SD Card | Master In |
| GPIO14 | Digital I/O | TFT DC | Data/Command |
| GPIO15 | Digital I/O | TFT RST | Reset |
| GPIO16 | Digital Input | Emergency Stop | Pull-up |
| GPIO18 | Digital Output | Relay Control | Power control |
| GPIO19 | Digital Output | Status LED | System status |
| GPIO21 | I²C SDA | RTC Module | Data line |
| GPIO47 | I²C SCL | RTC Module | Clock line |
| GPIO34 | SPI CS | TFT Display | Chip Select |
| GPIO35 | SPI MOSI | TFT Display | Master Out |
| GPIO36 | SPI CLK | TFT Display | Clock |
| GPIO37 | SPI MISO | TFT Display | Master In |

## 🎯 Next Steps

1. **Wire all components** according to this guide
2. **Test individual components** before full integration
3. **Upload firmware** using Arduino IDE
4. **Monitor Serial output** for initialization status
5. **Calibrate sensors** for accurate readings
6. **Test all functions** before deployment

---

**Your EV-Secure ESP32-S3 system is now ready for assembly!**
