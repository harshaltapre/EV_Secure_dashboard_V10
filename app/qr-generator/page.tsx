"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"

const stationData = [
  {
    id: "ST001",
    name: "Downtown Mall - Station 1",
    location: "123 Main St, Downtown",
    power: "7.2 kW",
  },
  {
    id: "ST002", 
    name: "City Center - Station 2",
    location: "456 Center Ave, City Center",
    power: "11.0 kW",
  },
  {
    id: "ST003",
    name: "Airport Terminal - Station 3", 
    location: "789 Airport Blvd, Terminal A",
    power: "22.0 kW",
  },
  {
    id: "ST004",
    name: "Shopping Plaza - Station 4",
    location: "321 Plaza Dr, Shopping District", 
    power: "7.2 kW",
  },
  {
    id: "ST005",
    name: "University Campus - Station 5",
    location: "654 Campus Rd, University",
    power: "11.0 kW",
  },
  {
    id: "ST006",
    name: "Hospital Complex - Station 6",
    location: "987 Medical Way, Health District",
    power: "22.0 kW",
  },
]

export default function QRGenerator() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<string | null>(null)

  const generateQRData = (stationId: string) => {
    return `http://localhost:5000/station-analytics/${stationId}`
  }

  const downloadQRCode = (stationId: string) => {
    const svg = document.getElementById(`qr-${stationId}`)
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `station-${stationId}-qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">QR Code Generator</h1>
              <p className="text-sm text-gray-600">Generate QR codes for charging stations</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Instructions */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Each QR code contains a direct URL to the station's analytics page</p>
              <p>• When scanned with any QR scanner app (Google, iPhone, etc.), it opens the analytics page</p>
              <p>• Click "Download" to save individual QR codes as PNG files</p>
              <p>• QR codes can be printed and placed at charging stations</p>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stationData.map((station) => (
            <Card key={station.id} className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{station.name}</CardTitle>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">ID: {station.id}</p>
                  <p className="text-sm text-gray-600">{station.location}</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {station.power}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <QRCode
                      id={`qr-${station.id}`}
                      value={generateQRData(station.id)}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">QR Data: {generateQRData(station.id)}</p>
                  <Button
                    onClick={() => downloadQRCode(station.id)}
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bulk Download */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Download all QR codes as individual PNG files
              </p>
              <Button
                onClick={() => {
                  stationData.forEach((station) => {
                    setTimeout(() => downloadQRCode(station.id), stationData.indexOf(station) * 500)
                  })
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All QR Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
