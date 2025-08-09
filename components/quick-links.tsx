"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calendar, Users, BarChart3, Bell, Settings, Monitor, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function QuickLinks() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingBookings: 0,
    equipmentCount: 0,
    activeNotifications: 0
  })

  useEffect(() => {
    // Fetch basic stats for the widgets
    const fetchStats = async () => {
      try {
        // Simulated data - in real app, you would fetch from APIs
        setStats({
          totalUsers: 24,
          pendingBookings: 3,
          equipmentCount: 18,
          activeNotifications: 5
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  const quickActions = [
    {
      icon: Calendar,
      label: "Book Room",
      href: "/book",
      description: "Schedule a classroom"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/analytics",
      description: "View insights"
    },
    {
      icon: Users,
      label: "Users",
      href: "/users",
      description: "Manage users"
    },
    {
      icon: Monitor,
      label: "Equipment",
      href: "/equipment",
      description: "Track equipment"
    },
    {
      icon: BookOpen,
      label: "Bookings",
      href: "/bookings",
      description: "View all bookings"
    },
    {
      icon: Settings,
      label: "Admin",
      href: "/admin",
      description: "System settings"
    }
  ]

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers,
      trend: "+12%",
      trendUp: true,
      color: "text-blue-600"
    },
    {
      icon: Calendar,
      label: "Pending",
      value: stats.pendingBookings,
      trend: "-8%",
      trendUp: false,
      color: "text-orange-600"
    },
    {
      icon: Monitor,
      label: "Equipment",
      value: stats.equipmentCount,
      trend: "+3%",
      trendUp: true,
      color: "text-green-600"
    },
    {
      icon: Bell,
      label: "Notifications",
      value: stats.activeNotifications,
      trend: "New",
      trendUp: true,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center space-y-1 bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => router.push(action.href)}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">
          System Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <div className="flex items-center mt-1">
                          <Activity className={`h-3 w-3 mr-1 ${
                            stat.trendUp ? "text-slate-600" : "text-slate-500"
                          }`} />
                          <span className={`text-xs ${
                            stat.trendUp ? "text-slate-600" : "text-slate-500"
                          }`}>
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-slate-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}