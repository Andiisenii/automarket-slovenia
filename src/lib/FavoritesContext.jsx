import { createContext, useContext, useState, useEffect } from 'react'
import { favoritesDB, userDB } from './database'
import { API_URL } from './api'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  
  // Load favorites when user changes
  useEffect(() => {
    const loadFavorites = () => {
      // Try to get from API first
      loadFavoritesFromAPI()
    }
    
    loadFavorites()
    
    // Listen for user login to refresh
    window.addEventListener('userLoggedIn', loadFavorites)
    return () => window.removeEventListener('userLoggedIn', loadFavorites)
  }, [])
  
  // Load from API
  const loadFavoritesFromAPI = async () => {
    try {
      const user = userDB.getCurrentUser()
      if (!user) {
        setFavorites([])
        return
      }
      
      const response = await fetch(`${API_URL}/favorites.php?user_id=${user.id}`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const data = await response.json()
      if (data.success) {
        // Extract just the car IDs from the favorites
        const favoriteIds = (data.favorites || []).map(f => f.id)
        setFavorites(favoriteIds)
        return
      }
    } catch (e) {
      console.log('API favorites failed, using local')
    }
    // Fallback to local
    const user = userDB.getCurrentUser()
    if (user) {
      setFavorites(favoritesDB.getMyFavorites())
    } else {
      setFavorites([])
    }
  }
  
  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const user = userDB.getCurrentUser()
      if (user) {
        setFavorites(favoritesDB.getMyFavorites())
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const toggleFavorite = async (carId) => {
    try {
      // Try to toggle via API first
      const user = userDB.getCurrentUser()
      if (user) {
        // Check if already favorite
        const isFav = favorites.includes(carId)
        
        const response = await fetch(`${API_URL}/favorites.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Pinggy-No-Screen': 'true' },
          body: JSON.stringify({
            action: isFav ? 'remove' : 'add',
            user_id: user.id,
            car_id: carId
          })
        })
        
        const data = await response.json()
        if (data.success) {
          // Update local state
          if (isFav) {
            setFavorites(favorites.filter(id => id !== carId))
          } else {
            setFavorites([...favorites, carId])
          }
          return isFav
        }
      }
    } catch (e) {
      console.log('API favorites failed, using local')
    }
    
    // Fallback to local database
    const isFav = favorites.includes(carId)
    if (isFav) {
      favoritesDB.removeFavorite(carId)
      setFavorites(favorites.filter(id => id !== carId))
    } else {
      favoritesDB.addFavorite(carId)
      setFavorites([...favorites, carId])
    }
    return !isFav
  }
  
  const isFavorite = (carId) => {
    return favorites.includes(carId)
  }
  
  const refreshFavorites = () => {
    loadFavoritesFromAPI()
  }
  
  const clearFavoritesCache = () => {
    // Clear local favorites cache
    try {
      localStorage.removeItem('automarket_favorites')
      localStorage.removeItem('demo_favorites')
    } catch (e) {}
    setFavorites([])
  }
  
  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      refreshFavorites,
      clearFavoritesCache,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
