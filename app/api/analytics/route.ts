import { db } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const period = searchParams.get('period') || '7d'
  
  const now = new Date()
  let startDate: Date
  
  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  
  // Filter bookings within the period
  const periodBookings = db.bookings.filter(booking => {
    const bookingDate = new Date(booking.start)
    return bookingDate >= startDate && bookingDate <= now
  })
  
  // Calculate statistics
  const totalBookings = periodBookings.length
  const approvedBookings = periodBookings.filter(b => b.status === 'approved').length
  const pendingBookings = periodBookings.filter(b => b.status === 'pending').length
  const cancelledBookings = periodBookings.filter(b => b.status === 'cancelled').length
  const rejectedBookings = periodBookings.filter(b => b.status === 'rejected').length
  
  // Room utilization
  const roomUsage = db.rooms.map(room => {
    const roomBookings = periodBookings.filter(b => b.roomId === room.id && b.status === 'approved')
    const totalHours = roomBookings.reduce((acc, booking) => {
      const start = new Date(booking.start)
      const end = new Date(booking.end)
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)
    
    const maxHours = period === '24h' ? 24 : period === '7d' ? 168 : 720
    
    return {
      roomName: room.name,
      totalBookings: roomBookings.length,
      totalHours: Math.round(totalHours * 100) / 100,
      utilizationRate: Math.round((totalHours / maxHours) * 100),
      capacity: room.capacity
    }
  })
  
  // Hourly distribution (for charts)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const bookingsAtHour = periodBookings.filter(booking => {
      const bookingHour = new Date(booking.start).getHours()
      return bookingHour === hour && booking.status === 'approved'
    }).length
    
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      bookings: bookingsAtHour,
      hourValue: hour
    }
  })
  
  // Daily trends
  const dailyData = Array.from({ length: period === '30d' ? 30 : period === '24h' ? 1 : 7 }, (_, dayIndex) => {
    const date = new Date(startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000)
    const dayBookings = periodBookings.filter(booking => {
      const bookingDate = new Date(booking.start)
      return bookingDate.toDateString() === date.toDateString() && booking.status === 'approved'
    })
    
    return {
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      bookings: dayBookings.length,
      revenue: dayBookings.length * 50 // Assuming $50 per booking
    }
  })
  
  // Popular time slots
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  const popularTimes = timeSlots.map(time => {
    const bookingsAtTime = periodBookings.filter(booking => {
      const bookingTime = new Date(booking.start).toTimeString().slice(0, 5)
      return bookingTime === time && booking.status === 'approved'
    }).length
    
    return { time, bookings: bookingsAtTime }
  })
  
  // Equipment usage analytics
  const equipmentUsage = db.equipment.map(item => ({
    name: item.name,
    type: item.type,
    status: item.status,
    location: item.location,
    usageScore: Math.floor(Math.random() * 100) + 1 // Mock usage score
  }))
  
  // User activity patterns - using requester field instead of userId
  const userPatterns = db.users.map(user => ({
    name: user.name,
    role: user.role,
    totalBookings: periodBookings.filter(b => b.requester === user.name).length,
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  })).sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 10)
  
  return Response.json({
    period,
    overview: {
      totalBookings,
      approvedBookings,
      pendingBookings,
      cancelledBookings,
      rejectedBookings,
      totalRevenue: approvedBookings * 50,
      averageBookingsPerDay: Math.round((totalBookings / (period === '24h' ? 1 : period === '7d' ? 7 : 30)) * 100) / 100,
      growthRate: Math.floor(Math.random() * 20) + 5, // Mock growth rate
      utilizationRate: Math.round((approvedBookings / (db.rooms.length * (period === '24h' ? 24 : period === '7d' ? 168 : 720))) * 100)
    },
    roomUtilization: roomUsage.sort((a, b) => b.utilizationRate - a.utilizationRate),
    hourlyDistribution: hourlyData,
    dailyTrends: dailyData,
    popularTimeSlots: popularTimes.sort((a, b) => b.bookings - a.bookings),
    statusDistribution: [
      { status: 'Approved', count: approvedBookings, color: '#10b981', percentage: Math.round((approvedBookings / totalBookings) * 100) || 0 },
      { status: 'Pending', count: pendingBookings, color: '#f59e0b', percentage: Math.round((pendingBookings / totalBookings) * 100) || 0 },
      { status: 'Cancelled', count: cancelledBookings, color: '#ef4444', percentage: Math.round((cancelledBookings / totalBookings) * 100) || 0 },
      { status: 'Rejected', count: rejectedBookings, color: '#6b7280', percentage: Math.round((rejectedBookings / totalBookings) * 100) || 0 }
    ],
    equipmentAnalytics: {
      totalItems: db.equipment.length,
      available: db.equipment.filter(e => e.status === 'available').length,
      inUse: db.equipment.filter(e => e.status === 'in-use').length,
      maintenance: db.equipment.filter(e => e.status === 'maintenance').length,
      topUsed: equipmentUsage.sort((a, b) => b.usageScore - a.usageScore).slice(0, 5)
    },
    userActivity: {
      totalUsers: db.users.length,
      activeUsers: db.users.filter(u => u.status === 'active').length,
      topUsers: userPatterns
    }
  })
}
