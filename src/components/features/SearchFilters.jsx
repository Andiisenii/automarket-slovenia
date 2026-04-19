import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, Check, Plus, Car, Bike, Truck, Van } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getAllBrands, getModelsForBrand, getAllCities, fuelTypes, transmissions, bodyTypes, vehicleCategories, vehicleSubCategories } from '@/lib/data'
import { useCars } from '@/lib/CarContext'
import { useLanguage } from '@/lib/LanguageContext'

export function SearchFilters({ onSearch, onClear }) {
  const { t, language } = useLanguage()
  const isSl = language === 'sl'
  const { cars } = useCars()
  const [searchParams, setSearchParams] = useSearchParams()
  const dropdownRef = useRef(null)
  
  // Get dynamic brands from API + saved custom brands
  const [allBrands, setAllBrands] = useState([])
  const [allCities, setAllCities] = useState([])
  const [brandModels, setBrandModels] = useState({})
  
  // Load saved custom brands and models
  useEffect(() => {
    const savedBrands = JSON.parse(localStorage.getItem('automarket_custom_brands') || '{}')
    const savedCities = JSON.parse(localStorage.getItem('automarket_custom_cities') || '[]')
    
    const fetchData = async () => {
      try {
        const brands = await getAllBrands()
        const combinedBrands = [...new Set([...(brands || []), ...Object.keys(savedBrands)])]
        setAllBrands(combinedBrands)
        
        const cities = await getAllCities()
        const combinedCities = [...new Set([...(cities || []), ...savedCities])]
        setAllCities(combinedCities)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to static data
        setAllBrands(Object.keys(savedBrands).length > 0 ? Object.keys(savedBrands) : ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota'])
        setAllCities(savedCities.length > 0 ? savedCities : ['Ljubljana', 'Maribor', 'Koper', 'Celje'])
      }
    }
    fetchData()
  }, [])
  
  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (filters.brand && !brandModels[filters.brand]) {
        const models = await getModelsForBrand(filters.brand)
        setBrandModels(prev => ({ ...prev, [filters.brand]: models }))
      }
    }
    fetchModels()
  }, [filters.brand])
  
  const initialCity = searchParams.get('city') || ''
  const initialBrand = searchParams.get('brand') || ''
  const initialModels = searchParams.getAll('model') || []
  
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    vehicleCategory: searchParams.get('vehicleCategory') || '',
    vehicleSubCategory: searchParams.get('vehicleSubCategory') || '',
    brand: initialBrand,
    models: initialModels,
    city: initialCity,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    bodyType: searchParams.get('bodyType') || '',
  })
  
  // Get available models for selected brand
  const availableModels = filters.brand ? (brandModels[filters.brand] || []) : []
  
  const [openDropdown, setOpenDropdown] = useState(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      
      // Clear models when brand changes
      if (key === 'brand' && value !== prev.brand) {
        newFilters.models = []
      }
      return newFilters
    })
    
    // For search field, use 'q' in URL
    if (key === 'search') {
      if (value) {
        searchParams.set('q', value)
      } else {
        searchParams.delete('q')
      }
    } else if (key === 'vehicleCategory') {
      if (value) {
        searchParams.set('vehicleCategory', value)
      } else {
        searchParams.delete('vehicleCategory')
      }
      // Clear subcategory when main category changes
      searchParams.delete('vehicleSubCategory')
    } else if (key === 'vehicleSubCategory') {
      if (value) {
        searchParams.set('vehicleSubCategory', value)
      } else {
        searchParams.delete('vehicleSubCategory')
      }
    } else if (key === 'brand') {
      if (value) {
        searchParams.set('brand', value)
      } else {
        searchParams.delete('brand')
      }
      // Clear model params when brand changes
      searchParams.delete('model')
    } else if (key === 'models') {
      // For models, we handle separately in toggleModel
      searchParams.delete('model')
      if (value.length > 0) {
        value.forEach(m => searchParams.append('model', m))
      }
    } else {
      if (value) {
        searchParams.set(key, value)
      } else {
        searchParams.delete(key)
      }
    }
    setSearchParams(searchParams)
  }
  
  // Handle multi-select model toggle
  const toggleModel = (model) => {
    const currentModels = filters.models || []
    let newModels
    if (currentModels.includes(model)) {
      newModels = currentModels.filter(m => m !== model)
    } else {
      newModels = [...currentModels, model]
    }
    handleChange('models', newModels)
  }
  
  // Clear all models
  const clearModels = () => {
    handleChange('models', [])
  }
  
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }
  
  const selectOption = (key, value) => {
    handleChange(key, value)
    setOpenDropdown(null)
  }
  
  const handleSearch = () => {
    onSearch?.(filters)
  }
  
  const handleClear = () => {
    const cleared = Object.keys(filters).reduce((acc, key) => {
      acc[key] = key === 'models' ? [] : ''
      return acc
    }, {})
    setFilters(cleared)
    searchParams.forEach((_, key) => searchParams.delete(key))
    setSearchParams(searchParams)
    onClear?.()
  }
  
  const activeFiltersCount = Object.values(filters).filter(v => v).length
  
  // Reusable dropdown component with scroll
  const FilterDropdown = ({ label, name, value, options }) => (
    <div className="relative" ref={name === openDropdown ? dropdownRef : null}>
      <button
        onClick={() => toggleDropdown(name)}
        className={`w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm ${!value ? 'text-gray-400' : ''}`}
      >
        <span className="truncate">{value || label}</span>
        <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${openDropdown === name ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {openDropdown === name && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto"
          >
            <button
              onClick={() => selectOption(name, '')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${!value ? 'bg-primary-50 text-primary-700 font-medium' : ''}`}
            >
              All
              {!value && <Check className="w-4 h-4 ml-auto" />}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => selectOption(name, opt)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${value === opt ? 'bg-primary-50 text-primary-700 font-medium' : ''}`}
              >
                {opt}
                {value === opt && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  
  // Multi-select Model Filter
  const ModelFilter = () => {
    if (!filters.brand || availableModels.length === 0) return null
    
    return (
      <div className="relative" ref={openDropdown === 'model' ? dropdownRef : null}>
        <button
          onClick={() => toggleDropdown('model')}
          className={`w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm ${filters.models?.length > 0 ? 'text-gray-700' : 'text-gray-400'}`}
        >
          <span className="truncate">
            {filters.models?.length > 0 
              ? `${filters.models.length} model${filters.models.length > 1 ? 's' : ''} selected`
              : 'Model'}
          </span>
          <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${openDropdown === 'model' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {openDropdown === 'model' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto"
            >
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">{availableModels.length} models available</span>
                {filters.models?.length > 0 && (
                  <button onClick={clearModels} className="text-xs text-primary-600 hover:text-primary-700">
                    Clear all
                  </button>
                )}
              </div>
              {availableModels.map((model) => (
                <button
                  key={model}
                  onClick={() => toggleModel(model)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${filters.models?.includes(model) ? 'bg-primary-50 text-primary-700 font-medium' : ''}`}
                >
                  {model}
                  {filters.models?.includes(model) && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  
  // Get dynamic cities - use state from API
  const cityOptions = allCities.length > 0 ? allCities : []
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by make, model, or keyword..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <button onClick={handleClear} className="px-4 py-2 text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4 mr-1 inline" />
              Clear ({activeFiltersCount})
            </button>
          )}
          <button onClick={handleSearch} className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold">
            Search
          </button>
        </div>
      </div>
      
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-2" ref={dropdownRef}>
        
        {/* Vehicle Category */}
        <div className="relative min-w-[160px]" ref={openDropdown === 'vehicleCategory' ? dropdownRef : null}>
          <button
            onClick={() => toggleDropdown('vehicleCategory')}
            className={`w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm ${filters.vehicleCategory ? 'text-gray-700' : 'text-gray-400'}`}
          >
            <span className="flex items-center gap-2 truncate">
              <span className="w-5 h-5 flex items-center justify-center text-base">
                {filters.vehicleCategory === 'avto' && '🚗'}
                {filters.vehicleCategory === 'moto' && '🏍️'}
                {filters.vehicleCategory === 'kamion' && '🚚'}
                {filters.vehicleCategory === 'kombi' && '🚐'}
                {filters.vehicleCategory === 'traktor' && '🚜'}
                {filters.vehicleCategory === 'avtodom' && <img src="/logos/avtodom.png" alt="AvtoDom" className="w-5 h-5 object-contain" />}
              </span>
              {filters.vehicleCategory
                ? vehicleCategories.find(c => c.value === filters.vehicleCategory)?.label
                : 'Vrsta vozila'}
            </span>
            <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${openDropdown === 'vehicleCategory' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {openDropdown === 'vehicleCategory' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[300px] overflow-y-auto"
              >
                {filters.vehicleCategory && (
                  <button
                    onClick={() => {
                      handleChange('vehicleCategory', '')
                      handleChange('vehicleSubCategory', '')
                      setOpenDropdown(null)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-500 border-b border-gray-100"
                  >
                    <X className="w-4 h-4" /> Ponastavi
                  </button>
                )}
                {vehicleCategories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      handleChange('vehicleCategory', cat.value)
                      handleChange('vehicleSubCategory', '')
                      setOpenDropdown(null)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${filters.vehicleCategory === cat.value ? 'bg-primary-50 text-primary-700 font-medium' : ''}`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-base">
                      {cat.value === 'avto' && '🚗'}
                      {cat.value === 'moto' && '🏍️'}
                      {cat.value === 'kamion' && '🚚'}
                      {cat.value === 'kombi' && '🚐'}
                      {cat.value === 'traktor' && '🚜'}
                      {cat.value === 'avtodom' && <img src="/logos/avtodom.png" alt="AvtoDom" className="w-5 h-5 object-contain" />}
                    </span>
                    {cat.label}
                    {filters.vehicleCategory === cat.value && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Vehicle SubCategory */}
        {filters.vehicleCategory && vehicleSubCategories[filters.vehicleCategory]?.options?.length > 0 && (
          <div className="relative min-w-[200px]">
            <select
              value={filters.vehicleSubCategory || ''}
              onChange={(e) => handleChange('vehicleSubCategory', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center]"
            >
              <option value="">Podkategorija</option>
              {vehicleSubCategories[filters.vehicleCategory].options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* City */}
        <div className="relative min-w-[120px]">
          <select
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center]"
          >
            <option value="">Mesto</option>
            {cityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {/* Brand */}
        <div className="relative min-w-[120px]">
          <select
            value={filters.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center]"
          >
            <option value="">Znamka</option>
            {allBrands.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {/* Fuel Type */}
        <div className="relative min-w-[100px]">
          <select
            value={filters.fuelType || ''}
            onChange={(e) => handleChange('fuelType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center]"
          >
            <option value="">Gorivo</option>
            {fuelTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {/* Transmission */}
        <div className="relative min-w-[100px]">
          <select
            value={filters.transmission || ''}
            onChange={(e) => handleChange('transmission', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center]"
          >
            <option value="">Menjalnik</option>
            {transmissions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {/* Body Type */}
        <div className="relative min-w-[100px]">
          <select
            value={filters.bodyType || ''}
            onChange={(e) => handleChange('bodyType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center]"
          >
            <option value="">Tip</option>
            {bodyTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      
      {/* Price and Year Range with DROPDOWNS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
        {/* Cena od - dropdown */}
        <div className="relative">
          <select
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
          >
            <option value="">Cena od</option>
            <option value="100">od 100 EUR</option>
            <option value="500">od 500 EUR</option>
            <option value="1000">od 1.000 EUR</option>
            <option value="1500">od 1.500 EUR</option>
            <option value="2000">od 2.000 EUR</option>
            <option value="2500">od 2.500 EUR</option>
            <option value="3000">od 3.000 EUR</option>
            <option value="3500">od 3.500 EUR</option>
            <option value="4000">od 4.000 EUR</option>
            <option value="4500">od 4.500 EUR</option>
            <option value="5000">od 5.000 EUR</option>
            <option value="6000">od 6.000 EUR</option>
            <option value="7000">od 7.000 EUR</option>
            <option value="8000">od 8.000 EUR</option>
            <option value="9000">od 9.000 EUR</option>
            <option value="10000">od 10.000 EUR</option>
            <option value="11000">od 11.000 EUR</option>
            <option value="12000">od 12.000 EUR</option>
            <option value="13000">od 13.000 EUR</option>
            <option value="14000">od 14.000 EUR</option>
            <option value="15000">od 15.000 EUR</option>
            <option value="16000">od 16.000 EUR</option>
            <option value="17000">od 17.000 EUR</option>
            <option value="18000">od 18.000 EUR</option>
            <option value="19000">od 19.000 EUR</option>
            <option value="20000">od 20.000 EUR</option>
            <option value="22500">od 22.500 EUR</option>
            <option value="25000">od 25.000 EUR</option>
            <option value="27500">od 27.500 EUR</option>
            <option value="30000">od 30.000 EUR</option>
            <option value="35000">od 35.000 EUR</option>
            <option value="40000">od 40.000 EUR</option>
            <option value="45000">od 45.000 EUR</option>
            <option value="50000">od 50.000 EUR</option>
            <option value="60000">od 60.000 EUR</option>
            <option value="70000">od 70.000 EUR</option>
            <option value="80000">od 80.000 EUR</option>
            <option value="90000">od 90.000 EUR</option>
            <option value="100000">od 100.000 EUR</option>
          </select>
        </div>
        {/* Cena do - dropdown */}
        <div className="relative">
          <select
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
          >
            <option value="">Cena do</option>
            <option value="100">do 100 EUR</option>
            <option value="500">do 500 EUR</option>
            <option value="1000">do 1.000 EUR</option>
            <option value="1500">do 1.500 EUR</option>
            <option value="2000">do 2.000 EUR</option>
            <option value="2500">do 2.500 EUR</option>
            <option value="3000">do 3.000 EUR</option>
            <option value="3500">do 3.500 EUR</option>
            <option value="4000">do 4.000 EUR</option>
            <option value="4500">do 4.500 EUR</option>
            <option value="5000">do 5.000 EUR</option>
            <option value="6000">do 6.000 EUR</option>
            <option value="7000">do 7.000 EUR</option>
            <option value="8000">do 8.000 EUR</option>
            <option value="9000">do 9.000 EUR</option>
            <option value="10000">do 10.000 EUR</option>
            <option value="11000">do 11.000 EUR</option>
            <option value="12000">do 12.000 EUR</option>
            <option value="13000">do 13.000 EUR</option>
            <option value="14000">do 14.000 EUR</option>
            <option value="15000">do 15.000 EUR</option>
            <option value="16000">do 16.000 EUR</option>
            <option value="17000">do 17.000 EUR</option>
            <option value="18000">do 18.000 EUR</option>
            <option value="19000">do 19.000 EUR</option>
            <option value="20000">do 20.000 EUR</option>
            <option value="22500">do 22.500 EUR</option>
            <option value="25000">do 25.000 EUR</option>
            <option value="27500">do 27.500 EUR</option>
            <option value="30000">do 30.000 EUR</option>
            <option value="35000">do 35.000 EUR</option>
            <option value="40000">do 40.000 EUR</option>
            <option value="45000">do 45.000 EUR</option>
            <option value="50000">do 50.000 EUR</option>
            <option value="60000">do 60.000 EUR</option>
            <option value="70000">do 70.000 EUR</option>
            <option value="80000">do 80.000 EUR</option>
            <option value="90000">do 90.000 EUR</option>
            <option value="100000">do 100.000 EUR</option>
            <option value="150000">do 150.000 EUR</option>
            <option value="200000">do 200.000 EUR</option>
          </select>
        </div>
        {/* Letnik od - dropdown */}
        <div className="relative">
          <select
            value={filters.minYear}
            onChange={(e) => handleChange('minYear', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
          >
            <option value="">Letnik od</option>
            <option value="2026">od 2026</option>
            <option value="2025">od 2025</option>
            <option value="2024">od 2024</option>
            <option value="2023">od 2023</option>
            <option value="2022">od 2022</option>
            <option value="2021">od 2021</option>
            <option value="2020">od 2020</option>
            <option value="2019">od 2019</option>
            <option value="2018">od 2018</option>
            <option value="2017">od 2017</option>
            <option value="2016">od 2016</option>
            <option value="2015">od 2015</option>
            <option value="2014">od 2014</option>
            <option value="2013">od 2013</option>
            <option value="2012">od 2012</option>
            <option value="2011">od 2011</option>
            <option value="2010">od 2010</option>
            <option value="2009">od 2009</option>
            <option value="2008">od 2008</option>
            <option value="2007">od 2007</option>
            <option value="2006">od 2006</option>
            <option value="2005">od 2005</option>
            <option value="2004">od 2004</option>
            <option value="2003">od 2003</option>
            <option value="2002">od 2002</option>
            <option value="2001">od 2001</option>
            <option value="2000">od 2000</option>
            <option value="1990">od 1990</option>
            <option value="1985">od 1985</option>
            <option value="1980">od 1980</option>
            <option value="1975">od 1975</option>
            <option value="1970">od 1970</option>
            <option value="1960">od 1960</option>
          </select>
        </div>
        {/* Letnik do - dropdown */}
        <div className="relative">
          <select
            value={filters.maxYear}
            onChange={(e) => handleChange('maxYear', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
          >
            <option value="">Letnik do</option>
            <option value="2026">do 2026</option>
            <option value="2025">do 2025</option>
            <option value="2024">do 2024</option>
            <option value="2023">do 2023</option>
            <option value="2022">do 2022</option>
            <option value="2021">do 2021</option>
            <option value="2020">do 2020</option>
            <option value="2019">do 2019</option>
            <option value="2018">do 2018</option>
            <option value="2017">do 2017</option>
            <option value="2016">do 2016</option>
            <option value="2015">do 2015</option>
            <option value="2014">do 2014</option>
            <option value="2013">do 2013</option>
            <option value="2012">do 2012</option>
            <option value="2011">do 2011</option>
            <option value="2010">do 2010</option>
            <option value="2009">do 2009</option>
            <option value="2008">do 2008</option>
            <option value="2007">do 2007</option>
            <option value="2006">do 2006</option>
            <option value="2005">do 2005</option>
            <option value="2004">do 2004</option>
            <option value="2003">do 2003</option>
            <option value="2002">do 2002</option>
            <option value="2001">do 2001</option>
            <option value="2000">do 2000</option>
            <option value="1990">do 1990</option>
            <option value="1985">do 1985</option>
            <option value="1980">do 1980</option>
            <option value="1975">do 1975</option>
            <option value="1970">do 1970</option>
            <option value="1960">do 1960</option>
          </select>
        </div>
      </div>
    </div>
  )
}
