"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserProfile {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserProfile({
            id: user.uid,
            email: user.email!,
            name: data.name,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          })
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name
      await updateProfile(user, { displayName: name })
      
      // Create user profile in Firestore
      const userProfile: Omit<UserProfile, 'id'> = {
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await setDoc(doc(db, 'users', user.uid), userProfile)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
