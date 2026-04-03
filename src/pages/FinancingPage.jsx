import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpDown, ArrowLeft, Car } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CarCard } from '@/components/features/CarCard'
import { useLanguage } from '@/lib/LanguageContext'
import { useCars } from '@/lib/CarContext'

const sortOptions = [
  { value: 'newest', label: 'Najnovejše' },
  { value: 'price-low', label: 'Cena: najnižja' },
  { value: 'price-high', label: 'Cena: najvišja' },
  { value: 'mileage-low', label: 'Kilometri: najmanj' },
  { value: 'year-new', label: 'Leto: najnovejše' },
]

export function FinancingPage() {
  const { language } = useLanguage()
  const isSl = language === 'sl'
  const { cars } = useCars()
  const [sortBy, setSortBy] = useState('newest')
  const navigate = useNavigate()

  // Filter cars with financing
  const financedCars = useMemo(() => {
    let result = [...cars]

    // Remove duplicates
    const uniqueCars = result.reduce((acc, car) => {
      if (!acc.find(c => c.id === car.id)) {
        acc.push(car)
      }
      return acc
    }, [])
    result = uniqueCars

    // Filter only cars with financing
    result = result.filter(car =>
      car.status !== 'inactive' &&
      (car.hasFinancing === true || car.hasFinancing === 1 || car.has_financing === true || car.has_financing === 1)
    )
    
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
  }, [cars, sortBy])

  return (
    <div className="min-h-screen">
      {/* ===== HERO BANNER ===== */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {isSl ? 'Nazaj' : 'Back'}
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {isSl ? 'Financiranje' : 'Financing'}
            </h1>
            
            <p className="text-gray-300">
              {financedCars.length} {financedCars.length === 1 ? 'vozilo' : 'vozil'} najdeno
            </p>
          </motion.div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="text-gray-600">
            {financedCars.length} {financedCars.length === 1 ? 'vozilo' : 'vozil'}
          </div>

          <div className="flex items-center gap-3">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cars Grid */}
        {financedCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {financedCars.map((car, index) => (
              <CarCard
                key={car.id}
                car={car}
                index={index}
                featured={!!car.promoted}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Ni vozil
            </h3>
            <p className="text-white/70 mb-6">
              Poskusite spremeniti iskalne kriterije
            </p>
            <Link to="/cars">
              <Button variant="secondary">
                {isSl ? 'Pojdi na vsa vozila' : 'Go to all cars'}
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
