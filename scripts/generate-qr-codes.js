const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

const stations = [
  { id: 'ST001', name: 'Downtown Mall - Station 1' },
  { id: 'ST002', name: 'City Center - Station 2' },
  { id: 'ST003', name: 'Airport Terminal - Station 3' },
  { id: 'ST004', name: 'Shopping Plaza - Station 4' },
  { id: 'ST005', name: 'University Campus - Station 5' },
  { id: 'ST006', name: 'Hospital Complex - Station 6' }
]

async function generateQRCodes() {
  // Ensure qr-codes directory exists
  const qrDir = path.join(__dirname, '..', 'qr-codes')
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true })
  }

  for (const station of stations) {
    const qrData = `http://localhost:5000/station-analytics/${station.id}`
    const filename = `station-${station.id}-qr.png`
    const filepath = path.join(qrDir, filename)
    
    try {
      await QRCode.toFile(filepath, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      console.log(`Generated QR code for ${station.name}: ${filename}`)
    } catch (error) {
      console.error(`Error generating QR code for ${station.id}:`, error)
    }
  }
  
  console.log('All QR codes generated successfully!')
}

generateQRCodes().catch(console.error)
