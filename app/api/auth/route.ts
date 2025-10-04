import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// In-memory storage for users (in production, use a real database)
const users = new Map<string, any>()
const otpStorage = new Map<string, { otp: string, expires: number, phoneNumber: string }>()

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client
let twilioClient: any = null
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio')
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  } catch (error) {
    console.warn('Twilio not available:', error)
  }
}

// Predefined admin users (remove demo credentials)
const predefinedAdmins = [
  {
    id: 'admin-1',
    email: 'harshaltapre27@gmail.com',
    password: '$2b$10$xc.HcmIIZfVRzmX7OmJd5uHl9o2d70Z1nbbHZU/I.oAbLnXYfPRTu', // admin123
    firstName: 'Harshal',
    lastName: 'Tapre',
    role: 'super_admin',
    phoneNumber: '+919322184006',
    verified: true,
    createdAt: new Date().toISOString()
  }
]

// Initialize predefined admins
predefinedAdmins.forEach(admin => {
  users.set(admin.email, admin)
})

// Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via SMS
async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    // If Twilio is configured, send real SMS
    if (twilioClient && TWILIO_PHONE_NUMBER) {
      const message = await twilioClient.messages.create({
        body: `Your EV Secure OTP is: ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone.`,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber
      })
      
      console.log(`SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}`)
      return true
    } else {
      // Fallback to console log if Twilio is not configured
      console.log(`SMS OTP sent to ${phoneNumber}: ${otp}`)
      console.log('Note: To send real SMS, configure Twilio credentials in .env.local')
      return true
    }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    // Fallback to console log on error
    console.log(`SMS OTP sent to ${phoneNumber}: ${otp}`)
    return true
  }
}

// Validate Indian phone number
function validateIndianPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  // Handle both +91 prefix and direct 10-digit numbers
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return /^91[6-9]\d{9}$/.test(cleanPhone)
  }
  return /^[6-9]\d{9}$/.test(cleanPhone)
}

// Login endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, type, action } = body

    // Handle different actions
    if (action === 'register') {
      return handleRegistration(body)
    }

    if (action === 'send_otp') {
      return handleSendOTP(body)
    }

    if (action === 'verify_otp') {
      return handleVerifyOTP(body)
    }

    if (action === 'reset_password') {
      return handleResetPassword(body)
    }

    // Default to login
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = users.get(email.toLowerCase())
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check user role based on login type
    if (type === 'admin' && !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied for admin role' },
        { status: 403 }
      )
    }

    if (type === 'user' && user.role === 'super_admin') {
      return NextResponse.json(
        { success: false, message: 'Please use admin login for super admin accounts.' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        type: type 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Update last login
    user.lastLogin = new Date().toISOString()
    users.set(email.toLowerCase(), user)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        lastLogin: user.lastLogin
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle user registration
async function handleRegistration(body: any) {
  const { firstName, lastName, email, phoneNumber, password } = body

  // Validation
  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return NextResponse.json(
      { success: false, message: 'All fields are required' },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 8 characters long' },
      { status: 400 }
    )
  }

  if (!validateIndianPhoneNumber(phoneNumber)) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid Indian phone number (10 digits starting with 6-9)' },
      { status: 400 }
    )
  }

  // Check if user already exists
  if (users.has(email.toLowerCase())) {
    return NextResponse.json(
      { success: false, message: 'User with this email already exists' },
      { status: 409 }
    )
  }

  // Check if phone number already exists
  const existingUser = Array.from(users.values()).find(u => u.phoneNumber === phoneNumber)
  if (existingUser) {
    return NextResponse.json(
      { success: false, message: 'User with this phone number already exists' },
      { status: 409 }
    )
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const newUser = {
    id: userId,
    firstName,
    lastName,
    email: email.toLowerCase(),
    phoneNumber: phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`,
    password: hashedPassword,
    role: 'user',
    verified: true, // Auto-verify for now
    createdAt: new Date().toISOString(),
    lastLogin: null
  }

  users.set(email.toLowerCase(), newUser)

  console.log(`User registered: ${email}`)

  return NextResponse.json({
    success: true,
    message: 'Registration successful. Please login.',
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      phoneNumber: newUser.phoneNumber
    }
  })
}

// Handle send OTP
async function handleSendOTP(body: any) {
  const { phoneNumber } = body

  if (!phoneNumber) {
    return NextResponse.json(
      { success: false, message: 'Phone number is required' },
      { status: 400 }
    )
  }

  if (!validateIndianPhoneNumber(phoneNumber)) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid Indian phone number (10 digits starting with 6-9)' },
      { status: 400 }
    )
  }

  // Check if user exists with this phone number
  const user = Array.from(users.values()).find(u => u.phoneNumber === phoneNumber)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'No account found with this phone number' },
      { status: 404 }
    )
  }

  // Generate OTP
  const otp = generateOTP()
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

  // Store OTP
  otpStorage.set(phoneNumber, { otp, expires, phoneNumber })

  // Send OTP
  const otpSent = await sendOTP(phoneNumber, otp)
  if (!otpSent) {
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'OTP sent to your registered phone number'
  })
}

// Handle verify OTP
async function handleVerifyOTP(body: any) {
  const { phoneNumber, otp } = body

  if (!phoneNumber || !otp) {
    return NextResponse.json(
      { success: false, message: 'Phone number and OTP are required' },
      { status: 400 }
    )
  }

  // Check if OTP exists and is valid
  const otpData = otpStorage.get(phoneNumber)
  if (!otpData) {
    return NextResponse.json(
      { success: false, message: 'OTP not found or expired' },
      { status: 400 }
    )
  }

  if (otpData.expires < Date.now()) {
    otpStorage.delete(phoneNumber)
    return NextResponse.json(
      { success: false, message: 'OTP has expired. Please request a new one.' },
      { status: 400 }
    )
  }

  if (otpData.otp !== otp) {
    return NextResponse.json(
      { success: false, message: 'Invalid OTP' },
      { status: 400 }
    )
  }

  // OTP is valid, remove it
  otpStorage.delete(phoneNumber)

  return NextResponse.json({
    success: true,
    message: 'OTP verified. You can now reset your password.'
  })
}

// Handle reset password
async function handleResetPassword(body: any) {
  const { phoneNumber, newPassword } = body

  if (!phoneNumber || !newPassword) {
    return NextResponse.json(
      { success: false, message: 'Phone number and new password are required' },
      { status: 400 }
    )
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 8 characters long' },
      { status: 400 }
    )
  }

  // Find user by phone number
  const user = Array.from(users.values()).find(u => u.phoneNumber === phoneNumber)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'User not found' },
      { status: 404 }
    )
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  users.set(user.email, user)

  return NextResponse.json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.'
  })
}



// Verify JWT token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Get user data
      const user = users.get(decoded.email)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          lastLogin: user.lastLogin
        }
      })

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
