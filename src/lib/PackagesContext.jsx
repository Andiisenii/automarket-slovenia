import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const PackagesContext = createContext(null)

export function PackagesProvider({ children }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
      
      if (error) {
        console.error('Error fetching packages:', error)
        return
      }
      
      if (data) {
        setPackages(data || [])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivePackage = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/payments.php?user_id=${userId}`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const data = await response.json()
      if (data.success && data.payments) {
        const active = data.payments.find(p => 
          p.status === 'active' && new Date(p.expires_at) > new Date()
        )
        return active
      }
    } catch (error) {
      console.error('Error getting active package:', error)
    }
    return null
  }

  return (
    <PackagesContext.Provider value={{ packages, loading, fetchPackages, getActivePackage }}>
      {children}
    </PackagesContext.Provider>
  )
}

export const usePackages = () => useContext(PackagesContext)
