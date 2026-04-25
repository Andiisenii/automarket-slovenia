import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CarCard } from '@/components/features/CarCard'
import { useCars } from '@/lib/CarContext'
import { useLanguage } from '@/lib/LanguageContext'
import { useFavorites } from '@/lib/FavoritesContext'
import { getAllBrands, getModelsForBrand, getAllCities, vehicleSubCategories, subCategoryDetails } from '@/lib/data'

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

        // Fetch brand-body-types mapping from Supabase REST API
        try {
          const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pajbxchnenouxeaimsdr.supabase.co'
          const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_CQVFr7jAHNfQV5DXvxQiZg_h7Cq6MRH'

          const response = await fetch(`${SUPABASE_URL}/rest/v1/brand_body_types?select=brand_name,body_type`, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          })
          const data = await response.json()

          // Convert to { brand: [bodyTypes] }
          const mapping = {}
          data.forEach(row => {
            if (!mapping[row.brand_name]) {
              mapping[row.brand_name] = []
            }
            mapping[row.brand_name].push(row.body_type)
          })
          setBrandBodyTypes(mapping)
        } catch (err) {
          console.warn('Could not fetch brand body types:', err)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // State for search
  const [searchText, setSearchText] = useState('')
  const [vehicleType, setVehicleType] = useState('avto')
  const [vehicleSubCategory, setVehicleSubCategory] = useState('')
  const [vehicleSubCategoryDetail, setVehicleSubCategoryDetail] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedModels, setSelectedModels] = useState({}) // { brand: [models] }
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [mileageTo, setMileageTo] = useState(isNewCarsFilter ? '30000' : '')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState(isNewCarsFilter ? '2024' : '')
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedFuel, setSelectedFuel] = useState([])
  const [selectedBodyTypes, setSelectedBodyTypes] = useState([])
  const [brandBodyTypes, setBrandBodyTypes] = useState({}) // { brand: [bodyTypes] }

  // Body types
  const bodyTypes = ['Traktor', 'Limuzina', 'Hatchback', 'Coupe', 'Kombi', 'Van', 'Pickup', 'Minivan', 'Kabriolet', 'Roadster', 'Targa', 'Fastback', 'Liftback', 'Sportni coupe', 'SUV']

  // Moto body types by subcategory
  const motoBodyTypesBySubcategory = {
    'Motorno kolo': ['Sport', 'Chopper', 'Tourer', 'Naked bike', 'Enduro', 'Supermoto', 'Trial', 'Cross'],
    'Skuter, Maxi-scooter, 3-4 kolesni scooter': ['Scooter', 'Maxi Scooter', '3-4 kolesni scooter'],
    'Moped, kolo z motorjem': ['Moped', 'Kolo z motorjem'],
    '4-kolesnik, ATV, UTV, 3-kolesnik': ['ATV', 'UTV', '3-kolesnik'],
  }

  // Get body types for selected brand
  const getBodyTypesForBrand = (brand) => {
    if (brandBodyTypes[brand]) {
      return brandBodyTypes[brand]
    }
    return bodyTypes // fallback to all body types
  }

  // Get all body types from all selected brands (or brands with selected models)
  const availableBodyTypes = useMemo(() => {
    // If vehicle type is motor and subcategory is selected, return body types for that subcategory
    if (vehicleType === 'moto' && vehicleSubCategory) {
      if (motoBodyTypesBySubcategory[vehicleSubCategory]) {
        return motoBodyTypesBySubcategory[vehicleSubCategory]
      }
      return [] // No body types for this subcategory
    }

    // If vehicle type is motor (no subcategory yet), return empty
    if (vehicleType === 'moto') {
      return []
    }

    // If models are selected for specific brands, use those brands
    // Otherwise use selectedBrands
    const brandsWithModels = Object.keys(selectedModels).filter(brand =>
      selectedModels[brand] && selectedModels[brand].length > 0
    )
    const brandsToUse = brandsWithModels.length > 0 ? brandsWithModels : selectedBrands

    if (brandsToUse.length === 0) return bodyTypes
    const types = new Set()
    brandsToUse.forEach(brand => {
      const brandTypes = getBodyTypesForBrand(brand)
      brandTypes.forEach(type => types.add(type))
    })
    return Array.from(types)
  }, [selectedBrands, selectedModels, brandBodyTypes, vehicleType, vehicleSubCategory])

  // Filter brands based on vehicle type
  const filteredBrands = useMemo(() => {
    // Brands and models by vehicle type
    const vehicleTypeBrands = {
      'avto': ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Porsche', 'Opel', 'Toyota', 'Honda', 'Mazda', 'Nissan', 'Lexus', 'Subaru', 'Mitsubishi', 'Suzuki', 'Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Tesla', 'Renault', 'Peugeot', 'Citroen', 'Fiat', 'Alfa Romeo', 'Hyundai', 'Kia', 'Genesis', 'Jaguar', 'Land Rover', 'Mini', 'Volvo', 'Skoda', 'Seat', 'Cupra', 'Dacia', 'Smart', 'Chrysler', 'Cadillac', 'Buick', 'GMC', 'Lincoln', 'Acura', 'Infiniti', 'Maserati', 'Bentley', 'Ferrari', 'Lamborghini', 'Aston Martin', 'Rolls-Royce', 'McLaren', 'Bugatti', 'Pagani', 'Polestar', 'Lucid', 'Rivian', 'DS'],
      'moto': ['Aprilia', 'BMW', 'Ducati', 'Harley-Davidson', 'Honda', 'Kawasaki', 'KTM', 'Suzuki', 'Triumph', 'Yamaha', 'Aeon', 'AJP', 'AJS', 'Apollo Motors', 'Asiawing', 'Barton', 'Bashan', 'Benda', 'Benelli', 'Beta', 'Bimota', 'Brixton', 'BRUT-X', 'Bucci Moto', 'Buell', 'Cagiva', 'Can-Am', 'CF Moto', 'CPI', 'Custom', 'ČZ', 'Daelim', 'Derbi', 'Dnepr', 'DKW', 'Dream Pitbikes', 'Ebroh', 'E Ride', 'EM', 'Energica', 'Enfield', 'Fantic', 'FB Mondial', 'FYM', 'Garelli', 'Generic', 'GasGas', 'Giantco', 'Gilera', 'GunShot', 'Hengjian', 'HM Moto', 'Horwin', 'Husaberg', 'Husqvarna', 'Hyosung', 'Indian', 'Italjet', 'Jawa', 'Jiajue', 'Jinlun', 'Junak', 'K-Sport', 'Kangchao', 'Kayo', 'KeeWay', 'Kinroad', 'KL Motors', 'Kove', 'Kreidler', 'KSR Moto', 'Kuberg', 'Kymco', 'Laverda', 'LEM', 'Leonart', 'Longjia', 'Mac Motorcycles', 'Macbor', 'Maico', 'Malaguti', 'Marshal', 'Mash', 'Mecatecno', 'Morbidelli', 'Motobi', 'Montesa', 'MotoGuzzi', 'Moto Morini', 'Motor Union', 'Motowell', 'Motron', 'MV Agusta', 'MZ', 'Norton', 'NSU', 'Ohvale', 'Oldtimer', 'Oset', 'Palmo', 'Peugeot', 'Phelon & Moore', 'Pioneer', 'Pitbikes', 'Pitsterpro', 'Polaris', 'Puch', 'Qingqi', 'QJMotor', 'Qulbix', 'Regal Raptor', 'Rieju', 'Romet', 'Royal Enfield', 'Sachs', 'Sarolea', 'SCZ', 'Sherco', 'Shineray', 'SiaMoto', 'Skygo', 'Skyteam', 'Stallions', 'Stark', 'Stomp', 'Super soco', 'Surron', 'SWM', 'Sym', 'Talaria', 'Thumpstar', 'Tinbot', 'TM Racing', 'TMS', 'Tomos', 'Torrot', 'Trike', 'Triton', 'Tromox', 'TRS', 'UM', 'Ural', 'Urbet', 'Velocifero', 'Vent', 'Victory', 'Vins', 'Voge', 'VOR', 'Wottan Motor', 'Xingyue', 'Xinling', 'Xmotos', 'YCF', 'Yiying', 'Zero', 'Zongshen', 'Zontes', 'Zhongyu', 'Ztech', 'Zundapp', 'MOTO'],
      'kamion': ['DAF', 'Scania', 'Volvo Trucks', 'MAN', 'Mercedes-Benz Trucks', 'Iveco', 'Renault Trucks', 'Foton', 'Isuzu', 'Kenworth', 'Peterbilt', 'Mack', 'International', 'Freightliner'],
      'kombi': ['Mercedes-Benz Sprinter', 'Ford Transit', 'Renault Master', 'Iveco Daily', 'Fiat Ducato', 'Peugeot Boxer', 'Citroen Jumper', 'Volkswagen Transporter', 'Opel Movano', 'Toyota Proace', 'Nissan NV'],
      'traktor': ['John Deere', 'Massey Ferguson', 'Case IH', 'New Holland', 'Fendt', 'Kubota', 'Claas', 'Deutz-Fahr', 'Valtra', 'Steyr', 'JCB', 'McCormick', 'Landini', 'Zetor', 'SAME', 'Belarus', 'MTZ', 'YTO', 'Dongfeng', 'Mahindra', 'TAFE', 'Eicher', 'Sonalika', 'Farmtrac', 'Agrale'],
      'avtodom': ['Adria', 'Benimar', 'CI International', 'Hymer', 'Pilote', 'Rimor', 'Roller Team', 'XGO', 'Across', 'Airstream', 'Alpha', 'Ahorn', 'Aquila', 'Arca', 'Arkdesign', 'Autostar', 'Auto-Sleepers', 'Basoglu', 'Bavaria', 'Bavaria-Camp', 'Bawemo', 'Bimobil', 'Blucamp', 'Bravia', 'Buerstner', 'Burow', 'Bustechnik', 'Camper-Berghem', 'Campereve', 'Camperliebe', 'Campestre', 'Capimobil', 'Carado', 'Caravelair', 'Carthago', 'Challenger', 'Chausson', 'Clever', 'Coachmen', 'Concorde', 'Cristall', 'CS Reisemobile', 'Dehler', 'Delta', 'Devon', 'Dipa', 'Dodge', 'Dopfer', 'Dethleffs', 'Due Erre', 'Eifelland', 'Elnagh', 'Esterel', 'Etrusco', 'Euramobil', 'EVM', 'Fendt', 'FFB', 'Fleetwood RV', 'Fischer', 'Fleurette', 'Forster', 'Frankia', 'FR-Mobil', 'Galaxy Camper', 'Globecar', 'GiottiLine', 'Hanroad', 'Hehn Mobil', 'Heku', 'Herman Mobil', 'Hobby', 'Holiday Rambler', 'HomeCar', 'HRZ', 'Ilusion', 'Inspire', 'Itineo', 'Joa CAMP', 'Joint', 'Kabe', 'Karmann', 'Kelgin', 'Kentucky Camp', 'KIP', 'Knaus', 'La Marca', 'La Strada', 'Le Voyageur', 'Laika', 'Leisure', 'LMC', 'Malibu', 'Marchi', 'Maxus', 'McLouis', 'Megamobil', 'Mercedes-Benz', 'Miller', 'Mirage', 'Mobilvetta', 'Monaco', 'Moncayo', 'Mooveo', 'Morelo', 'Niesmann Bischoff', 'Niewiadow', 'nobelART', 'Nordstar', 'Notin', 'OrangeCamp', 'Ormocar', 'Panama', 'Paul & Paula', 'Phantom Adventure', 'Phoenix', 'PLA', 'Poessl', 'Polar', 'Primus', 'Proteus Mobil', 'Rapido', 'Reimo', 'Renault', 'Riva', 'RMB', 'Roadtrek', 'Robel-Mobil', 'Robeta Mobil', 'Rockwood', 'Sea', 'Sharky', 'Sipras', 'Sportsvan', 'Sterckeman', 'Sun Living', 'Sunlight', 'Swift', 'TEC', 'Tischer', 'Tourne', 'Vanexxt', 'Vario mobil', 'Volksmobil', 'VW', 'Weinsberg', 'Weippert', 'Westfalia', 'Wingamm', 'Winnebago', 'Woelcke', 'YesCamper']
    }

    return vehicleTypeBrands[vehicleType] || vehicleTypeBrands['avto']
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
  const yearOptions = Array.from({ length: 37 }, (_, i) => 1990 + i)

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
    if (priceFrom) params.set('priceFrom', priceFrom)
    if (priceTo) params.set('priceTo', priceTo)
    if (mileageTo) params.set('mileageTo', mileageTo)
    if (yearFrom) params.set('yearFrom', yearFrom)
    if (yearTo) params.set('yearTo', yearTo)
    if (selectedCities.length) params.set('cities', selectedCities.join(','))
    if (selectedFuel.length) params.set('fuel', selectedFuel.join(','))
    if (vehicleType) params.set('type', vehicleType)
    if (vehicleSubCategory) params.set('subcategory', vehicleSubCategory)
    if (vehicleSubCategoryDetail) params.set('subcategoryDetail', vehicleSubCategoryDetail)

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

  // Toggle body type selection
  const toggleBodyType = (type) => {
    setSelectedBodyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
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

    // Filter by body type
    if (selectedBodyTypes.length > 0) {
      result = result.filter(car =>
        selectedBodyTypes.includes(car.bodyType)
      )
    }

    // Filter by price (od - do)
    if (priceFrom || priceTo) {
      result = result.filter(car => {
        const carPrice = parseInt(car.price)
        if (priceFrom && priceTo) {
          return carPrice >= parseInt(priceFrom) && carPrice <= parseInt(priceTo)
        } else if (priceFrom) {
          return carPrice >= parseInt(priceFrom)
        } else if (priceTo) {
          return carPrice <= parseInt(priceTo)
        }
        return true
      })
    }

    // Filter by mileage
    if (mileageTo) {
      result = result.filter(car =>
        car.mileage && parseInt(car.mileage) <= parseInt(mileageTo)
      )
    }

    // Filter by year (od - do) - for new cars filter: year >= 2026, otherwise year range
    if (isNewCarsFilter) {
      // New cars: year >= 2026
      result = result.filter(car =>
        car.year && car.year >= 2026
      )
    } else if (yearFrom || yearTo) {
      result = result.filter(car => {
        const carYear = parseInt(car.year)
        if (yearFrom && yearTo) {
          return carYear >= parseInt(yearFrom) && carYear <= parseInt(yearTo)
        } else if (yearFrom) {
          return carYear >= parseInt(yearFrom)
        } else if (yearTo) {
          return carYear <= parseInt(yearTo)
        }
        return true
      })
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
              {(selectedBrands.length > 0 || selectedModels || selectedFuel.length > 0 || selectedCities.length > 0 || selectedBodyTypes.length > 0 || priceFrom || priceTo || mileageTo || yearFrom || yearTo) && (
                <button
                  onClick={() => {
                    setSearchText('')
                    setSelectedBrands([])
                    setSelectedModels({})
                    setPriceFrom('')
                    setPriceTo('')
                    setMileageTo('')
                    setYearFrom('')
                    setYearTo('')
                    setSelectedCities([])
                    setSelectedFuel([])
                    setSelectedBodyTypes([])
                  }}
                  className="bg-gray-200 border-none text-gray-700 px-6 py-[15px] rounded-[14px] font-semibold cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  {language === 'sl' ? 'Razveljavi' : 'Reset'}
                </button>
              )}
            </div>

            {/* Matching Cars Count - only show when filters are selected */}
            {(selectedBrands.length > 0 || Object.keys(selectedModels).length > 0 || selectedFuel.length > 0 || selectedCities.length > 0 || selectedBodyTypes.length > 0 || priceFrom || priceTo || mileageTo || yearFrom || yearTo || searchText) && matchingCount > 0 && (
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

              {/* Body Type - Shows when brand is selected OR when vehicle type is motor */}
              {((selectedBrands.length > 0 && vehicleType !== 'moto') || (vehicleType === 'moto' && vehicleSubCategory && motoBodyTypesBySubcategory[vehicleSubCategory])) && (
                <div className="relative">
                  <select
                    className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                    onChange={(e) => {
                      if (e.target.value) toggleBodyType(e.target.value)
                    }}
                  >
                    <option value="">{language === 'sl' ? 'Karoserijska oblika' : 'Body Type'} ({selectedBodyTypes.length})</option>
                    {availableBodyTypes.map(type => (
                      <option key={type} value={type}>{selectedBodyTypes.includes(type) ? '✓ ' : ''}{type}</option>
                    ))}
                  </select>
                  {selectedBodyTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedBodyTypes.map(type => (
                        <span key={type} className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                          {type}
                          <button onClick={() => toggleBodyType(type)} className="ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cena (Price) - "od - do" DROPDOWN */}
              <div className="flex gap-1 items-center">
                <select
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="w-1/2 px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                >
                  <option value="">{language === 'sl' ? 'Cena od' : 'Price from'}</option>
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
                <span className="text-gray-400">-</span>
                <select
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="w-1/2 px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                >
                  <option value="">{language === 'sl' ? 'Cena do' : 'Price to'}</option>
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

              {/* Kilometri (Mileage) - Only "do" DROPDOWN */}
              <select
                value={mileageTo}
                onChange={(e) => setMileageTo(e.target.value)}
                className="w-full px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
              >
                <option value="9999999">{language === 'sl' ? 'Prevoženih km do' : 'Mileage up to'}</option>
                <option value="5000">do 5.000 km</option>
                <option value="10000">do 10.000 km</option>
                <option value="20000">do 20.000 km</option>
                <option value="25000">do 25.000 km</option>
                <option value="50000">do 50.000 km</option>
                <option value="75000">do 75.000 km</option>
                <option value="100000">do 100.000 km</option>
                <option value="125000">do 125.000 km</option>
                <option value="150000">do 150.000 km</option>
                <option value="200000">do 200.000 km</option>
                <option value="250000">do 250.000 km</option>
              </select>

              {/* Letnik (Year) - "od - do" DROPDOWN */}
              <div className="flex gap-1 items-center">
                <select
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-1/2 px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                >
                  <option value="">{language === 'sl' ? 'Letnik od' : 'Year from'}</option>
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
                <span className="text-gray-400">-</span>
                <select
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="w-1/2 px-3 py-3 rounded-[14px] border border-gray-300 bg-white text-gray-700 cursor-pointer appearance-none"
                >
                  <option value="">{language === 'sl' ? 'Letnik do' : 'Year to'}</option>
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
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <button
                onClick={() => { setVehicleType('avto'); setVehicleSubCategory('') }}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-[10px] cursor-pointer transition-colors ${vehicleType === 'avto' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚗 {language === 'sl' ? 'Avto' : 'Car'}
              </button>
              <button
                onClick={() => { setVehicleType('moto'); setVehicleSubCategory('') }}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-[10px] cursor-pointer transition-colors ${vehicleType === 'moto' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🏍 {language === 'sl' ? 'Motor' : 'Moto'}
              </button>
              <button
                onClick={() => { setVehicleType('kamion'); setVehicleSubCategory('') }}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-[10px] cursor-pointer transition-colors ${vehicleType === 'kamion' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚚 {language === 'sl' ? 'Kamion' : 'Truck'}
              </button>
              <button
                onClick={() => { setVehicleType('kombi'); setVehicleSubCategory('') }}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-[10px] cursor-pointer transition-colors ${vehicleType === 'kombi' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚐 {language === 'sl' ? 'Kombi' : 'Van'}
              </button>
              <button
                onClick={() => { setVehicleType('traktor'); setVehicleSubCategory('') }}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-[10px] cursor-pointer transition-colors ${vehicleType === 'traktor' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚜 {language === 'sl' ? 'Traktor' : 'Tractor'}
              </button>
              <button
                onClick={() => { setVehicleType('avtodom'); setVehicleSubCategory('') }}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-[10px] cursor-pointer transition-colors ${vehicleType === 'avtodom' ? 'bg-[#ff6a00] text-white' : 'bg-[#f3f4f6] text-gray-700'}`}
              >
                🚐 AvtoDom
              </button>
            </div>

            {/* Subcategory - shows when vehicle type has subcategories */}
            {vehicleType && vehicleSubCategories[vehicleType]?.options?.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-gray-600">Podkategorija:</span>
                <select
                  className="px-3 py-2 rounded-[10px] border border-gray-300 bg-white text-gray-700 cursor-pointer text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center] pr-8"
                  value={vehicleSubCategory || ''}
                  onChange={(e) => { setVehicleSubCategory(e.target.value); setVehicleSubCategoryDetail('') }}
                >
                  <option value="">- Izberi -</option>
                  {vehicleSubCategories[vehicleType].options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                
                {/* Subcategory Detail - 3rd level dropdown */}
                {vehicleSubCategory && subCategoryDetails[vehicleSubCategory]?.options?.length > 0 && (
                  <>
                    <span className="text-sm text-gray-600">Vrsta:</span>
                    <select
                      className="px-3 py-2 rounded-[10px] border border-gray-300 bg-white text-gray-700 cursor-pointer text-sm appearance-none bg-no-repeat bg-[right_0.5rem_center] pr-8"
                      value={vehicleSubCategoryDetail || ''}
                      onChange={(e) => setVehicleSubCategoryDetail(e.target.value)}
                    >
                      <option value="">- {subCategoryDetails[vehicleSubCategory].label} -</option>
                      {subCategoryDetails[vehicleSubCategory].options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}
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




