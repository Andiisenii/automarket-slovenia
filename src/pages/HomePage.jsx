import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CarCard } from '@/components/features/CarCard'
import { useCars } from '@/lib/CarContext'
import { useLanguage } from '@/lib/LanguageContext'
import { useFavorites } from '@/lib/FavoritesContext'
import { getAllBrands, getModelsForBrand, getAllCities } from '@/lib/data'

export function HomePage() {
  const { cars } = useCars()
  const { t, language, setLanguage } = useLanguage()
  const { favorites } = useFavorites()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Check if URL has type=new (new cars with year >= 2024, mileage <= 30000)
  const urlType = searchParams.get('type')
  const isNewCarsFilter = urlType === 'new'
  
  // Get dynamic brands from API (async)
  const [allBrands, setAllBrands] = useState([])
  const [allCities, setAllCities] = useState([])
  
  useEffect(() => {
    // Fetch brands and cities from API
    const fetchData = async () => {
      try {
        const brands = await getAllBrands()
        setAllBrands(brands || [])
        
        const cities = await getAllCities()
        setAllCities(cities || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])
  
  // State for search
  const [searchText, setSearchText] = useState('')
  const [vehicleType, setVehicleType] = useState('avto')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedModels, setSelectedModels] = useState({}) // { brand: [models] }
  const [priceTo, setPriceTo] = useState('')
  const [mileageTo, setMileageTo] = useState(isNewCarsFilter ? '30000' : '')
  const [yearTo, setYearTo] = useState(isNewCarsFilter ? '2024' : '')
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedFuel, setSelectedFuel] = useState([])
  
  // Filter brands based on vehicle type
  const filteredBrands = useMemo(() => {
    if (!allBrands || allBrands.length === 0) return []
    
    const vehicleTypeBrands = {
      'avto': ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Porsche', 'Opel', 'Toyota', 'Honda', 'Mazda', 'Nissan', 'Lexus', 'Subaru', 'Mitsubishi', 'Suzuki', 'Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Tesla', 'Renault', 'Peugeot', 'Citroen', 'Fiat', 'Alfa Romeo', 'Hyundai', 'Kia', 'Genesis', 'Jaguar', 'Land Rover', 'Mini', 'Volvo', 'Skoda', 'Seat', 'Cupra', 'Dacia', 'Smart', 'Chrysler', 'Cadillac', 'Buick', 'GMC', 'Lincoln', 'Acura', 'Infiniti', 'Maserati', 'Bentley', 'Ferrari', 'Lamborghini', 'Aston Martin', 'Rolls-Royce', 'McLaren', 'Bugatti', 'Pagani', 'Polestar', 'Lucid', 'Rivian', 'DS'],
      'motor': ['Harley-Davidson', 'Yamaha', 'Honda Motorcycle', 'Kawasaki', 'Suzuki Motorcycle', 'BMW Motorrad', 'Ducati', 'Triumph', 'KTM', 'Piaggio', 'Vespa', 'Motorcycle'],
      'kamion': ['Ford Trucks', 'Chevrolet Trucks', 'RAM Trucks', 'GMC Trucks', 'Toyota Trucks', 'Nissan Trucks', 'Truck'],
      'kombi': ['Mercedes-Benz Vans', 'Ford Vans', 'Renault Vans', 'Peugeot Vans', 'Citroen Vans', 'Van'],
      'suv': ['Jeep SUV', 'Land Rover SUV', 'Range Rover', 'Toyota SUV', 'Ford SUV', 'Chevrolet SUV', 'SUV']
    }
    
    const allowedBrands = vehicleTypeBrands[vehicleType] || vehicleTypeBrands['avto']
    
    return allBrands.filter(brand => allowedBrands.includes(brand))
  }, [allBrands, vehicleType])
  const slovenianCities = allCities.length > 0 ? allCities : [
    'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper', 'Nova Gorica',
    'Krško', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik', 'Jesenice', 'Žalec',
    'Žirovnica', 'Bled', 'Bohinj', 'Brežice', 'Cerklje ob Krki', 'Cerknica',
    'Cerkno', 'Crnomelj', 'Dravograd', 'Gornja Radgona', 'Grosuplje', 'Hrastnik',
    'Idrija', 'Ilirska Bistrica', 'Izola', 'Jurovski Dol', 'Kanal ob Soči',
    'Kočevje', 'Komen', 'Kozina', 'Kranjska Gora', 'Lendava', 'Litija', 'Logatec',
    'Metlika', 'Mežica', 'Murska Sobota', 'Muta', 'Nazaret', 'Ormož', 'Piran',
    'Postojna', 'Prevalje', 'Radeče', 'Radlje ob Dravi', 'Radovljica', 'Ravne na Koroškem',
    'Ribnica', 'Rogaška Slatina', 'Rogatec', 'Ruše', 'Sežana', 'Slovenska Bistrica',
    'Slovenske Konjice', 'Šentjur', 'Škofja Loka', 'Šmarje pri Jelšah', 'Tolmin',
    'Trebnje', 'Tržič', 'Turnišče', 'Velenje', 'Vinica', 'Vipava', 'Vitanje',
    'Vodice', 'Vožec', 'Zagorje ob Savi', 'Zavrč', 'Zreče', 'Železniki'
  ]
  
  // Fuel types
  const fuelTypes = ['Bencin', 'Dizel', 'Hybrid', 'Električni', 'Plin (LPG)']
  
  // Year options (2025 to 2100)
  const yearOptions = Array.from({ length: 76 }, (_, i) => 2025 + i)
  
  // Price options (simplified: 0 to 1M+)
  const priceOptions = [
    '', '0', '100', '1000', '10000', '100000', '1000000'
  ]
  
  // Mileage options (simplified: 0 to 1M+)
  const mileageOptions = [
    '', '0', '100', '1000', '10000', '100000', '1000000'
  ]
  
  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchText) params.set('q', searchText)
    if (selectedBrands.length) params.set('brands', selectedBrands.join(','))
    // Add models to URL - format: brand1:model1,model2|brand2:model3
    const modelsParam = Object.entries(selectedModels)
      .filter(([_, models]) => models.length > 0)
      .map(([brand, models]) => `${brand}:${models.join(',')}`)
      .join('|')
    if (modelsParam) params.set('models', modelsParam)
    if (priceTo) params.set('priceTo', priceTo)
    if (mileageTo) params.set('mileageTo', mileageTo)
    if (yearTo) params.set('yearTo', yearTo)
    if (selectedCities.length) params.set('cities', selectedCities.join(','))
    if (selectedFuel.length) params.set('fuel', selectedFuel.join(','))
    if (vehicleType) params.set('type', vehicleType)
    
    navigate(`/cars?${params.toString()}`)
  }
  
  // Toggle brand selection
  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
    // Clear models when brand is removed
    if (selectedBrands.includes(brand)) {
      setSelectedModels(prev => {
        const newModels = { ...prev }
        delete newModels[brand]
        return newModels
      })
    }
  }
  
  // Toggle model selection for a specific brand
  const toggleModel = (brand, model) => {
    setSelectedModels(prev => {
      const brandModels = prev[brand] || []
      const newBrandModels = brandModels.includes(model)
        ? brandModels.filter(m => m !== model)
        : [...brandModels, model]
      return { ...prev, [brand]: newBrandModels }
    })
  }
  
  // State for models (loaded when brand is selected)
  const [brandModels, setBrandModels] = useState({})
  
  // Fetch models when a brand is selected
  useEffect(() => {
    const fetchModels = async () => {
      for (const brand of selectedBrands) {
        if (!brandModels[brand]) {
          const models = await getModelsForBrand(brand)
          setBrandModels(prev => ({ ...prev, [brand]: models }))
        }
      }
    }
    if (selectedBrands.length > 0) {
      fetchModels()
    }
  }, [selectedBrands])
  
  // Get available models for a brand
  const getBrandModels = (brand) => {
    return brandModels[brand] || []
  }
  
  // Toggle city selection
  const toggleCity = (city) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }
  
  // Toggle fuel selection
  const toggleFuel = (fuel) => {
    setSelectedFuel(prev => 
      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
    )
  }
  
  // Get promoted cars first, then regular cars (filtered by year/mileage for new cars)
  const getDisplayedCars = () => {
    if (cars.length === 0) return []
    
    // Apply year filter for new cars
    let filteredCars = cars
    if (isNewCarsFilter) {
      filteredCars = cars.filter(car => 
        car.year && car.year >= 2024 && 
        car.mileage && parseInt(car.mileage) <= 30000
      )
    }
    
    // Separate promoted and regular cars
    const promotedCars = filteredCars.filter(car => car.promoted)
    const regularCars = filteredCars.filter(car => !car.promoted)
    
    // Return promoted first (max 8), then regular
    return [...promotedCars.slice(0, 8), ...regularCars.slice(0, 8)]
  }
  
  const displayedCars = getDisplayedCars()
  const promotedCars = displayedCars.filter(car => car.promoted)
  const regularCars = displayedCars.filter(car => !car.promoted)
  
  // Get count of matching cars based on current filters
  const getMatchingCarCount = () => {
    if (cars.length === 0) return 0
    
    let result = [...cars]
    
    // Filter by brand
    if (selectedBrands.length > 0) {
      result = result.filter(car => 
        selectedBrands.includes(car.brand)
      )
    }
    
    // Filter by model
    if (Object.keys(selectedModels).length > 0) {
      result = result.filter(car => {
        const carModel = car.model?.toLowerCase()
        const brandModels = selectedModels[car.brand] || []
        return brandModels.some(m => carModel?.includes(m.toLowerCase()))
      })
    }
    
    // Filter by fuel
    if (selectedFuel.length > 0) {
      result = result.filter(car => 
        selectedFuel.includes(car.fuelType)
      )
    }
    
    // Filter by city
    if (selectedCities.length > 0) {
      result = result.filter(car => 
        selectedCities.includes(car.location)
      )
    }
    
    // Filter by price
    if (priceTo) {
      result = result.filter(car => 
        car.price && parseInt(car.price) <= parseInt(priceTo)
      )
    }
    
    // Filter by mileage
    if (mileageTo) {
      result = result.filter(car => 
        car.mileage && parseInt(car.mileage) <= parseInt(mileageTo)
      )
    }
    
    // Filter by year - for new cars filter: year >= 2024, otherwise year <= yearTo
    if (isNewCarsFilter) {
      // New cars: year >= 2024
      result = result.filter(car => 
        car.year && car.year >= 2024
      )
    } else if (yearTo) {
      result = result.filter(car => 
        car.year && car.year <= parseInt(yearTo)
      )
    }
    
    return result.length
  }
  
  const matchingCount = getMatchingCarCount()
  
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* ===== HERO ===== */}
      <section 
        className="min-h-[60vh] md:min-h-screen bg-cover bg-center relative flex justify-center text-center text-white pb-[60px] md:pb-[100px]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#f5f6f8]"></div>
        
        <div className="relative z-10 w-full max-w-[800px] px-4 sm:px-6 pt-[80px] md:pt-[120px]">
          {isNewCarsFilter ? (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold mb-6 md:mb-10">
              {language === 'sl' ? 'Nova vozila (2024+)' : 'New Vehicles (2024+)'}
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold mb-6 md:mb-10">
              {language === 'sl' ? 'Milijoni vozil. Na enem mestu.' : 'Millions of Vehicles. In One Place.'}
            </h1>
          )}
          
          {/* ===== SEARCH BOX ===== */}
          <div className="bg-white p-6 rounded-[20px] shadow-[0_25px_50px_rgba(0,0,0,0.15)]">
            {/* Search Top */}
            <div className="flex flex-wrap gap-[15px] mb-5">
              <input
                type="text"
                placeholder={language === 'sl' ? 'Išči avtomobil...' : 'Search cars...'}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-[15px] rounded-[14px] border border-gray-300 text-gray-900 text-base"
              />
              <button 
                onClick={handleSearch}
                className="bg-[#ff6a00] border-none text-white px-8 py-[15px] rounded-[14px] font-semibold cursor-pointer hover:bg-[#ff7f2a] transition-colors"
              >
                {language === 'sl' ? 'Poišči' : 'Search'}
              </button>
              {(selectedBrands.length > 0 || selectedModels || selectedFuel.length > 0 || selectedCities.length > 0 || priceTo || mileageTo || yearTo) && (
                <button 
                  onClick={() => {
                    setSearchText('')
                    setSelectedBrands([])
                    setSelectedModels({})
                    setPriceTo('')
                    setMileageTo('')
                    setYearTo('')
                    setSelectedCities([])
                    setSelectedFuel([])
                  }}
                  className="bg-gray-200 border-none text-gray-700 px-6 py-[15px] rounded-[14px] font-semibold cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  {language === 'sl' ? 'Razveljavi' : 'Reset'}
                </button>
              )}
            </div>
            
            {/* Matching Cars Count - only show when filters are selected */}
            {(selectedBrands.length > 0 || Object.keys(selectedModels).length > 0 || selectedFuel.length > 0 || selectedCities.length > 0 || priceTo || mileageTo || yearTo || searchText) && matchingCount > 0 && (
              <div className="text-center mt-3 text-sm text-green-600 font-medium">
                {matchingCount} {language === 'sl' ? 'makina jan gjithsej' : 'vehicles total'}
              </div>
            )}
            
            {/* Filters Grid - Simplified */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-[15px] mb-0">
              {/* Znamka (Brand) - Multi Select */}
              <div className="relative">
                <select 
                  className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                  onChange={(e) => {
                    if (e.target.value) toggleBrand(e.target.value)
                  }}
                >
                  <option value="">{language === 'sl' ? 'Znamka' : 'Brand'} ({selectedBrands.length})</option>
                  {filteredBrands.map(brand => (
                    <option key={brand} value={brand}>{selectedBrands.includes(brand) ? '✓ ' : ''}{brand}</option>
                  ))}
                </select>
                {selectedBrands.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedBrands.map(brand => (
                      <span key={brand} className="text-xs bg-[#ff6a00] text-white px-2 py-1 rounded-full flex items-center gap-1">
                        {brand}
                        <button onClick={() => toggleBrand(brand)} className="ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Model - Shows only when brand is selected */}
              {selectedBrands.length > 0 && (
                <div className="relative">
                  <select 
                    className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                    onChange={(e) => {
                      if (e.target.value) {
                        // Add to first selected brand
                        toggleModel(selectedBrands[0], e.target.value)
                      }
                    }}
                  >
                    <option value="">{language === 'sl' ? 'Model' : 'Model'}</option>
                    {selectedBrands.map(brand => (
                      <optgroup key={brand} label={brand}>
                        {getBrandModels(brand).map(model => (
                          <option key={model} value={model}>
                            {(selectedModels[brand] || []).includes(model) ? '✓ ' : ''}{model}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {Object.entries(selectedModels).some(([_, models]) => models.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(selectedModels).map(([brand, models]) => 
                        models.map(model => (
                          <span key={`${brand}-${model}`} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                            {model}
                            <button onClick={() => toggleModel(brand, model)} className="ml-1">×</button>
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Cena (Price) - Only "do" */}
              <select 
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer"
              >
                <option value="">{language === 'sl' ? 'Cena do' : 'Price up to'}</option>
                {priceOptions.filter(p => p).map(price => (
                  <option key={price} value={price}>{price === '1000000' ? '1.000.000+' : price + ' €'}</option>
                ))}
              </select>
              
              {/* Kilometri (Mileage) - Only "do" */}
              <select 
                value={mileageTo}
                onChange={(e) => setMileageTo(e.target.value)}
                className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer"
              >
                <option value="">{language === 'sl' ? 'Kilometri do' : 'Mileage up to'}</option>
                {mileageOptions.filter(m => m).map(mileage => (
                  <option key={mileage} value={mileage}>{mileage === '1000000' ? '1.000.000+ km' : mileage + ' km'}</option>
                ))}
              </select>
              
              {/* Registracija (Year) - Only "do" */}
              <select 
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer"
              >
                <option value="">{language === 'sl' ? 'Registracija do' : 'Year up to'}</option>
                {yearOptions.filter(y => y).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              {/* Lokacija (City) - Multi Select */}
              <div className="relative">
                <select 
                  className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                  onChange={(e) => {
                    if (e.target.value) toggleCity(e.target.value)
                  }}
                >
                  <option value="">{language === 'sl' ? 'Lokacija' : 'Location'} ({selectedCities.length})</option>
                  {slovenianCities.map(city => (
                    <option key={city} value={city}>{selectedCities.includes(city) ? '✓ ' : ''}{city}</option>
                  ))}
                </select>
                {selectedCities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedCities.slice(0, 3).map(city => (
                      <span key={city} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                        {city}
                        <button onClick={() => toggleCity(city)} className="ml-1">×</button>
                      </span>
                    ))}
                    {selectedCities.length > 3 && (
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full">+{selectedCities.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Gorivo (Fuel) - Multi Select */}
              <div className="relative">
                <select 
                  className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                  onChange={(e) => {
                    if (e.target.value) toggleFuel(e.target.value)
                  }}
                >
                  <option value="">{language === 'sl' ? 'Gorivo' : 'Fuel'} ({selectedFuel.length})</option>
                  {fuelTypes.map(fuel => (
                    <option key={fuel} value={fuel}>{selectedFuel.includes(fuel) ? '✓ ' : ''}{fuel}</option>
                  ))}
                </select>
                {selectedFuel.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedFuel.map(fuel => (
                      <span key={fuel} className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                        {fuel}
                        <button onClick={() => toggleFuel(fuel)} className="ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Vehicle Types */}
            <div className="flex flex-wrap gap-2 md:gap-5 mt-5">
              <button 
                onClick={() => setVehicleType('avto')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] cursor-pointer transition-colors ${vehicleType === 'avto' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚗 {language === 'sl' ? 'Avto' : 'Car'}
              </button>
              <button 
                onClick={() => setVehicleType('motor')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] cursor-pointer transition-colors ${vehicleType === 'motor' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🏍 {language === 'sl' ? 'Motor' : 'Motorcycle'}
              </button>
              <button 
                onClick={() => setVehicleType('kamion')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] cursor-pointer transition-colors ${vehicleType === 'kamion' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚚 {language === 'sl' ? 'Kamion' : 'Truck'}
              </button>
              <button 
                onClick={() => setVehicleType('kombi')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] cursor-pointer transition-colors ${vehicleType === 'kombi' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚐 {language === 'sl' ? 'Kombi' : 'Van'}
              </button>
              <button 
                onClick={() => setVehicleType('suv')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] cursor-pointer transition-colors ${vehicleType === 'suv' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚙 SUV {matchingCount > 0 && `(${matchingCount})`}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* ===== SECTION ===== */}
      <section className="px-4 sm:px-6 lg:px-[60px] py-12 md:py-20 -mt-20 relative z-20">
        
        {/* Promoted Cars Section */}
        {promotedCars.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[28px] font-bold">
                <span className="text-[#ff6a00]">🔥 {language === 'sl' ? 'PROMOVIRANA' : 'PROMOTED'}</span> {language === 'sl' ? 'vozila' : 'vehicles'}
              </h2>
              <Link to="/cars" className="text-gray-600 hover:text-[#ff6a00] font-medium">
                {language === 'sl' ? 'Vidi vse →' : 'View all →'}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[25px]">
              {promotedCars.slice(0, 4).map((car, index) => (
                <CarCard key={car.id || index} car={car} index={index} featured />
              ))}
            </div>
          </div>
        )}
        
        {/* Regular Cars Section */}
        {regularCars.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[28px] font-bold">
                <span className="text-[#ff6a00]">{language === 'sl' ? 'Top PONUDBE' : 'Top DEALS'}</span> {language === 'sl' ? 'zate' : 'for you'}
              </h2>
              <Link to="/cars" className="text-gray-600 hover:text-[#ff6a00] font-medium">
                {language === 'sl' ? 'Vidi več ponudb →' : 'View more →'}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[25px]">
              {regularCars.slice(0, 4).map((car, index) => (
                <CarCard key={car.id || index} car={car} index={index} featured />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
