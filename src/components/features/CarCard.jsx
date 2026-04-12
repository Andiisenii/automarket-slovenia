import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/FavoritesContext'

export function CarCard({ car, index = 0, featured = false }) {
  const { toggleFavorite, isFavorite: checkFavorite } = useFavorites()
  const isFav = checkFavorite(car.id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const intervalRef = useRef(null)
  
  // Get all images for this car (handle both API and local format)
  const carImages = car.images && Array.isArray(car.images) && car.images.length > 0 
    ? car.images 
    : car.images && typeof car.images === 'string'
    ? JSON.parse(car.images)
    : [car.image || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800']
  
  // Start slideshow on mouse enter
  const startSlideshow = () => {
    if (carImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % carImages.length)
      }, 800)
    }
  }
  
  // Stop slideshow on mouse leave
  const stopSlideshow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentImageIndex(0)
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  // Featured card layout
  if (featured) {
    // Handle both API format (monthly_budget, boost_package) and local format (months, badge)
    const badgeColor = car.boost_package === 'akcija' ? 'bg-orange-500' 
      : car.boost_package === 'top' ? 'bg-green-500'
      : car.boost_package === 'skok' ? 'bg-blue-500'
      : car.boost_package === 'premium' ? 'bg-purple-500'
      : car.badgeColor || 'bg-orange-500'
    
    const badgeText = car.boost_package === 'akcija' ? '🔥 AKCIJA'
      : car.boost_package === 'top' ? '⭐ TOP'
      : car.boost_package === 'skok' ? '🚀 SKOK'
      : car.boost_package === 'premium' ? '⚡ PREMIUM'
      : car.badge || 'AKCIJA'
    
    const cardBg = car.cardBg || 'bg-white'
    const monthlyBudget = car.monthly_budget || car.months || 36
    const carMileage = Number(car.mileage) || 10000
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <a href={`/cars/${car.id}`} target="_blank" rel="noopener noreferrer" className="block group">
          <div 
            className={`${cardBg} rounded-[20px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.08)] relative hover:shadow-xl transition-shadow`}
            onMouseEnter={startSlideshow}
            onMouseLeave={stopSlideshow}
          >
            {/* Badge */}
            <div className={`absolute top-[15px] left-[15px] z-10 ${badgeColor} text-white text-xs font-semibold px-3 py-1.5 rounded-[10px]`}>
              {badgeText}
            </div>
            
            {/* Financing Badge */}
            {(car.has_financing || car.hasFinancing) && (
              <div className="absolute top-[15px] left-[100px] z-10 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-[10px]">
                💰 Financiranje
              </div>
            )}
            
            {/* Vehicle Condition Badge for Featured */}
            {car.vehicleCondition === 'Vozno' && (
              <div className="absolute top-[15px] z-10 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-[10px]" style={{ left: (car.has_financing || car.hasFinancing) ? '175px' : '100px' }}>
                ✅ Vozno
              </div>
            )}
            {car.vehicleCondition === 'NEvozno' && (
              <div className="absolute top-[15px] z-10 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-[10px]" style={{ left: (car.has_financing || car.hasFinancing) ? '175px' : '100px' }}>
                ❌ NEvozno
              </div>
            )}
            {car.vehicleCondition === 'V okvari' && (
              <div className="absolute top-[15px] z-10 bg-yellow-500 text-white text-xs font-semibold px-3 py-1.5 rounded-[10px]" style={{ left: (car.has_financing || car.hasFinancing) ? '175px' : '100px' }}>
                ⚠️ V okvari
              </div>
            )}
            
            {/* Favorite Heart */}
            <button 
              className="absolute top-[15px] right-[15px] z-10 w-[35px] h-[35px] bg-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.1)]"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleFavorite(car.id)
              }}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            
            {/* Image with slideshow - only plays while hovering */}
            <div className="w-full h-[200px] overflow-hidden bg-gray-100 relative">
              <img
                key={currentImageIndex}
                src={carImages[currentImageIndex]}
                alt={car.title || `${car.brand} ${car.model}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Image dots indicator */}
              {carImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {carImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Premium Comments Badge for Featured */}
              {(car.package === 'premium' || car.package === 'Premium') && (
                <div className="absolute bottom-2 left-2 right-2 bg-purple-600/90 text-white text-xs font-medium px-2 py-1.5 rounded-lg text-center">
                  💬 Komentarji na objavah
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-5">
              {/* Title */}
              <h3 className="font-semibold text-lg mb-2.5 group-hover:text-orange-500 transition-colors">
                {car.title || `${car.brand} ${car.model}`}
              </h3>
              
              {/* Price - show monthly if monthly_budget exists */}
              <div className="text-[22px] font-bold text-[#ff6a00] mb-1">
                {car.monthly_budget || car.monthlyBudget 
                  ? `${Number(car.monthly_budget || car.monthlyBudget || 0)} € / MES.` 
                  : `${Number(car.price || 0).toLocaleString()} €`}
              </div>
              
              {/* Subtitle */}
              <div className="text-sm text-gray-500">
                {car.year} • {carMileage.toLocaleString()} km • {car.fuel_type || car.fuelType}
              </div>
            </div>
          </div>
        </a>
      </motion.div>
    )
  }
  
  // Default card layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <a href={`/cars/${car.id}`} target="_blank" rel="noopener noreferrer" className="block group">
        <div className="card card-hover h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg">
          <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
            <img
              src={car.images?.[0] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800'}
              alt={car.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {car.featured && (
              <span className="absolute top-3 left-3 bg-[#ff6a00] text-white text-xs font-bold px-2 py-1 rounded">Featured</span>
            )}
            
            {/* Premium Badge - HD Quality */}
            {(car.package === 'premium' || car.package === 'Premium') && (
              <span className="absolute top-3 left-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                ⚡ HD
              </span>
            )}
            
            {/* Premium - Comments on Posts Badge */}
            {(car.package === 'premium' || car.package === 'Premium') && (
              <div className="absolute bottom-2 left-2 right-2 bg-purple-600/90 text-white text-xs font-medium px-2 py-1.5 rounded-lg text-center">
                💬 Komentarji na objavah
              </div>
            )}
            
            {/* Promotion Badges */}
            {car.promoted && car.boostPackage === 'akcija' && (
              <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">🔥 AKCIJA</span>
            )}
            {car.promoted && car.boostPackage === 'top' && (
              <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">⭐ TOP</span>
            )}
            {car.promoted && car.boostPackage === 'skok' && (
              <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">🚀 SKOK</span>
            )}
            {car.promoted && car.boostPackage?.includes('_p') && (
              <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">🔥 AKCIJA</span>
            )}
            
            {/* Vehicle Condition Badge */}
            {car.vehicleCondition === 'Vozno' && (
              <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">✅ Vozno</span>
            )}
            {car.vehicleCondition === 'NEvozno' && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">❌ NEvozno</span>
            )}
            {car.vehicleCondition === 'V okvari' && (
              <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">⚠️ V okvari</span>
            )}
            
            {/* Financing Badge */}
            {car.hasFinancing && (
              <span className="absolute top-3 right-14 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                💳 Fin.
              </span>
            )}
            <button 
              className={`absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center transition-colors shadow-lg ${
                isFav ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleFavorite(car.id)
              }}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {car.title}
            </h3>
            <div className="mt-auto">
              {car.hasFinancing && car.monthlyBudget ? (
                <div>
                  <span className="text-2xl font-bold text-green-600">{car.monthlyBudget} €/mes.</span>
                  {car.downPaymentValue && (
                    <div className="text-xs text-gray-500 mt-1">
                      + predplačilo: {car.downPaymentType === 'percentage' ? `${car.downPaymentValue}%` : `${car.downPaymentValue} €`}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 line-through mt-1">
                    ali {Number(car.price || 0).toLocaleString()} €
                  </div>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">€{Number(car.price || 0).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}
