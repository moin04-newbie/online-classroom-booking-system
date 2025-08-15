"use client"

import Link from "next/link"
import { CalendarDays, Home, ClipboardList, BookOpen, BarChart2, Bell, Users2, User, HelpCircle, Settings2, PlusSquare, Users, Activity, Monitor, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Persistent, collapsible sidebar built with shadcn/ui Sidebar primitives for desktop and mobile. [^1]
const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Availability", url: "/availability", icon: CalendarDays },
  { title: "Book a Room", url: "/book", icon: PlusSquare },
  { title: "My Bookings", url: "/bookings", icon: ClipboardList },
  { title: "Equipment", url: "/equipment", icon: Monitor },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "Reports", url: "/reports", icon: BarChart2 },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings2 },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
]

// Additional role-based views (accessible to all authenticated users)
const roleViewItems = [
  { title: "Admin Panel", url: "/admin", icon: Settings2 },
  { title: "Teacher Dashboard", url: "/teacher", icon: Users2 },
  { title: "Student Portal", url: "/student", icon: User },
  { title: "User Management", url: "/users", icon: Users },
]

export function AppSidebar() {
  const { user, userProfile, logout } = useAuth()

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Sidebar className="text-white" style={{ backgroundColor: "#001F3F" }}>
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="font-semibold text-black">ClassroomHub</div>
        </div>
        <div className="flex gap-2 mt-3">
          <Link href="/auth/signin">
            <Button size="sm" variant="outline" className="text-black border-black">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" variant="outline" className="text-black border-black">Sign Up</Button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="pb-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-black">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:text-black text-black" >
                    <Link href={item.url} aria-label={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-black">Role Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {roleViewItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:text-black text-black" >
                    <Link href={item.url} aria-label={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-black">User Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="hover:text-black text-black" >
                    <Link href="/users" aria-label="User Management">
                      <Users className="h-5 w-5" />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="px-3 pb-3 space-y-3">
        {user && userProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-white/10 p-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-xs">
                    <span className="font-medium truncate max-w-32">
                      {userProfile.name || userProfile.email}
                    </span>
                    <span className="text-white/60">
                      User
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <div className="text-xs text-white/60">v1.0 • All times local</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
