"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Eye, EyeOff, Shield, Lock, Mail, Phone, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  const validatePassword = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const validatePhoneNumber = (phone: string) => {
    // Indian phone number validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\D/g, ""))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    else if (!validatePhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = "Phone number must be 10 digits starting with 6-9"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!data.success) {
        setErrors({ general: data.message })
        setIsLoading(false)
        return
      }

      alert("Account created successfully! Please login with your credentials.")
      window.location.href = "/login"
    } catch (error) {
      setErrors({ general: 'Failed to create account. Please try again.' })
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "password") {
      setPasswordStrength(validatePassword(value as string))
    }

    if (field === "phoneNumber") {
      // Format phone number as user types - only allow digits and limit to 10
      const formatted = (value as string).replace(/\D/g, "").slice(0, 10)
      setFormData((prev) => ({ ...prev, [field]: formatted }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length >= 5) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`
    }
    return cleaned
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
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-2">Join EV-Secure to access charging stations</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center text-gray-800">Sign Up</CardTitle>
            <CardDescription className="text-center text-gray-600">Create your account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Raj"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Sharma"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="raj.sharma@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    required
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="98765 43210"
                      value={formatPhoneDisplay(formData.phoneNumber)}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className={`pl-10 rounded-l-none bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${
                        errors.phoneNumber ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                </div>
                {errors.phoneNumber && <p className="text-xs text-red-600">{errors.phoneNumber}</p>}
                <p className="text-xs text-gray-500">Required for OTP verification and account recovery</p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${
                      errors.password ? "border-red-500" : ""
                    }`}
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
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-10 bg-white/50 border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs">Passwords match</span>
                  </div>
                )}
                {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Terms Agreement */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-800">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-800">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && <p className="text-xs text-red-600">{errors.agreeToTerms}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 text-white font-medium py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            {/* User Role Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-700">
                    <strong>End User Account:</strong> You'll have access to charging stations via QR code scanning and
                    payment. Limited dashboard access for your charging sessions only.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Secure Registration</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your data is protected with enterprise-grade security. Mobile number is used for OTP verification and
                account recovery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}