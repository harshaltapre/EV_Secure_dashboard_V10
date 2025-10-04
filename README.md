# Vsora dashboard

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/harshaltetc22-9374s-projects/v0-vsora-dashboard)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/G5e6InOLyrP)

## Overview

This is the EV-Secure Dashboard - a comprehensive monitoring and control system for EV charging stations with ESP32-S3 integration.

## Features

- **Real-time Monitoring**: Live data from ESP32-S3 charging stations
- **API Key Management**: Generate unique API keys for each station
- **Arduino Code Generator**: Automatically generate customized Arduino code for each station
- **Threat Detection**: ML-powered anomaly detection and security monitoring
- **Multi-Station Support**: Manage multiple charging stations from one dashboard
- **User Management**: Admin and end-user access levels

## ESP32-S3 Integration

### API Key System
Each ESP32-S3 station requires a unique API key for authentication:
1. Go to Settings → API Keys
2. Generate a key for your station (ST001, ST002, etc.)
3. Use the Code Generator to get customized Arduino code
4. Copy the generated code into your `EV_Secure_Config.h` file
5. Upload to your ESP32-S3 device

### Supported Stations
- **ST001**: Downtown Plaza
- **ST002**: Mall Parking  
- **ST003**: Airport Terminal
- **ST004**: University Campus

### Arduino Code Structure
The system includes complete Arduino libraries for ESP32-S3:
- `EV_Secure_Config.h` - Main configuration file
- `SensorManager.h` - Sensor reading and management
- `DisplayManager.h` - TFT display control
- `APIManager.h` - Dashboard communication
- `MLModel.h` - Machine learning threat detection
- `SDLogger.h` - Data logging to SD card
- `RelayController.h` - Power control and safety

## Deployment

Your project is live at:

**[https://vercel.com/harshaltetc22-9374s-projects/v0-vsora-dashboard](https://vercel.com/harshaltetc22-9374s-projects/v0-vsora-dashboard)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/G5e6InOLyrP](https://v0.dev/chat/projects/G5e6InOLyrP)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## API Endpoints

The dashboard provides REST API endpoints for ESP32-S3 communication:
- `POST /api/data` - Receive sensor data from stations
- `GET /api/commands` - Send commands to stations
- `POST /api/alerts` - Receive threat alerts
- `GET /api/status` - Health check endpoint

## Getting Started

1. **Dashboard Setup**:
   - Deploy the dashboard to Vercel or run locally
   - Create admin accounts through the login system
   - Generate API keys for your stations

2. **ESP32-S3 Setup**:
   - Use the Code Generator to get customized Arduino code
   - Update WiFi credentials in the generated code
   - Upload to your ESP32-S3 device
   - Monitor connection status in the dashboard

3. **Testing**:
   - Use the provided test script: `python test_api_endpoints.py`
   - Monitor real-time data in the dashboard
   - Test threat detection and alerts# Megaproject-1
# Megaproject-1
# EV_secure_Dashboard_V4
# EV_Secure_dashboard_V5
