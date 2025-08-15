import { NextResponse } from 'next/server'
import { ref, get, set, push, remove } from 'firebase/database'
import { db } from '@/lib/firebase'

// GET all users
export async function GET() {
  try {
    const usersRef = ref(db, 'users')
    const snapshot = await get(usersRef)

    if (!snapshot.exists()) {
      return NextResponse.json([])
    }

    const usersData = snapshot.val()
    const users = Object.keys(usersData).map(id => ({
      id,
      name: usersData[id].displayName || '', // For frontend compatibility
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

// POST create user
export async function POST(request: Request) {
  try {
    const { email, displayName, department, role, phone } = await request.json()
    const usersRef = ref(db, 'users')

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
      name: userData.displayName, // For frontend compatibility
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

// PUT update user
export async function PUT(request: Request) {
  try {
    const { userId, displayName, phone, department, bio, settings, updatedAt } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const userRef = ref(db, `users/${userId}`)
    const snapshot = await get(userRef)
    const currentUser = snapshot.val() || {}

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
      name: updatedData.displayName, // Keep compatibility
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

// DELETE user + related data
export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await remove(ref(db, `users/${userId}`))

    const bookingsRef = ref(db, 'bookings')
    const bookingsSnapshot = await get(bookingsRef)
    if (bookingsSnapshot.exists()) {
      const bookings = bookingsSnapshot.val()
      const userBookingIds = Object.keys(bookings).filter(
        id => bookings[id].userId === userId
      )
      for (const bookingId of userBookingIds) {
        await remove(ref(db, `bookings/${bookingId}`))
      }
    }

    const notificationsRef = ref(db, 'notifications')
    const notificationsSnapshot = await get(notificationsRef)
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val()
      const userNotificationIds = Object.keys(notifications).filter(
        id => notifications[id].userId === userId
      )
      for (const notificationId of userNotificationIds) {
        await remove(ref(db, `notifications/${notificationId}`))
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
