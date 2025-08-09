"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Mail, User, Clock, CheckCircle, XCircle, Loader2, Camera } from "lucide-react"
import LayoutShell from "@/components/layout-shell"
import { toast } from "sonner"

interface UserBooking {
  id: string
  roomId: string
  roomName: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [userBookings, setUserBookings] = useState<UserBooking[]>([])
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    department: '',
    bio: ''
  })

  useEffect(() => {
    if (user) {
      // Load user profile from Firebase
      loadUserProfile()
      loadUserBookings()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/users`)
      if (response.ok) {
        const users = await response.json()
        const currentUser = users.find((u: any) => u.id === user.uid || u.email === user.email)
        
        if (currentUser) {
          setProfileData({
            displayName: currentUser.displayName || user.displayName || '',
            email: user.email || '',
            phone: currentUser.phone || '',
            department: currentUser.department || '',
            bio: currentUser.bio || ''
          })
        } else {
          // Set default profile data
          setProfileData({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: '',
            department: '',
            bio: ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Set default profile data on error
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: '',
        department: '',
        bio: ''
      })
    }
  }

  const loadUserBookings = async () => {
    if (!user) return
    
    try {
      // Load from Firebase Realtime Database
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const allBookings = await response.json()
        // Filter bookings for current user and get recent 5
        const userBookings = allBookings
          .filter((booking: any) => booking.userId === user.uid)
          .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
          .slice(0, 5)
          .map((booking: any) => ({
            id: booking.id,
            roomId: booking.roomId,
            roomName: `Room ${booking.roomId}`,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            purpose: booking.purpose,
            status: booking.status,
            createdAt: booking.createdAt || Date.now()
          }))
        setUserBookings(userBookings)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update user profile in Firebase
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          displayName: profileData.displayName,
          phone: profileData.phone,
          department: profileData.department,
          bio: profileData.bio,
          updatedAt: Date.now()
        }),
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        
        // Reload user data to reflect changes
        const updatedUser = await response.json()
        if (updatedUser.user) {
          localStorage.setItem('userProfile', JSON.stringify(updatedUser.user))
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'rejected': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  if (!user) {
    return (
      <LayoutShell>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-600">Please sign in to view your profile</h2>
              </div>
            </CardContent>
          </Card>
        </div>
      </LayoutShell>
    )
  }

  return (
    <LayoutShell>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Personal Information
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="text-lg font-semibold bg-slate-100">
                        {getInitials(profileData.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{profileData.displayName}</h3>
                    <p className="text-gray-600">{profileData.email}</p>
                    <Badge variant="outline" className="mt-1">Active User</Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">Full Name</Label>
                      <Input
                        id="displayName"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Enter phone number"
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Enter department"
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${!isEditing ? "bg-gray-50" : ""}`}
                      rows={3}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-slate-700 hover:bg-slate-800">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userBookings.length > 0 ? (
                    userBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{booking.roomName || `Room ${booking.roomId}`}</span>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>{booking.date}</div>
                          <div>{booking.startTime} - {booking.endTime}</div>
                          <div className="truncate">{booking.purpose}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No bookings yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-medium">{userBookings.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Bookings</span>
                  <span className="font-medium">{userBookings.filter(b => b.status === 'approved').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending Bookings</span>
                  <span className="font-medium">{userBookings.filter(b => b.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">Aug 2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}
