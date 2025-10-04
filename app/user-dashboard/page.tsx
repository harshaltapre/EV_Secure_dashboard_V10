"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  QrCode,
  Battery,
  Activity,
  AlertTriangle,
  LogOut,
  Camera,
} from "lucide-react"
import { useRouter } from "next/navigation"
import QRScanner from "@/components/qr-scanner"


export default function UserDashboard() {
  const [showQRScanner, setShowQRScanner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and has proper role
    const userSession = localStorage.getItem("userSession")
    if (!userSession) {
      router.push("/login")
      return
    }

    const session = JSON.parse(userSession)
    if (session.role !== "user") {
      router.push("/") // Redirect admins to main dashboard
      return
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userSession")
    sessionStorage.clear()
    router.push("/login")
  }

  const handleQRScan = () => {
    setShowQRScanner(true)
  }

  const handleQRScanSuccess = (stationId: string) => {
    setShowQRScanner(false)
    // Redirect to station analytics page
    router.push(`/station-analytics/${stationId}`)
  }

  const handleQRScanClose = () => {
    setShowQRScanner(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-purple-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              EV-Secure
            </span>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              User Dashboard
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome to EV-Secure</h1>
          <p className="text-gray-600">Scan QR codes at charging stations to view their analytics and status</p>
        </div>

        {/* QR Code Scanner */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              Scan Station QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Scan Station QR Code</h3>
              <p className="text-gray-600 mb-6">Point your camera at any station QR code to view its analytics</p>
              <Button
                onClick={handleQRScan}
                className="bg-gradient-to-r from-green-500 to-purple-500 text-white"
                disabled={showQRScanner}
              >
                {showQRScanner ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scanning...</span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Open Camera & Scan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner
            onScanSuccess={handleQRScanSuccess}
            onClose={handleQRScanClose}
          />
        )}


        {/* How It Works */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-600" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">1. Scan QR Code</h4>
                  <p className="text-gray-600">Point your camera at any station QR code</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">2. View Analytics</h4>
                  <p className="text-gray-600">See real-time station data and status</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Battery className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">3. Monitor Charging</h4>
                  <p className="text-gray-600">Track battery level and security status</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Limitations Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Limited Access Account</h4>
              <p className="text-sm text-blue-700">
                As an end user, you can only access charging stations through QR code scanning and payment. You cannot
                view other stations' data or access administrative functions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
