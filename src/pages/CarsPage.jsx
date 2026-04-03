import { useState, useMemo } from 'react'
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpDown, Heart, ArrowLeft, Car } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CarCard } from '@/components/features/CarCard'
import { useCars } from '@/lib/CarContext'
import { useFavorites } from '@/lib/FavoritesContext'
import { useLanguage } from '@/lib/LanguageContext'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'mileage-low', label: 'Mileage: Low to High' },
  { value: 'year-new', label: 'Year: Newest First' },
]

export function CarsPage() {
  const [searchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState('newest')
  const { cars } = useCars()
  const { favorites } = useFavorites()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  
  // Get filters from URL (from HomePage search)
  const searchQuery = searchParams.get('q') || ''
  const brandsParam = searchParams.get('brands') || ''
  const modelsParam = searchParams.get('models') || '' // Format: brand:model1,model2|brand2:model3
  const priceTo = searchParams.get('priceTo') || ''
  const mileageTo = searchParams.get('mileageTo') || ''
  const yearTo = searchParams.get('yearTo') || ''
  const citiesParam = searchParams.get('cities') || ''
  const fuelParam = searchParams.get('fuel') || ''
  const vehicleType = searchParams.get('type') || ''
  const financingParam = searchParams.get('financing') || ''
  
  // Parse models parameter into a usable format
  // Two formats supported:
  // 1. From HomePage: brand:model1,model2|brand2:model3
  // 2. From SearchFilters: model=model1&model=model2 (multiple params)
  const parsedModels = useMemo(() => {
    if (!modelsParam && !searchParams.getAll('model').length) return {}
    
    const models = {}
    
    // Format 1: HomePage format
    if (modelsParam) {
      modelsParam.split('|').forEach(entry => {
        const [brand, modelList] = entry.split(':')
        if (brand && modelList) {
          models[brand.toLowerCase()] = modelList.split(',').map(m => m.toLowerCase())
        }
      })
    }
    
    // Format 2: SearchFilters format (model=xxx multiple params)
    const filterModels = searchParams.getAll('model')
    if (filterModels.length > 0) {
      // If brands are also specified, map models to those brands
      if (brandsParam) {
        const brands = brandsParam.split(',').map(b => b.toLowerCase())
        filterModels.forEach((model, index) => {
          const brand = brands[index % brands.length] || brands[0]
          if (!models[brand]) models[brand] = []
          if (!models[brand].includes(model.toLowerCase())) {
            models[brand].push(model.toLowerCase())
          }
        })
      } else {
        // No brand specified, add to a catch-all
        models['*'] = filterModels.map(m => m.toLowerCase())
      }
    }
    
    return models
  }, [modelsParam, searchParams])
  
  // Check if we're on financing page (either /financing or /cars/financing path)
  const isFinancingPage = financingParam === 'true' || location.pathname === '/financing' || location.pathname === '/cars/financing'
  
  // Get deactivated cars from localStorage
  const [deactivatedCars] = useState(() => {
    const saved = localStorage.getItem('deactivatedCars')
    return saved ? JSON.parse(saved) : []
  })
  
  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let result = [...cars]
    
    // Remove duplicates
    const uniqueCars = result.reduce((acc, car) => {
      if (!acc.find(c => c.id === car.id)) {
        acc.push(car)
      }
      return acc
    }, [])
    result = uniqueCars
    
    // Filter out deactivated cars
    result = result.filter(car => !deactivatedCars.includes(car.id))
    
    // Filter by status (only active)
    result = result.filter(car => car.status !== 'inactive')
    
    // Filter by vehicle type (used/new/electric)
    if (vehicleType === 'used' || vehicleType === 'rabljena') {
      result = result.filter(car => car.year < 2024)
    } else if (vehicleType === 'new' || vehicleType === 'nova') {
      result = result.filter(car => car.year >= 2024)
    } else if (vehicleType === 'electric' || vehicleType === 'električna' || vehicleType === 'Electric') {
      result = result.filter(car => {
        const fuel = car.fuel_type?.toLowerCase() || ''
        return fuel === 'električni' || fuel === 'electric' || fuel.includes('electric')
      })
    }
    
    // Filter by brands (multiple)
    if (brandsParam) {
      const brands = brandsParam.split(',').map(b => b.toLowerCase())
      result = result.filter(car => brands.includes(car.brand?.toLowerCase()))
    }
    
    // Filter by models (if specified)
    if ((modelsParam || searchParams.getAll('model').length > 0) && Object.keys(parsedModels).length > 0) {
      result = result.filter(car => {
        const carBrand = car.brand?.toLowerCase()
        const carModel = car.model?.toLowerCase()
        
        // Check for catch-all models (when no brand specified)
        if (parsedModels['*']) {
          return parsedModels['*'].some(selectedModel => 
            carModel?.includes(selectedModel) || selectedModel.includes(carModel)
          )
        }
        
        // If the car's brand has specific models listed
        if (parsedModels[carBrand]) {
          // Check if the car's model matches any of the selected models for this brand
          return parsedModels[carBrand].some(selectedModel => 
            carModel?.includes(selectedModel) || selectedModel.includes(carModel)
          )
        }
        return true
      })
    }
    
    // Filter by fuel type (multiple)
    if (fuelParam) {
      const fuels = fuelParam.split(',').map(f => {
        const lower = f.toLowerCase()
        // Map English fuel names to Slovenian
        if (lower === 'electric') return 'električni'
        if (lower === 'diesel' || lower === 'dizel') return 'dizel'
        if (lower === 'hybrid' || lower === 'hibridni') return 'hibridni'
        if (lower === 'petrol' || lower === 'gasoline' || lower === 'bencin') return 'bencin'
        if (lower === 'lpg' || lower === 'plin') return 'plin'
        return lower
      })
      result = result.filter(car => {
        const carFuel = car.fuel_type?.toLowerCase() || ''
        return fuels.some(f => carFuel === f || carFuel.includes(f) || f.includes(carFuel))
      })
    }
    
    // Filter by cities (multiple)
    if (citiesParam) {
      const cities = citiesParam.split(',').map(c => c.toLowerCase())
      result = result.filter(car => cities.includes(car.city?.toLowerCase()))
    }
    
    // Filter by price
    if (priceTo) {
      const maxPrice = parseInt(priceTo)
      result = result.filter(car => (car.price || 0) <= maxPrice)
    }
    
    // Filter by mileage
    if (mileageTo) {
      const maxMileage = parseInt(mileageTo)
      result = result.filter(car => (car.mileage || 0) <= maxMileage)
    }
    
    // Filter by year
    if (yearTo) {
      const maxYear = parseInt(yearTo)
      result = result.filter(car => car.year <= maxYear)
    }
    
    // Filter by financing
    if (isFinancingPage) {
      result = result.filter(car => car.hasFinancing === true || car.hasFinancing === 1 || car.has_financing === true || car.has_financing === 1)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(car => 
        car.title?.toLowerCase().includes(query) ||
        car.brand?.toLowerCase().includes(query) ||
        car.model?.toLowerCase().includes(query) ||
        car.description?.toLowerCase().includes(query)
      )
    }
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'mileage-low':
        result.sort((a, b) => (a.mileage || 0) - (b.mileage || 0))
        break
      case 'year-new':
        result.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    
    return result
  }, [searchQuery, brandsParam, priceTo, mileageTo, yearTo, citiesParam, fuelParam, vehicleType, sortBy, cars, isFinancingPage])
  
  // Get page title based on filters
  const getPageTitle = () => {
    if (isFinancingPage) return 'Vozila na financiranje'
    if (vehicleType === 'used' || vehicleType === 'rabljena') return 'Rabljena vozila'
    if (vehicleType === 'new' || vehicleType === 'nova') return 'Nova vozila'
    if (vehicleType === 'electric' || vehicleType === 'električna') return 'Električna vozila'
    if (searchQuery) return `Search: ${searchQuery}`
    if (brandsParam) return brandsParam.split(',').join(', ')
    if (fuelParam && (fuelParam.toLowerCase().includes('electric') || fuelParam.toLowerCase().includes('električ') || fuelParam.toLowerCase().includes('elektric'))) {
      return language === 'sl' ? 'Električna vozila' : 'Electric Vehicles'
    }
    return language === 'sl' ? 'Vsa vozila' : 'All Vehicles'
  }
  
  // Get search subtitle with count
  const getSearchSubtitle = () => {
    if (searchQuery) {
      return `"${searchQuery}": ${filteredCars.length} ${filteredCars.length === 1 ? 'vozilo' : 'vozil'}`
    }
    return null
  }
  
  return (
    <div className="min-h-screen">
      {/* ===== HERO BANNER ===== */}
      <div className="py-16">
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button - show for Rabljena, Nova, Električna, Financiranje */}
          {(vehicleType === 'used' || vehicleType === 'rabljena' || vehicleType === 'new' || vehicleType === 'nova' || vehicleType === 'electric' || vehicleType === 'električna' || isFinancingPage || (fuelParam && (fuelParam?.toLowerCase().includes('electric') || fuelParam?.toLowerCase().includes('električ')))) && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-900 hover:text-gray-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {language === 'sl' ? 'Nazaj' : 'Back'}
            </button>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {getPageTitle()}
            </h1>
            {getSearchSubtitle() ? (
              <p className="text-gray-600">{getSearchSubtitle()}</p>
            ) : (
              <p className="text-gray-600">
                {filteredCars.length} {filteredCars.length === 1 ? 'vozilo' : 'vozil'} najdeno
              </p>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* ===== CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Promoted Cars Section */}
        {filteredCars.some(car => car.promoted) && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⭐</span> Promovirana vozila
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCars.filter(car => car.promoted).slice(0, 4).map((car, index) => (
                <CarCard key={car.id} car={car} index={index} featured />
              ))}
            </div>
          </div>
        )}
        
        {/* Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="text-gray-600">
            {filteredCars.length} results
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Results Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} featured />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-[#FFFFFF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-[#FFFFFF]" />
            </div>
            <h3 className="text-xl font-semibold text-[#FFFFFF] mb-2">
              Ni vozil
            </h3>
            <p className="text-[#FFFFFF]/70 mb-6">
              Poskusite spremeniti iskalne kriterije
            </p>
            <Link to="/cars">
              <Button variant="secondary">
                Počisti filtre
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
