"use client"

import LayoutShell from "@/components/layout-shell"
import Analytics from "@/components/charts/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  BarChart3, 
  PieChart,
  Activity,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Download
} from "lucide-react"

function exportCSV() {
  fetch("/api/bookings").then((r) => r.json()).then((d) => {
    const rows = d.bookings as any[]
    const header = ["id", "roomId", "title", "start", "end", "status"].join(",")
    const body = rows.map((b) => [b.id, b.roomId, b.title, new Date(b.start).toISOString(), new Date(b.end).toISOString(), b.status].join(",")).join("\n")
    const csv = header + "\n" + body
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bookings.csv"
    a.click()
    URL.revokeObjectURL(url)
  })
}

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics")
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
    const interval = setInterval(loadAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </LayoutShell>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />
      case "cancelled": return <Pause className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <LayoutShell>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive insights into system usage and performance</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="animate-pulse">
              <Activity className="mr-1 h-3 w-3" />
              Live Data
            </Badge>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview?.totalBookings || 0}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                +{analytics?.trends?.weeklyGrowth || 0}% this week
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview?.activeUsers || 0}</div>
              <div className="text-xs text-muted-foreground">
                of {analytics?.overview?.totalUsers || 0} total users
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview?.avgBookingDuration || 0}h</div>
              <div className="text-xs text-muted-foreground">per booking</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                Peak Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview?.peakHour || 0}:00</div>
              <div className="text-xs text-muted-foreground">busiest time</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rooms">Room Usage</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Daily Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Analytics />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Booking Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.statusStats && Object.entries(analytics.statusStats).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="capitalize text-sm">{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${analytics.overview.totalBookings > 0 ? (count / analytics.overview.totalBookings) * 100 : 0}%`,
                              backgroundColor: status === 'approved' ? '#10b981' : 
                                             status === 'pending' ? '#f59e0b' :
                                             status === 'rejected' ? '#ef4444' : '#6b7280'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Room Utilization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.roomStats?.map((room: any, index: number) => (
                  <div key={room.roomId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{room.roomName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {room.totalBookings} bookings • {room.totalHours}h total
                        </p>
                      </div>
                      <Badge variant={room.utilizationRate > 80 ? "destructive" : room.utilizationRate > 50 ? "default" : "secondary"}>
                        {room.utilizationRate}% utilized
                      </Badge>
                    </div>
                    <Progress value={room.utilizationRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    +{analytics?.trends?.weeklyGrowth || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">vs last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    +{analytics?.trends?.userGrowth || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">new users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Utilization Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    +{analytics?.trends?.utilizationTrend || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">efficiency gain</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </LayoutShell>
  )
}
