"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Camera, QrCode } from "lucide-react"

interface QRScannerProps {
  onScanSuccess: (stationId: string) => void
  onClose: () => void
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isScanning) {
      startScanner()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [isScanning])

  const startScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
    }

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    )

    scannerRef.current.render(
      (decodedText) => {
        // Extract station ID from QR code
        const stationId = extractStationId(decodedText)
        if (stationId) {
          onScanSuccess(stationId)
          stopScanner()
        } else {
          setError("Invalid QR code. Please scan a valid station QR code.")
        }
      },
      (error) => {
        // Don't show error for every failed scan attempt
        if (error.includes("No QR code found")) {
          return
        }
        setError("Failed to scan QR code. Please try again.")
      }
    )
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const extractStationId = (decodedText: string): string | null => {
    // QR code format: "STATION:ST001" or just "ST001"
    const stationMatch = decodedText.match(/STATION:?([A-Z0-9]+)/i)
    if (stationMatch) {
      return stationMatch[1].toUpperCase()
    }
    
    // If it's just a station ID like "ST001"
    if (/^ST\d+$/i.test(decodedText)) {
      return decodedText.toUpperCase()
    }
    
    // If it's a URL like "http://localhost:5000/station-analytics/ST001"
    const urlMatch = decodedText.match(/\/station-analytics\/([A-Z0-9]+)/i)
    if (urlMatch) {
      return urlMatch[1].toUpperCase()
    }
    
    return null
  }

  const handleStartScan = () => {
    setError(null)
    setIsScanning(true)
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            QR Code Scanner
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Scan Station QR Code
              </h3>
              <p className="text-gray-600 mb-6">
                Position the QR code within the camera view to scan
              </p>
              <Button
                onClick={handleStartScan}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full"></div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={stopScanner}
                className="w-full"
              >
                Stop Scanning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
