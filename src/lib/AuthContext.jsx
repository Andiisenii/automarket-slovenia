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
      
      // Create session with full user data
      const token = 'auth_' + Date.now()
      
      // Save full user data to localStorage
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        phone: user.phone || '',
        username: user.username || '',
        profile_photo: user.profile_photo || '',
        address: user.address || '',
        city: user.city || '',
        has_phone: user.has_phone,
        has_whatsapp: user.has_whatsapp,
        has_viber: user.has_viber,
      }
      
      localStorage.setItem('automarket_token', token)
      localStorage.setItem('automarket_user', JSON.stringify(userData))
      
      setUser(userData)
      
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
      
      // Auto login after register with full user data
      const token = 'auth_' + Date.now()
      
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        user_type: data.user_type,
        phone: data.phone || '',
        username: data.username || '',
        profile_photo: data.profile_photo || '',
        address: data.address || '',
        city: data.city || '',
      }
      
      localStorage.setItem('automarket_token', token)
      localStorage.setItem('automarket_user', JSON.stringify(userData))
      
      setUser(userData)
      
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

  // Update user profile
  const updateProfile = async (data) => {
    if (!user?.id) {
      throw new Error('Morate biti prijavljeni')
    }
    
    try {
      // Build update object with all columns
      const updateData = {
        name: data.name || user.name,
        phone: data.phone || null,
        profile_photo: data.profile_photo || null,
        has_phone: data.hasPhone ? 1 : 0,
        has_whatsapp: data.hasWhatsapp ? 1 : 0,
        has_viber: data.hasViber ? 1 : 0,
        address: data.address || null,
        city: data.city || null,
        username: data.username || null,
        user_type: data.userType || user.user_type,
      }
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Profile update error:', error)
        throw new Error(error.message || 'Napaka pri posodabljanju profila')
      }
      
      // Update local state and storage
      const newUserData = {
        ...user,
        id: user.id,
        email: user.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        profile_photo: updatedUser.profile_photo,
        has_phone: updatedUser.has_phone,
        has_whatsapp: updatedUser.has_whatsapp,
        has_viber: updatedUser.has_viber,
        address: updatedUser.address,
        city: updatedUser.city,
        username: updatedUser.username,
        user_type: updatedUser.user_type,
        role: user.role,
      }
      
      localStorage.setItem('automarket_user', JSON.stringify(newUserData))
      setUser(newUserData)
      
      return { success: true, user: updatedUser }
    } catch (e) {
      console.error('Update profile error:', e)
      throw e
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    if (!user?.id) {
      throw new Error('Morate biti prijavljeni')
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Geslo mora imeti vsaj 6 znakov')
    }
    
    if (!/[0-9]/.test(newPassword)) {
      throw new Error('Geslo mora vsebovati vsaj eno stevilo')
    }
    
    try {
      // Get current user data to verify old password
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single()
      
      if (fetchError || !currentUser) {
        throw new Error('Napaka pri nalaganju podatkov')
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, currentUser.password)
      if (!isValid) {
        throw new Error('Trenutno geslo ni pravilno')
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      // Update password
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Password update error:', error)
        throw new Error(error.message || 'Napaka pri posodabljanju gesla')
      }
      
      return { success: true }
    } catch (e) {
      console.error('Change password error:', e)
      throw e
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
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
