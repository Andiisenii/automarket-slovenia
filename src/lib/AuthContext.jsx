import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('automarket_token')
      const savedUser = localStorage.getItem('automarket_user')
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (e) {
          localStorage.removeItem('automarket_token')
          localStorage.removeItem('automarket_user')
        }
      }
      setLoading(false)
    }
    
    checkSession()
  }, [])

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    
    try {
      // Query Supabase directly
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error || !user) {
        throw new Error('Neveljaven email ali geslo')
      }
      
      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        throw new Error('Neveljaven email ali geslo')
      }
      
      // Create session
      const token = 'auth_' + Date.now()
      
      // Save session
      localStorage.setItem('automarket_token', token)
      localStorage.setItem('automarket_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type
      }))
      
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type
      })
      
      return user
      
    } catch (e) {
      console.error('Login error:', e)
      let errorMsg = e.message || 'Napaka pri prijavi'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setError(null)
    setLoading(true)
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          phone: userData.phone || null,
          role: 'user',
          user_type: userData.userType || 'private'
        })
        .select()
        .single()
      
      if (error) {
        if (error.message.includes('duplicate')) {
          throw new Error('Ta email je že registriran')
        }
        throw new Error(error.message)
      }
      
      // Auto login after register
      const token = 'auth_' + Date.now()
      localStorage.setItem('automarket_token', token)
      localStorage.setItem('automarket_user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        user_type: data.user_type
      }))
      
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        user_type: data.user_type
      })
      
      return data
      
    } catch (e) {
      console.error('Register error:', e)
      let errorMsg = e.message || 'Napaka pri registraciji'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('automarket_token')
    localStorage.removeItem('automarket_user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isBusiness: user?.user_type === 'business',
    isPremium: false,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
