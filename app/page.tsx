"use client"

import LayoutShell from "@/components/layout-shell"
import SummaryCards from "@/components/summary-cards"
import QuickLinks from "@/components/quick-links"
import NotificationPanel from "@/components/notification-panel"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Calendar, Users, Zap, TrendingUp, Activity } from "lucide-react"

export default function Page() {
  const [roomOccupancy, setRoomOccupancy] = useState(65)
  const [weeklyGrowth, setWeeklyGrowth] = useState(12)
  const [activeUsers, setActiveUsers] = useState(24)

  useEffect(() => {
    // Simulate real-time data updates
    const dataTimer = setInterval(() => {
      setRoomOccupancy(Math.floor(Math.random() * 100))
      setWeeklyGrowth(Math.floor(Math.random() * 30))
      setActiveUsers(Math.floor(Math.random() * 50) + 10)
    }, 5000)
    
    return () => {
      clearInterval(dataTimer)
    }
  }, [])

  return (
    <LayoutShell>
      <div className="grid gap-4">
        {/* Hero Section with Live Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <Users className="mx-auto mb-2 h-8 w-8" />
              <motion.div 
                key={activeUsers}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                {activeUsers}
              </motion.div>
              <div className="text-sm opacity-80">Active Users</div>
            </div>
            <div className="text-center">
              <Activity className="mx-auto mb-2 h-8 w-8" />
              <motion.div 
                key={roomOccupancy}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                {roomOccupancy}%
              </motion.div>
              <div className="text-sm opacity-80">Room Occupancy</div>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8" />
              <motion.div 
                key={weeklyGrowth}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                +{weeklyGrowth}%
              </motion.div>
              <div className="text-sm opacity-80">Weekly Growth</div>
            </div>
          </div>
        </motion.div>

        <SummaryCards />
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-slate-700 hover:bg-slate-800 text-white"
                  onClick={() => window.location.href = '/book'}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Room Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/availability'}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Check Availability
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/reports'}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Room Status Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Room Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Room 101</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-16 h-2" />
                      <Badge variant="secondary">Busy</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lab 1</span>
                    <div className="flex items-center gap-2">
                      <Progress value={30} className="w-16 h-2" />
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Studio A</span>
                    <div className="flex items-center gap-2">
                      <Progress value={100} className="w-16 h-2" />
                      <Badge variant="destructive">Full</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Room 102</span>
                    <div className="flex items-center gap-2">
                      <Progress value={0} className="w-16 h-2" />
                      <Badge className="bg-slate-600 hover:bg-slate-700 text-white">Free</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <NotificationPanel />
        </div>

        <QuickLinks />

        {/* Enhanced Image Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-lg border">
            <Image 
              src="/images/img.jpg" 
              alt="Scheduling inspiration" 
              width={1200} 
              height={400} 
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-bold">Modern Classroom Management</h3>
              <p className="text-sm opacity-90">Efficient, Fast, and Reliable</p>
            </div>
          </div>
        </motion.div>
      </div>
    </LayoutShell>
  )
}
