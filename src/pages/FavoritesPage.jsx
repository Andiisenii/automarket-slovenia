import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Car } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CarCard } from '@/components/features/CarCard'
import { useFavorites } from '@/lib/FavoritesContext'
import { useCars } from '@/lib/CarContext'

export function FavoritesPage() {
  const { favorites } = useFavorites()
  const { cars } = useCars()
  
  const favoriteCars = useMemo(() => {
    // Use only cars from API
    return cars.filter(car => favorites.includes(car.id))
  }, [favorites, cars])
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">
                {favoriteCars.length} {favoriteCars.length === 1 ? 'car' : 'cars'} saved
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favoriteCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start browsing and save cars you like to see them here
            </p>
            <Link to="/cars">
              <Button>Browse Cars</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
