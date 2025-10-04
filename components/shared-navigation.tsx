"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Menu, Home, Database, FileText, Map, User, Settings, Shield, Bell, X, LogOut, Code } from "lucide-react"
import { useRouter } from "next/navigation"

interface NavigationProps {
  currentPage?: string
}

export function SharedNavigation({ currentPage = "" }: NavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/", id: "dashboard" },
    { icon: Zap, label: "Stations", href: "/stations", id: "stations" },
    { icon: Shield, label: "Threat Logs", href: "/threats", id: "threats" },
    { icon: Map, label: "Map View", href: "/map", id: "map" },
    { icon: FileText, label: "Reports", href: "/reports", id: "reports" },
    { icon: Database, label: "Analytics", href: "/analytics", id: "analytics" },
    { icon: Code, label: "Code Generator", href: "/code-generator", id: "code-generator" },
    { icon: Settings, label: "Settings", href: "/settings", id: "settings" },
    { icon: User, label: "Profile", href: "/profile", id: "profile" },
  ]

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.removeItem("userSession")
    sessionStorage.clear()

    // Redirect to login page
    router.push("/login")
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-purple-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              EV-Secure
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-purple-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              EV-Secure
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-5 h-5 text-gray-600 hover:text-red-600" />
          </Button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 text-left ${
                currentPage === item.id || (currentPage === "" && item.id === "dashboard")
                  ? "bg-gradient-to-r from-green-100 to-purple-100 text-gray-800 shadow-lg border border-white/30"
                  : "text-gray-600 hover:bg-white/50 hover:text-gray-800 hover:shadow-md"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  currentPage === item.id || (currentPage === "" && item.id === "dashboard") ? "text-purple-600" : ""
                }`}
              />
              <span className="font-medium text-left truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl lg:hidden">
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                  EV-Secure
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="mt-8 px-4 space-y-2">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    currentPage === item.id || (currentPage === "" && item.id === "dashboard")
                      ? "bg-gradient-to-r from-green-100 to-purple-100 text-gray-800 shadow-lg border border-white/30"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-800 hover:shadow-md"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      currentPage === item.id || (currentPage === "" && item.id === "dashboard")
                        ? "text-purple-600"
                        : ""
                    }`}
                  />
                  <span className="font-medium text-left truncate">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
