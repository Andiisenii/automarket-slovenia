import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_URL } from './api'

const CarContext = createContext(null)

export function CarProvider({ children }) {
  const { user } = useAuth()
  const [cars, setCars] = useState([])
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all cars when user changes
  useEffect(() => {
    loadCars()
  }, [user])

  const loadCars = async () => {
    setLoading(true)
    try {
      // Get all public cars (GET endpoint)
      const response = await fetch(`${API_URL}/cars.php`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const result = await response.json(); console.log('addCar result:', result)
      
      if (result.success) {
        setCars(result.cars || [])
      }
      
      // Get user's own cars if logged in (filter from all cars)
      if (user?.id) {
        console.log('User ID:', user.id, 'Car user_ids:', (result.cars || []).map(c => c.user_id))
        const myCars = (result.cars || []).filter(c => parseInt(c.user_id) === user.id)
        setMyListings(myCars)
      }
      
    } catch (e) {
      console.error('Error loading cars:', e)
    } finally {
      setLoading(false)
    }
  }

  const refreshCars = async () => {
    await loadCars(); console.log('Cars refreshed')
  }

  const addCar = async (carData) => {
    if (!user) throw new Error('Must be logged in to add a car')
    
    const token = localStorage.getItem('automarket_token')
    
    const response = await fetch(`${API_URL}/cars.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-Pinggy-No-Screen': 'true'
      },
      body: JSON.stringify({ action: 'create', ...carData, user_id: user.id })
    })
    
    const result = await response.json(); console.log('addCar result:', result)
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to add car')
    }
    
    // Refresh user's cars
    await loadCars(); console.log('Cars refreshed')
    
    return result
  }

  const updateCar = async (carId, updates) => {
    const token = localStorage.getItem('automarket_token')
    
    const response = await fetch(`${API_URL}/cars.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-Pinggy-No-Screen': 'true'
      },
      body: JSON.stringify({ action: 'update', id: carId, user_id: user.id, ...updates })
    })
    
    const result = await response.json(); console.log('addCar result:', result)
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update car')
    }
    
    // Refresh cars
    await loadCars(); console.log('Cars refreshed')
    
    return result
  }

  const deleteCar = async (carId) => {
    const token = localStorage.getItem('automarket_token')
    
    const response = await fetch(`${API_URL}/cars.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-Pinggy-No-Screen': 'true'
      },
      body: JSON.stringify({ action: 'delete', id: carId, user_id: user.id })
    })
    
    const result = await response.json(); console.log('addCar result:', result)
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete car')
    }
    
    // Refresh cars
    await loadCars(); console.log('Cars refreshed')
    
    return result
  }

  const value = {
    cars,
    myListings,
    loading,
    refreshCars,
    addCar,
    updateCar,
    deleteCar,
    getCarById: (id) => cars.find(c => c.id === id)
  }

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  )
}

export function useCars() {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCars must be used within a CarProvider')
  }
  return context
}

export default CarContext
