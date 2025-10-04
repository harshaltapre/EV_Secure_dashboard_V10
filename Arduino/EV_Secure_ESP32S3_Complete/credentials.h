/*
 * WiFi and API Credentials Configuration
 * Update these values for your specific setup
 */

#ifndef CREDENTIALS_H
#define CREDENTIALS_H

// ============================================================================
// WIFI CREDENTIALS
// ============================================================================
#define WIFI_SSID "harshal"                    // Your WiFi network name
#define WIFI_PASSWORD "harshal27"              // Your WiFi password

// ============================================================================
// DASHBOARD API CONFIGURATION
// ============================================================================
// Primary dashboard URL and API key (ensure these match your deployed backend)
#define DASHBOARD_URL "https://ev-secure-dashboard-v5.vercel.app"  // Your hosted dashboard URL (v5)
#define API_KEY "vsr_st001_a1b2c3d4e5f6789012345678901234567890abcd"       // Your station API key (ST001)

// Alternate dashboard URLs (used automatically as fallbacks in code)
#define ALT_DASHBOARD_URL_1 "https://ev-secure-dashboard-v3.vercel.app"
#define ALT_DASHBOARD_URL_2 "https://ev-secure-dashboard-v2-grf2.vercel.app"
#define ALT_DASHBOARD_URL_3 "http://ev-secure-dashboard-v4.vercel.app"  // HTTP fallback (dev only)

// ============================================================================
// DEVICE CONFIGURATION
// ============================================================================
#define DEVICE_ID "ST001"                      // Your station ID
#define STATION_NAME "EV Station 001"          // Human-readable station name
#define LOCATION "Building A, Floor 1"         // Station location

// ============================================================================
// ALTERNATIVE WIFI NETWORKS (Backup)
// ============================================================================
// Uncomment and configure if you have backup networks
// #define BACKUP_WIFI_SSID "backup_network"
// #define BACKUP_WIFI_PASSWORD "backup_password"

// ============================================================================
// API ENDPOINTS
// ============================================================================
#define API_DATA_ENDPOINT "/api/data"
#define API_COMMANDS_ENDPOINT "/api/commands"
#define API_ALERTS_ENDPOINT "/api/alerts"
#define API_STATUS_ENDPOINT "/api/status"

// ============================================================================
// SECURITY SETTINGS
// ============================================================================
#define SSL_ENABLED true                       // Enable HTTPS
#define CERT_VERIFICATION false                // Skip certificate verification for development

#endif // CREDENTIALS_H
