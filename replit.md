# EV-Secure Dashboard - Replit Project

## Overview
This is a comprehensive monitoring and control system for EV charging stations with ESP32-S3 integration. The project is built with Next.js 15, TypeScript, and Tailwind CSS 4, providing real-time monitoring, API key management, and threat detection capabilities.

## Project Architecture
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with new @import syntax
- **UI Components**: Radix UI with custom components
- **Build System**: Next.js built-in compiler
- **Package Manager**: npm
- **Host Configuration**: Configured for Replit proxy environment

## Current State
- ✅ Dependencies installed and verified
- ✅ Next.js configured for Replit environment (allows all hosts)
- ✅ Development server running on port 5000
- ✅ Production deployment configured (autoscale)
- ✅ Tailwind CSS 4 working correctly
- ✅ API routes functional for ESP32 integration

## Recent Changes (September 20, 2025)
- Imported from GitHub and set up in Replit environment
- Updated package.json scripts to use host 0.0.0.0 and port 5000
- Configured Next.js headers for cache control in Replit environment
- Set up development workflow and production deployment configuration
- Verified all components and API endpoints are working

## Key Features
1. **Real-time Dashboard**: Live monitoring of EV charging stations
2. **ESP32-S3 Integration**: API endpoints for hardware communication
3. **API Key Management**: Generate and manage station authentication keys
4. **Arduino Code Generator**: Automated code generation for ESP32 devices
5. **Threat Detection**: ML-powered anomaly detection system
6. **Multi-Station Support**: Management of multiple charging locations
7. **User Management**: Admin and end-user access control

## File Structure
- `app/` - Next.js App Router pages and API routes
  - `api/` - REST API endpoints for ESP32 communication
  - Individual page components for different dashboard sections
- `components/` - Reusable React components
  - `ui/` - Radix UI-based components
- `Arduino/` - ESP32-S3 firmware and configuration files
- `evsecure-firmware/` - C/C++ firmware components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `public/` - Static assets
- `styles/` - Global CSS with Tailwind configuration

## API Endpoints
- `GET/POST /api/status` - Station health checks and status updates
- `POST /api/data` - Sensor data collection from stations
- `GET /api/commands` - Command dispatch to stations
- `POST /api/alerts` - Threat and security alerts
- `GET /api/keys` - API key management

## Development
- Run development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm run start`
- Lint code: `npm run lint`

## Deployment
- **Type**: Autoscale (stateless web application)
- **Build Command**: npm run build
- **Start Command**: npm run start
- **Port**: 5000 (configured for Replit environment)

## User Preferences
- Uses modern Next.js patterns with App Router
- Follows TypeScript best practices
- Implements responsive design with Tailwind CSS
- Maintains clean component architecture
- Includes comprehensive error handling

## Notes
- The project includes Arduino/ESP32 firmware code for hardware integration
- API keys are managed in-memory for development (consider database for production)
- Images are set to unoptimized for better compatibility
- Build and type errors are ignored in configuration for rapid development