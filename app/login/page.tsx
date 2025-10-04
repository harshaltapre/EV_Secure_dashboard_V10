"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Eye, EyeOff, Shield, Lock, Mail, AlertCircle, UserCheck, Settings, Phone } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loginType, setLoginType] = useState<"user" | "admin">("user")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          type: loginType
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setIsLoading(false);
        return;
      }

      // Store user session
      localStorage.setItem('userSession', JSON.stringify({
        ...data.user,
        loginTime: new Date().toISOString()
      }));

      // Redirect based on role
      router.push(data.user.role === 'user' ? '/user-dashboard' : '/');
    } catch (error) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!phoneNumber) {
      setError("Please enter your registered phone number")
      setIsLoading(false)
      return
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+91${cleanPhone}`,
          action: 'send_otp'
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message)
        setIsLoading(false)
        return
      }

      setOtpSent(true)
      setIsLoading(false)
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+91${phoneNumber.replace(/\D/g, "")}`,
          otp: otp,
          action: 'verify_otp'
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message)
        setIsLoading(false)
        return
      }

      // Redirect to password reset page
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      router.push(`/reset-password?phone=%2B91${cleanPhone}`)
    } catch (error) {
      setError('Failed to verify OTP. Please try again.')
      setIsLoading(false)
    }
  }

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    }
    return cleaned
  }

  const handlePhoneChange = (value: string) => {
    const formatted = value.replace(/\D/g, "").slice(0, 10)
    setPhoneNumber(formatted)
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-purple-400 rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                EV-Secure
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{otpSent ? "Verify OTP" : "Forgot Password"}</h2>
            <p className="text-gray-600 mt-2">
              {otpSent
                ? "Enter the 6-digit code sent to your phone"
                : "Enter your registered phone number to receive OTP"}
            </p>
          </div>

          {/* Forgot Password Form */}
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-center text-gray-800">
                {otpSent ? "Enter OTP" : "Reset Password"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!otpSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        
                        value={formatPhoneDisplay(phoneNumber)}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="pl-10 bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enter the phone number registered with your account</p>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 text-white font-medium py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending OTP...</span>
                      </div>
                    ) : (
                      "Send OTP to Phone"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-700">
                      6-Digit OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-2xl tracking-widest bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-gray-500">OTP sent to {formatPhoneDisplay(phoneNumber)}</p>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 text-white font-medium py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp("")
                      setError("")
                    }}
                  >
                    Resend OTP
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setOtpSent(false)
                    setOtp("")
                    setPhoneNumber("")
                    setError("")
                  }}
                  className="text-purple-600 hover:text-purple-800"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              EV-Secure
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your EV-Secure account</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType("user")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
              loginType === "user" ? "bg-white shadow-sm text-gray-800" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span className="text-sm font-medium">User Login</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginType("admin")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
              loginType === "admin" ? "bg-white shadow-sm text-gray-800" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Login</span>
          </button>
        </div>

        {/* Login Form */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center text-gray-800">
              {loginType === "admin" ? "Admin Sign In" : "User Sign In"}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {loginType === "admin"
                ? "Access full dashboard and system controls"
                : "Access charging stations via QR code scanning"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-purple-600 hover:text-purple-800 p-0 h-auto"
                >
                  Forgot password?
                </Button>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 text-white font-medium py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {loginType === "user" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-purple-600 hover:text-purple-800 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Secure Access</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your connection is encrypted and secured. Use phone number for password recovery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}