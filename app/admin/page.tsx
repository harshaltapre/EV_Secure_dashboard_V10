"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UserPlus,
  Users,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Mail,
  Lock,
  User,
  Building,
} from "lucide-react"
import { SharedNavigation } from "@/components/shared-navigation"

const existingAdmins = [
  {
    id: 1,
    name: "Harshal Tapre",
    email: "harshaltapre27@gmail.com",
    role: "Super Admin",
    status: "active",
    lastLogin: "2 hours ago",
    createdAt: "2023-01-15",
  },
  {
    id: 2,
    name: "John Smith",
    email: "john.smith@evsecure.com",
    role: "Admin",
    status: "active",
    lastLogin: "1 day ago",
    createdAt: "2023-03-20",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah.johnson@evsecure.com",
    role: "Admin",
    status: "inactive",
    lastLogin: "1 week ago",
    createdAt: "2023-05-10",
  },
]

export default function AdminPage() {
  const [admins, setAdmins] = useState(existingAdmins)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
    organization: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!newAdmin.name.trim()) newErrors.name = "Name is required"
    if (!newAdmin.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) newErrors.email = "Email is invalid"
    if (!newAdmin.password) newErrors.password = "Password is required"
    else if (newAdmin.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (!newAdmin.organization.trim()) newErrors.organization = "Organization is required"

    // Check if email already exists
    if (admins.some((admin) => admin.email === newAdmin.email)) {
      newErrors.email = "Email already exists"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      const admin = {
        id: admins.length + 1,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        status: "active" as const,
        lastLogin: "Never",
        createdAt: new Date().toISOString().split("T")[0],
      }

      setAdmins((prev) => [...prev, admin])
      setNewAdmin({ name: "", email: "", password: "", role: "Admin", organization: "" })
      setShowAddForm(false)
      setIsLoading(false)
    }, 1500)
  }

  const handleDeleteAdmin = (id: number) => {
    if (confirm("Are you sure you want to delete this admin account?")) {
      setAdmins((prev) => prev.filter((admin) => admin.id !== id))
    }
  }

  const handleToggleStatus = (id: number) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === id ? { ...admin, status: admin.status === "active" ? "inactive" : "active" } : admin,
      ),
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setNewAdmin((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="admin" />

      <div className="lg:ml-64 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              Admin Management
            </h1>
            <p className="text-gray-600 mt-1">Manage administrator accounts and permissions</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-purple-500 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Admins</p>
                  <p className="text-2xl font-bold text-gray-800">{admins.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Admins</p>
                  <p className="text-2xl font-bold text-green-600">
                    {admins.filter((admin) => admin.status === "active").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Super Admins</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {admins.filter((admin) => admin.role === "Super Admin").length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Admin Form */}
        {showAddForm && (
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Add New Administrator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Enter full name"
                        value={newAdmin.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`pl-10 bg-white/50 ${errors.name ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@evsecure.com"
                        value={newAdmin.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-10 bg-white/50 ${errors.email ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
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
                        placeholder="Create secure password"
                        value={newAdmin.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`pl-10 pr-10 bg-white/50 ${errors.password ? "border-red-500" : ""}`}
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
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700">
                      Admin Role
                    </Label>
                    <Select value={newAdmin.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger className="bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="organization" className="text-gray-700">
                      Organization
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="organization"
                        placeholder="Organization name"
                        value={newAdmin.organization}
                        onChange={(e) => handleInputChange("organization", e.target.value)}
                        className={`pl-10 bg-white/50 ${errors.organization ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.organization && <p className="text-xs text-red-600">{errors.organization}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Admin Account"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewAdmin({ name: "", email: "", password: "", role: "Admin", organization: "" })
                      setErrors({})
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Admin List */}
        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Administrator Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{admin.name}</h4>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={admin.role === "Super Admin" ? "destructive" : "default"} className="text-xs">
                          {admin.role}
                        </Badge>
                        <Badge
                          variant={admin.status === "active" ? "default" : "secondary"}
                          className={
                            admin.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }
                        >
                          {admin.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-gray-600">
                      <p>Last login: {admin.lastLogin}</p>
                      <p>Created: {admin.createdAt}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(admin.id)}
                        className="bg-white/50"
                      >
                        {admin.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      {admin.role !== "Super Admin" && (
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteAdmin(admin.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Security Guidelines</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Admin passwords are automatically hashed and stored securely</li>
                <li>• Super Admins cannot be deleted for security reasons</li>
                <li>• All admin activities are logged and monitored</li>
                <li>• Use strong passwords with at least 8 characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
