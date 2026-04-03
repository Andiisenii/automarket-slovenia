import { createContext, useContext, useState, useEffect } from 'react'
import { API_URL } from './api'

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
          // Just use the local data - trust it for now
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
      // DEMO CREDENTIALS - for testing without backend
      if (email === 'admin@automarket.si' && password === '++Admin12345') {
        const demoUser = {
          id: 1,
          name: 'Admin',
          email: 'admin@automarket.si',
          role: 'admin',
          user_type: 'business'
        }
        localStorage.setItem('automarket_token', 'demo_token_' + Date.now())
        localStorage.setItem('automarket_user', JSON.stringify(demoUser))
        setUser(demoUser)
        setLoading(false)
        return demoUser
      }
      
      // Try API login
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Pinggy-No-Screen': 'true'
        },
        body: JSON.stringify({ action: 'login', email, password })
      })
      
      const result = await response.json()
      
      console.log('Login response:', response.status, result)
      
      // Check if API returned success
      if (!result.success) {
        throw new Error('Neveljaven email ali geslo')
      }
      
      if (!result.token) {
        throw new Error('Napaka pri prijavi')
      }
      
      // Save token and user
      localStorage.setItem('automarket_token', result.token)
      localStorage.setItem('automarket_user', JSON.stringify(result.user))
      
      setUser(result.user)
      return result.user
      
    } catch (e) {
      console.error('Login error:', e)
      // Translate error messages to Slovenian
      let errorMsg = e.message || 'Napaka pri prijavi'
      if (errorMsg.includes('Invalid credentials') || errorMsg.includes('Invalid email') || errorMsg.includes('not found')) {
        errorMsg = 'Neveljaven email ali geslo'
      }
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
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Pinggy-No-Screen': 'true'
        },
        body: JSON.stringify({ action: 'register', ...userData })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Registration failed')
      }
      
      // Auto login after register
      localStorage.setItem('automarket_token', result.token)
      localStorage.setItem('automarket_user', JSON.stringify(result.user))
      
      setUser(result.user)
      return result.user
      
    } catch (e) {
      setError(e.message)
      throw e
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