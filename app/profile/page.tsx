"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SharedNavigation } from "@/components/shared-navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Settings,
  Camera,
  Save,
  Edit,
  Key,
  Clock,
  Briefcase,
} from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Harshal Tapre",
    email: "harshaltapre27@gmail.com",
    phone: "+91 9322184006",
    location: "Shahapur, Bhandara, Maharashtra, India",
    role: "Operations & Technical Lead",
    department: "EV-Secure Project",
    joinDate: "2023-01-15",
    bio: "Frontend Developer | Electronics & ML Enthusiast. Experienced in EV infrastructure prototyping, frontend dashboards, embedded systems, and machine learning integration. Passionate about sustainable tech, AI-driven systems, and smart energy solutions.",
  })

  const activityLog = [
    { action: "Updated ESP32-S3 ML model parameters", timestamp: "2024-01-15 14:30:25", type: "security" },
    { action: "Deployed new dashboard features", timestamp: "2024-01-15 13:45:12", type: "config" },
    { action: "Optimized charging station algorithms", timestamp: "2024-01-15 12:20:08", type: "report" },
    { action: "Resolved EV infrastructure connectivity issue", timestamp: "2024-01-15 11:15:33", type: "security" },
    { action: "Enhanced ML threat detection accuracy", timestamp: "2024-01-14 16:45:22", type: "config" },
  ]

  const permissions = [
    { name: "EV Station Management", granted: true, description: "Full control over charging infrastructure" },
    { name: "ML Model Configuration", granted: true, description: "Configure and optimize ML algorithms" },
    { name: "Frontend Dashboard Development", granted: true, description: "Develop and maintain user interfaces" },
    { name: "ESP32-S3 Programming", granted: true, description: "Embedded systems development and deployment" },
    { name: "System Architecture", granted: true, description: "Design and implement system architecture" },
    { name: "Technical Documentation", granted: true, description: "Create and maintain technical documentation" },
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Save profile changes
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="w-4 h-4 text-red-500" />
      case "config":
        return <Settings className="w-4 h-4 text-blue-500" />
      case "report":
        return <Activity className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <SharedNavigation currentPage="profile" />

      <div className="lg:ml-64">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                <span className="truncate">User Profile</span>
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account and preferences</p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-white/80">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Overview */}
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                      <AvatarImage src="/placeholder.svg?height=128&width=128" />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        HT
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
                    {profile.role}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-white/50 mt-1"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-gray-800 mt-1">{profile.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                          className="bg-white/50 mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-800">{profile.email}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                          className="bg-white/50 mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-800">{profile.phone}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location
                      </Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                          className="bg-white/50 mt-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-800">{profile.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                      Bio
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                        className="bg-white/50 mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700 mt-1 text-sm leading-relaxed">{profile.bio}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.department}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg w-full sm:w-auto">
              <TabsTrigger value="activity" className="text-xs sm:text-sm">
                Activity Log
              </TabsTrigger>
              <TabsTrigger value="permissions" className="text-xs sm:text-sm">
                Permissions
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm">
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">Recent Activity</CardTitle>
                  <p className="text-sm text-gray-600">Your recent actions and system interactions</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLog.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">Access Permissions</CardTitle>
                  <p className="text-sm text-gray-600">Your current system permissions and access levels</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {permissions.map((permission, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          permission.granted
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                            : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                        }`}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{permission.name}</h4>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                        <Badge
                          variant={permission.granted ? "default" : "secondary"}
                          className={
                            permission.granted
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {permission.granted ? "Granted" : "Denied"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">Security Settings</CardTitle>
                  <p className="text-sm text-gray-600">Manage your account security and authentication</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" className="bg-white/50">
                          <Key className="w-4 h-4 mr-2" />
                          Enable 2FA
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">Password</h4>
                          <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                        </div>
                        <Button variant="outline" className="bg-white/50">
                          Change Password
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Security Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Account verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Strong password</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">2FA not enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
