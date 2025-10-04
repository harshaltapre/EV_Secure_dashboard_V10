"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/terms", "/privacy"]

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for public routes
      if (publicRoutes.includes(pathname)) {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // Check if user is logged in
      const userSession = localStorage.getItem("userSession")

      if (!userSession) {
        // No session found, redirect to login
        router.push("/login")
        setIsLoading(false)
        return
      }

      try {
        const session = JSON.parse(userSession)

        // Check if session is valid (not expired)
        const loginTime = new Date(session.loginTime)
        const now = new Date()
        const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

        if (hoursSinceLogin > 24) {
          // Session expired (24 hours), clear and redirect to login
          localStorage.removeItem("userSession")
          router.push("/login")
          setIsLoading(false)
          return
        }

        // Valid session found
        setIsAuthenticated(true)

        // Route based on user role
        if (session.role === "end_user" && pathname === "/") {
          // End users should go to user dashboard, not main dashboard
          router.push("/user-dashboard")
        } else if ((session.role === "admin" || session.role === "super_admin") && pathname === "/user-dashboard") {
          // Admins should go to main dashboard, not user dashboard
          router.push("/")
        }
      } catch (error) {
        // Invalid session data, clear and redirect to login
        localStorage.removeItem("userSession")
        router.push("/login")
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
            EV-Secure
          </h2>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated (except for public routes)
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
