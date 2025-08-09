"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database,
  Moon, 
  Sun, 
  Monitor, 
  Trash2, 
  Key,
  Mail,
  Smartphone,
  Calendar,
  Clock,
  Save,
  RefreshCw
} from "lucide-react"
import LayoutShell from "@/components/layout-shell"
import { toast } from "sonner"

interface SettingsData {
  notifications: {
    email: boolean
    push: boolean
    booking: boolean
    equipment: boolean
    reminders: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showActivity: boolean
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  
  const handleSignOut = async () => {
    // Handle sign out functionality
    try {
      localStorage.clear()
      window.location.href = '/auth/signin'
    } catch (error) {
      toast.error('Error signing out')
    }
  }
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      booking: true,
      equipment: false,
      reminders: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showActivity: true
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save settings to Firebase and localStorage
      const settingsData = {
        userId: user?.uid,
        settings: settings,
        updatedAt: Date.now()
      }
      
      // Save to localStorage for immediate use
      localStorage.setItem('userSettings', JSON.stringify(settings))
      
      // Also save to Firebase for persistence across devices
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          settings: settings,
          updatedAt: Date.now()
        }),
      })
      
      if (response.ok) {
        toast.success('Settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // First, delete user's data from Firebase
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid
        }),
      })
      
      if (response.ok) {
        // Clear local storage
        localStorage.clear()
        
        toast.success('Account deletion request submitted successfully')
        
        // Sign out and redirect after a short delay
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 2000)
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account. Please try again.')
    }
  }

  useEffect(() => {
    // Load saved settings from localStorage and Firebase
    loadUserSettings()
  }, [user])

  const loadUserSettings = async () => {
    try {
      // First try to load from localStorage for immediate use
      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings)
          setSettings(parsedSettings)
        } catch (error) {
          console.error('Error parsing saved settings:', error)
        }
      }

      // Then load from Firebase for most up-to-date settings
      if (user) {
        const response = await fetch('/api/users')
        if (response.ok) {
          const users = await response.json()
          const currentUser = users.find((u: any) => u.id === user.uid || u.email === user.email)
          
          if (currentUser?.settings) {
            setSettings(currentUser.settings)
            localStorage.setItem('userSettings', JSON.stringify(currentUser.settings))
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const updateNotification = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updatePrivacy = (key: keyof typeof settings.privacy, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <LayoutShell>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Settings */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email-notif">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={settings.notifications.email}
                    onCheckedChange={(value) => updateNotification('email', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="push-notif">Push Notifications</Label>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={settings.notifications.push}
                    onCheckedChange={(value) => updateNotification('push', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="booking-notif">Booking Updates</Label>
                  </div>
                  <Switch
                    id="booking-notif"
                    checked={settings.notifications.booking}
                    onCheckedChange={(value) => updateNotification('booking', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="equipment-notif">Equipment Alerts</Label>
                  </div>
                  <Switch
                    id="equipment-notif"
                    checked={settings.notifications.equipment}
                    onCheckedChange={(value) => updateNotification('equipment', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="reminder-notif">Booking Reminders</Label>
                  </div>
                  <Switch
                    id="reminder-notif"
                    checked={settings.notifications.reminders}
                    onCheckedChange={(value) => updateNotification('reminders', value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Profile Visibility</Label>
                  <Select 
                    value={settings.privacy.profileVisibility} 
                    onValueChange={(value: 'public' | 'private') => updatePrivacy('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-email">Show Email in Profile</Label>
                  <Switch
                    id="show-email"
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(value) => updatePrivacy('showEmail', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-activity">Show Activity Status</Label>
                  <Switch
                    id="show-activity"
                    checked={settings.privacy.showActivity}
                    onCheckedChange={(value) => updatePrivacy('showActivity', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Save Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="w-full bg-slate-700 hover:bg-slate-800"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Account */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                  </div>
                </div>

                <Separator />

                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  <Key className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}
