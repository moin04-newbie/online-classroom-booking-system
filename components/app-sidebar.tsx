"use client"

import Link from "next/link"
import { CalendarDays, Home, ClipboardList, BookOpen, BarChart2, Bell, Users2, User, HelpCircle, Settings2, PlusSquare, Users, Activity, Monitor } from 'lucide-react'
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
const mainNav = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Availability", url: "/availability", icon: CalendarDays },
  { title: "Book a Room", url: "/book", icon: PlusSquare },
  { title: "Bookings", url: "/bookings", icon: ClipboardList },
  { title: "Users", url: "/users", icon: Users },
  { title: "Equipment", url: "/equipment", icon: Monitor },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "Admin", url: "/admin", icon: Settings2 },
  { title: "Teacher View", url: "/teacher", icon: Users2 },
  { title: "Student View", url: "/student", icon: User },
  { title: "Reports", url: "/reports", icon: BarChart2 },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
]

export function AppSidebar() {
  return (
    <Sidebar className="text-white" style={{ backgroundColor: "#001F3F" }}>
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md" style={{ backgroundColor: "#4FD1C5" }} aria-hidden />
          <div className="font-semibold text-black">Campus Rooms</div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pb-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-black">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
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
      </SidebarContent>
      <SidebarFooter className="px-3 pb-3">
        <div className="text-xs text-white/60">v1.0 • All times local</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
