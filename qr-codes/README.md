# EV-Secure Station QR Codes

This folder contains QR codes for all 6 charging stations in the EV-Secure system.

## QR Code Files

| Station ID | Station Name | QR Code File |
|------------|--------------|--------------|
| ST001 | Downtown Mall - Station 1 | station-ST001-qr.png |
| ST002 | City Center - Station 2 | station-ST002-qr.png |
| ST003 | Airport Terminal - Station 3 | station-ST003-qr.png |
| ST004 | Shopping Plaza - Station 4 | station-ST004-qr.png |
| ST005 | University Campus - Station 5 | station-ST005-qr.png |
| ST006 | Hospital Complex - Station 6 | station-ST006-qr.png |

## QR Code Format

Each QR code contains a direct URL to the station's analytics page:

For example:
- ST001 QR code contains: `http://localhost:5000/station-analytics/ST001`
- ST002 QR code contains: `http://localhost:5000/station-analytics/ST002`
- And so on...

## Usage

1. Print these QR codes and place them at their respective charging stations
2. Users can scan these QR codes with **any QR scanner app** (Google Lens, iPhone Camera, etc.)
3. After scanning, users will be **automatically redirected** to the station's analytics page showing:
   - Battery charging percentage
   - Security status (secure/not secure)
   - Charging time estimates
   - Live charging metrics
   - Station information

## Testing

To test the QR codes:
1. **Method 1 - External Scanner**: Use Google Lens, iPhone Camera, or any QR scanner app to scan the QR codes
2. **Method 2 - Built-in Scanner**: Open the EV-Secure dashboard at `http://localhost:5000/user-dashboard` and click "Open Camera & Scan"
3. Both methods will redirect you to the station's analytics page

## Regenerating QR Codes

If you need to regenerate the QR codes, run:
```bash
node scripts/generate-qr-codes.js
```

This will create new QR code images in this folder.
