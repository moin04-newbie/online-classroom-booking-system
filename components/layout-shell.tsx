"use client"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Bell, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, memo } from "react"
import { useRT } from "./realtime-provider"
import { cn } from "@/lib/utils"

const HeaderQuickActions = memo(function HeaderQuickActions() {
  const { role, setRole, unread } = useRT()
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-colors duration-200">
      <div className="flex h-14 items-center gap-3 px-3">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input 
            aria-label="Search" 
            placeholder="Search rooms, bookings, buildings..." 
            className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <select
          aria-label="Current role"
          className="h-9 rounded-md border px-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <Link
          href="/notifications"
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 hover:bg-gray-100 hover:scale-105",
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span
              aria-label={`${unread} unread notifications`}
              className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white animate-pulse"
            >
              {unread}
            </span>
          )}
        </Link>
        <Button 
          asChild 
          size="sm" 
          className="transition-all duration-200 hover:scale-105" 
          style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}
        >
          <Link href="/book">Book a Room</Link>
        </Button>
      </div>
    </header>
  )
})

const BottomMobileNav = memo(function BottomMobileNav() {
  const items = [
    { href: "/", label: "Home" },
    { href: "/availability", label: "Avail" },
    { href: "/book", label: "Book" },
    { href: "/bookings", label: "My" },
    { href: "/notifications", label: "Alerts" },
  ]
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 gap-1 border-t p-2 md:hidden transition-transform duration-200"
      style={{ backgroundColor: "#001F3F", color: "white" }}
    >
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="text-center text-xs transition-all duration-200 hover:scale-105">
          <div className="truncate">{it.label}</div>
        </Link>
      ))}
    </nav>
  )
})

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  // No need for RealTimeProvider here since it's already in the root layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderQuickActions />
        <main className="p-3 pb-20 md:pb-6 transition-all duration-200">{children}</main>
        <BottomMobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
