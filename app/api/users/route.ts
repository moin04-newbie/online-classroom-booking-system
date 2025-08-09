import { NextResponse } from 'next/server'
import { getDatabase, ref, get, set, push, remove } from 'firebase/database'

export async function GET() {
  try {
    const database = getDatabase()
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)
    
    if (!snapshot.exists()) {
      return NextResponse.json([])
    }
    
    const usersData = snapshot.val()
    const users = Object.keys(usersData).map(id => ({
      id,
      ...usersData[id]
    }))
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { email, displayName, department, role, phone } = await request.json()
    
    const database = getDatabase()
    const usersRef = ref(database, 'users')
    
    // Generate new user
    const newUserRef = push(usersRef)
    const userId = newUserRef.key
    
    const userData = {
      email,
      displayName: displayName || '',
      department: department || '',
      role: role || 'user',
      phone: phone || '',
      isActive: true,
      createdAt: Date.now(),
      lastLogin: Date.now()
    }
    
    await set(newUserRef, userData)
    
    return NextResponse.json({ 
      id: userId, 
      ...userData 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, displayName, phone, department, bio, settings, updatedAt } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const database = getDatabase()
    const userRef = ref(database, `users/${userId}`)
    
    // Get current user data
    const snapshot = await get(userRef)
    const currentUser = snapshot.val() || {}
    
    // Update user data
    const updatedData = {
      ...currentUser,
      ...(displayName && { displayName }),
      ...(phone && { phone }),
      ...(department && { department }),
      ...(bio && { bio }),
      ...(settings && { settings }),
      updatedAt: updatedAt || Date.now()
    }
    
    await set(userRef, updatedData)
    
    return NextResponse.json({ 
      message: 'User updated successfully',
      user: updatedData
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const database = getDatabase()
    
    // Delete user data
    await remove(ref(database, `users/${userId}`))
    
    // Also delete user's bookings
    const bookingsRef = ref(database, 'bookings')
    const bookingsSnapshot = await get(bookingsRef)
    
    if (bookingsSnapshot.exists()) {
      const bookings = bookingsSnapshot.val()
      const userBookingIds = Object.keys(bookings).filter(
        id => bookings[id].userId === userId
      )
      
      // Delete each user booking
      for (const bookingId of userBookingIds) {
        await remove(ref(database, `bookings/${bookingId}`))
      }
    }
    
    // Delete user's notifications
    const notificationsRef = ref(database, 'notifications')
    const notificationsSnapshot = await get(notificationsRef)
    
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val()
      const userNotificationIds = Object.keys(notifications).filter(
        id => notifications[id].userId === userId
      )
      
      // Delete each user notification
      for (const notificationId of userNotificationIds) {
        await remove(ref(database, `notifications/${notificationId}`))
      }
    }
    
    return NextResponse.json({ 
      message: 'User and all associated data deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
