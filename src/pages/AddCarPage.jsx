import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, X, Check, CreditCard, ChevronDown, Shield, Settings, Wifi, Car, Fuel, Star, ChevronUp, Sun, Award, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { useCars } from '@/lib/CarContext'
import { packageDB, carDB } from '@/lib/database'
import { getAllBrands, getModelsForBrand, getAllCities, fuelTypes, transmissions, bodyTypes, colors, vehicleConditionOptions, vehicleConditionSubOptions, carEquipmentCategories, emissionClasses, vehicleAgeOptions, ownerCountOptions, months, getYears, LUXURY_CAR_THRESHOLD, FALLBACK_BRANDS, FALLBACK_MODELS } from '@/lib/data'

export function AddCarPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { addCar, updateCar, getCarById } = useCars()
  const { t, language } = useLanguage()
  const isSl = language === 'sl'

  const [allBrands, setAllBrands] = useState(FALLBACK_BRANDS || [])
  const [allCities, setAllCities] = useState([])
  const [brandModels, setBrandModels] = useState(FALLBACK_MODELS || {})
  const [boostPackages, setBoostPackages] = useState({ private: [], business: [] })
  const [publishingPackages, setPublishingPackages] = useState([])
  
  const [formData, setFormData] = useState({
    brand: '', model: '', year: new Date().getFullYear(),
    price: '', mileage: '', fuelType: '', transmission: '', bodyType: '',
    engine: '', horsepower: '', color: '', city: '', description: '',
    vehicleCondition: '', vehicleConditionSub: [], featureIds: [],
    // Fuel consumption
    fuelConsumption: '', emissionClass: '', co2Emissions: '', autoPublishFuelData: false,
    // Vehicle age & ownership
    vehicleAge: '', hasWarranty: false, hasGuarantee: false, hasOldtimerCert: false,
    // Registration details
    firstRegMonth: '', firstRegYear: '', technicalValidUntil: '', ownerCount: '',
  })

  const [openFeaturesCategory, setOpenFeaturesCategory] = useState('safety')

  const [hasFinancing, setHasFinancing] = useState(false)
  const [showFinancingModal, setShowFinancingModal] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [downPaymentType, setDownPaymentType] = useState('amount')
  const [downPaymentValue, setDownPaymentValue] = useState('')
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const [selectedBoost, setSelectedBoost] = useState(null)
  const [boostDays, setBoostDays] = useState(30)
  const [monthlyCarCount, setMonthlyCarCount] = useState(0)
  const [currentUserCarCount, setCurrentUserCarCount] = useState(0)

  

  const userId = user?.id

  // Package check - use state to avoid hydration mismatch
  const [userPackage, setUserPackage] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const isBusiness = user?.userType === 'business'

  useEffect(() => {
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

  // Load package and car count data from localStorage (avoid hydration mismatch)
  useEffect(() => {
    const pkg = packageDB.getCurrentPackage()
    setUserPackage(pkg)
    setIsPremium(packageDB.isPremium())
    
    // Load monthly car count
    if (userId) {
      const myCars = JSON.parse(localStorage.getItem('myListings') || '[]')
      const now = new Date()
      const count = myCars.filter(car => {
        const carDate = new Date(car.createdAt || Date.now())
        return car.seller?.id === userId && carDate.getMonth() === now.getMonth() && carDate.getFullYear() === now.getFullYear()
      }).length
      setMonthlyCarCount(count)
      setCurrentUserCarCount(carDB.getMyCarCount())
    }
  }, [userId])

  useEffect(() => {
    if (formData.brand && !brandModels[formData.brand]) {
      getModelsForBrand(formData.brand).then(models => {
        setBrandModels(prev => ({ ...prev, [formData.brand]: models }))
      })
    }
  }, [formData.brand])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const isEditMode = searchParams.get('edit')
  const editCarId = isEditMode ? parseInt(isEditMode) : null
  const editCar = editCarId ? getCarById(editCarId) : null

  // Use boost packages from API (loaded in useEffect)
  const getBoostPkgs = () => {
    if (isBusiness) return boostPackages.business
    return boostPackages.private
  }

  const [openDropdown, setOpenDropdown] = useState(null)
  const [brandSuggestions, setBrandSuggestions] = useState([])
  const [citySuggestions, setCitySuggestions] = useState([])
  const [modelSuggestions, setModelSuggestions] = useState([])

  const getCustomModels = () => { try { return JSON.parse(localStorage.getItem('customCarModels') || '{}') } catch { return {} } }

  const saveCustomModel = (brand, model) => {
    const customModels = getCustomModels()
    if (!customModels[brand]) customModels[brand] = []
    if (!customModels[brand].includes(model)) {
      customModels[brand].push(model)
      localStorage.setItem('customCarModels', JSON.stringify(customModels))
    }
  }

  const getAllModelsForBrand = (brand) => {
    const customModels = getCustomModels()
    const apiModels = brandModels[brand] || []
    const custom = customModels[brand] || []
    return [...new Set([...apiModels, ...custom])]
  }

  // Feature selection helpers (using string feature names)
  const isFeatureSelected = (featureName) => formData.featureIds.includes(featureName)
  
  const toggleFeature = (featureName) => {
    setFormData(prev => ({
      ...prev,
      featureIds: prev.featureIds.includes(featureName)
        ? prev.featureIds.filter(name => name !== featureName)
        : [...prev.featureIds, featureName]
    }))
  }

  const selectAllInCategory = (categoryKey) => {
    const categoryData = carEquipmentCategories[categoryKey]
    if (!categoryData) return
    
    const allFeatureNames = []
    Object.values(categoryData.subcategories || {}).forEach(sub => {
      if (sub.features) {
        allFeatureNames.push(...sub.features)
      }
    })
    
    const allSelected = allFeatureNames.every(name => formData.featureIds.includes(name))
    setFormData(prev => ({
      ...prev,
      featureIds: allSelected
        ? prev.featureIds.filter(name => !allFeatureNames.includes(name))
        : [...new Set([...prev.featureIds, ...allFeatureNames])]
    }))
  }

  const getSelectedCount = () => formData.featureIds.length
  
  const getSelectedInCategory = (categoryKey) => {
    const categoryData = carEquipmentCategories[categoryKey]
    if (!categoryData) return 0
    
    const allFeatureNames = []
    Object.values(categoryData.subcategories || {}).forEach(sub => {
      if (sub.features) {
        allFeatureNames.push(...sub.features)
      }
    })
    
    return allFeatureNames.filter(name => formData.featureIds.includes(name)).length
  }

  useEffect(() => {
    if (editCar) {
      setFormData({
        brand: editCar.brand || '', model: editCar.model || '',
        year: editCar.year || new Date().getFullYear(), price: editCar.price || '',
        mileage: editCar.mileage || '', fuelType: editCar.fuelType || editCar.fuel_type || '', 
        transmission: editCar.transmission || '', bodyType: editCar.bodyType || editCar.body_type || '', 
        engine: editCar.engine || '', horsepower: editCar.horsepower || '',
        color: editCar.color || '', city: editCar.city || '', description: editCar.description || '',
        vehicleCondition: editCar.vehicleCondition || editCar.vehicle_condition || '',
        vehicleConditionSub: editCar.vehicleConditionSub || [],
        featureIds: editCar.featureIds || [],
        // Fuel
        fuelConsumption: editCar.fuelConsumption || '', emissionClass: editCar.emissionClass || '', co2Emissions: editCar.co2Emissions || '', autoPublishFuelData: editCar.autoPublishFuelData || false,
        // Age & ownership
        vehicleAge: editCar.vehicleAge || '', hasWarranty: editCar.hasWarranty || false, hasGuarantee: editCar.hasGuarantee || false, hasOldtimerCert: editCar.hasOldtimerCert || false,
        // Registration
        firstRegMonth: editCar.firstRegMonth || '', firstRegYear: editCar.firstRegYear || '', technicalValidUntil: editCar.technicalValidUntil || '', ownerCount: editCar.ownerCount || '',
      })
      setImages(editCar.images || [])
      if (editCar.hasFinancing) {
        setHasFinancing(true)
        setMonthlyBudget(editCar.monthlyBudget || '')
        setDownPaymentType(editCar.downPaymentType || 'amount')
        setDownPaymentValue(editCar.downPaymentValue || '')
      }
    }
  }, [editCar])

  // Fetch packages from API - re-fetch when page becomes visible
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost/api'}/packages.php?_=${Date.now()}`, {
          headers: { 'X-Pinggy-No-Screen': 'true' }
        })
        const data = await res.json()
        console.log('Packages fetched:', JSON.stringify(data).substring(0, 200))
        if (data.success && data.packages) {
          const pubPkgs = data.packages.filter(p => p.type === 'publishing')
          console.log('Publishing packages count:', pubPkgs.length, pubPkgs)
          if (pubPkgs.length === 0) alert('No publishing packages! Check API response')
          // Set publishing packages with discount info
          setPublishingPackages(pubPkgs.map(p => ({
            id: p.id,
            name: p.name,
            name_sl: p.name_sl || p.name,
            price: parseFloat(p.price),
            discount_percent: parseInt(p.discount_percent) || 0,
            discount_active: p.discount_active == 1,
            min_days: p.min_days || 30
          })))
          
          setBoostPackages({
            private: data.packages.filter(p => p.type === 'boost_private').map(p => ({
              id: p.id,
              name: p.name,
              name_sl: p.name_sl || p.name,
              price: parseFloat(p.price),
              min_days: p.min_days || 1
            })),
            business: data.packages.filter(p => p.type === 'boost_business').map(p => ({
              id: p.id,
              name: p.name,
              name_sl: p.name_sl || p.name,
              price: parseFloat(p.price),
              min_days: p.min_days || 1
            }))
          })
        }
      } catch (e) {
        console.error('Error fetching packages:', e)
      }
    }
    fetchPackages()
    
    // Re-fetch when page becomes visible again (e.g., after admin changes)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchPackages()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'brand' && value.length > 0) {
      const matches = allBrands.filter(b => b.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
      setBrandSuggestions(matches)
    } else { setBrandSuggestions([]) }
    if (field === 'city' && value.length > 0) {
      const matches = allCities.filter(c => c.toLowerCase().includes(value.toLowerCase())).slice(0, 5)
      setCitySuggestions(matches)
    } else { setCitySuggestions([]) }
    if (field === 'model' && formData.brand && value.length > 0) {
      const allModels = getAllModelsForBrand(formData.brand)
      const matches = allModels.filter(m => m.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
      setModelSuggestions(matches)
    } else { setModelSuggestions([]) }
    if (errors[field]) { setErrors(prev => ({ ...prev, [field]: null })) }
  }

  const selectBrand = (brand) => { setFormData(prev => ({ ...prev, brand, model: '' })); setBrandSuggestions([]); setModelSuggestions([]) }
  const selectModel = (model) => { setFormData(prev => ({ ...prev, model })); setModelSuggestions([]) }
  const selectCity = (city) => { setFormData(prev => ({ ...prev, city })); setCitySuggestions([]) }
  const toggleDropdown = (name) => { setOpenDropdown(openDropdown === name ? null : name) }
  const selectOption = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); setOpenDropdown(null) }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => { setImages(prev => [...prev, e.target.result]) }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => { setImages(prev => prev.filter((_, i) => i !== index)) }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.brand) newErrors.brand = 'Znamka je obvezna'
    if (!formData.year) newErrors.year = 'Leto je obvezno'
    if (!formData.price) newErrors.price = 'Cena je obvezna'
    if (!formData.fuelType) newErrors.fuelType = 'Gorivo je obvezno'
    if (!formData.transmission) newErrors.transmission = 'Menjalnik je obvezen'
    if (!formData.bodyType) newErrors.bodyType = 'Tip vozila je obvezen'
    if (!formData.vehicleCondition) newErrors.vehicleCondition = 'Stanje vozila je obvezno'
    if (!formData.city) newErrors.city = 'Kraj je obvezen'
    if (!formData.description) newErrors.description = 'Opis je obvezen'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Note: userPackage, isPremium, isBusiness, currentUserCarCount are declared as state
  
  // FREE_CAR_LIMIT = 2 cars without package, after that need to buy a package
  const FREE_CAR_LIMIT = 2
  
  // Logic: Premium always can post. No package = max 2 free cars. Basic/other package = unlimited.
  const canPost = () => {
    // Premium users can always post
    if (isPremium) return { allowed: true, reason: null }
    
    // If user has a valid package (not expired), they can post
    if (userPackage && userPackage.expiresAt) {
      const expiresAt = new Date(userPackage.expiresAt)
      if (expiresAt > new Date()) {
        return { allowed: true, reason: null }
      }
    }
    
    // No valid package - check if under free limit
    if (currentUserCarCount < FREE_CAR_LIMIT) {
      return { allowed: true, reason: null }
    }
    
    // Over free limit, needs package
    return { 
      allowed: false, 
      reason: isSl 
        ? `Brez paketa lahko objavite največ ${FREE_CAR_LIMIT} vozila. Za več kupite paket.`
        : `Without a package you can only list ${FREE_CAR_LIMIT} cars. Buy a package to list more.`
    }
  }
  
  const canPostCar = canPost()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    if (formData.brand && formData.model) { saveCustomModel(formData.brand, formData.model) }

    const defaultImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800']

    if (isEditMode) {
      const carData = {
        ...formData,
        images: defaultImages,
        fuel_type: formData.fuelType,
        body_type: formData.bodyType,
        hasFinancing: hasFinancing,
        monthlyBudget: hasFinancing ? monthlyBudget : null,
        downPaymentType: hasFinancing && downPaymentValue ? downPaymentType : null,
        downPaymentValue: hasFinancing && downPaymentValue ? downPaymentValue : null,
      }
      updateCar(editCarId, carData)
      alert('Car updated successfully!')
      navigate('/dashboard')
      return
    }

    if (canPostCar.allowed) {
      const carPrice = parseFloat(formData.price) || 0
      const isLuxuryCar = !isBusiness && carPrice > LUXURY_CAR_THRESHOLD
      const carData = {
        ...formData,
        images: defaultImages,
        fuel_type: formData.fuelType,
        body_type: formData.bodyType,
        featured: isPremium || isBusiness,
        promoted: selectedBoost ? true : false,
        hasBoost: !!selectedBoost,
        boostPackage: selectedBoost,
        boostSpent: selectedBoost ? getBoostPkgs().find(b => b.id === selectedBoost)?.price * boostDays : 0,
        isLuxuryCar: isLuxuryCar,
        hasFinancing: hasFinancing,
        monthlyBudget: hasFinancing ? monthlyBudget : null,
        downPaymentType: hasFinancing && downPaymentValue ? downPaymentType : null,
        downPaymentValue: hasFinancing && downPaymentValue ? downPaymentValue : null,
        seller: {
          name: user?.name || 'Anonymous', rating: 5.0, reviews: 0,
          phone: user?.phone || '+386 00 000 000', verified: true,
          userType: isBusiness ? 'business' : 'private', id: user?.id, photo: user?.photo || null,
        },
        views: 0, createdAt: new Date().toISOString().split('T')[0], status: 'active',
      }
      addCar(carData)
      alert('Vozilo objavljeno brezplacno!')
      navigate('/dashboard')
      return
    }

    const carDataForPayment = {
      ...formData,
      images: defaultImages,
      fuel_type: formData.fuelType,
      body_type: formData.bodyType,
      hasFinancing: hasFinancing,
      monthlyBudget: hasFinancing ? monthlyBudget : null,
      downPaymentType: hasFinancing && downPaymentValue ? downPaymentType : null,
      downPaymentValue: hasFinancing && downPaymentValue ? downPaymentValue : null,
      featureIds: formData.featureIds,
    }
    navigate('/payment', { state: { carData: carDataForPayment } })
  }

  const Dropdown = ({ label, name, value, options, color = false }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
      <button type="button" onClick={() => toggleDropdown(name)} className={"w-full px-4 py-3 bg-gray-50 border rounded-xl text-left flex items-center justify-between hover:bg-gray-100 transition-colors " + (!value ? 'text-gray-400' : '')} >
        <span>{value || "Izberi " + label}</span>
        <ChevronDown className={"w-4 h-4 transition-transform " + (openDropdown === name ? 'rotate-180' : '')} />
      </button>
      <AnimatePresence>
        {openDropdown === name && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto" >
            {value && (
              <button key="deselect" type="button" onClick={() => { selectOption(name, ''); setOpenDropdown(null) }} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-500 border-b border-gray-100 bg-gray-50" >
                <X className="w-4 h-4" /> Ponastavi
              </button>
            )}
            {options.map((opt) => (
              <button key={opt} type="button" onClick={() => selectOption(name, opt)} className={"w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 " + (value === opt ? 'bg-orange-50 text-orange-700' : '')} >
                {color && <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: opt.toLowerCase() }}></span>}
                {opt}
                {value === opt && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-700" >
              <ArrowLeft className="w-4 h-4 mr-2" /> {isEditMode ? t('editCarTitle') : t('addCarTitle')}
            </button>
            <h1 className="text-xl font-bold text-gray-900">{isEditMode ? t('editCarTitle') : t('addCarTitle')}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Financing Package Modal */}
        <AnimatePresence>
          {showFinancingModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
              >
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Financiranje - Paket vseh cen</h3>
                    <button 
                      onClick={() => setShowFinancingModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Za dostop do financiranja potrebujete paket "Paket vseh cen".
                  </p>
                  
                  {/* Package Details */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-orange-500" />
                      <h4 className="font-bold text-gray-900">Paket vseh cen</h4>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>akcijska cena</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>cena s financiranjem</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>znizana cena</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>ugodna cena</span>
                      </li>
                    </ul>
                    
                    {/* Price based on user type */}
                    <div className="border-t border-orange-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cena:</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-orange-600">
                            €{isBusiness ? '0.75' : '1.50'}
                          </span>
                          <span className="text-gray-500 ml-1">/dan</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 text-sm">Minimalno naročilo:</span>
                        <span className="text-gray-700 font-medium">{isBusiness ? '30' : '15'} dni</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 text-sm">Skupaj:</span>
                        <span className="text-gray-700 font-bold">
                          €{((isBusiness ? 0.75 : 1.50) * (isBusiness ? 30 : 15)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowFinancingModal(false)}
                      className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Preklici
                    </button>
                    <button
                      onClick={() => {
                        setHasFinancing(true)
                        setShowFinancingModal(false)
                      }}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                    >
                      Kupim paket
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Input label={t('brand') + ' *'} placeholder={isSl ? 'Vnesi znamko...' : 'Type brand name...'} value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)} error={errors.brand} />
              <AnimatePresence>
                {brandSuggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto" >
                    {brandSuggestions.map((brand) => (
                      <button key={brand} type="button" onClick={() => selectBrand(brand)} className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between" >
                        <span>{brand}</span>
                        {formData.brand === brand && <Check className="w-4 h-4 text-primary-600" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <Input label={t('model')} placeholder={formData.brand ? (isSl ? 'npr. X5' : 'e.g. X5') : (isSl ? 'Najprej izberite znamko' : 'Select brand first')} value={formData.model} onChange={(e) => handleChange('model', e.target.value)} disabled={!formData.brand} />
              <AnimatePresence>
                {modelSuggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto" >
                    {modelSuggestions.map((model) => (
                      <button key={model} type="button" onClick={() => selectModel(model)} className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between" >
                        <span>{model}</span>
                        {formData.model === model && <Check className="w-4 h-4 text-primary-600" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Input label={t('yearOfProduction') + ' *'} type="number" placeholder="2024" value={formData.year} onChange={(e) => handleChange('year', parseInt(e.target.value))} error={errors.year} />
            <div className="relative">
              <Input label={t('price_label').replace('(€)', '') + ' *'} type="number" placeholder="50000" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} error={errors.price} />
              <span className="absolute right-4 top-9 text-gray-500 font-medium">€</span>
            </div>

            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Financiranje</span>
                      <p className="text-sm text-gray-500">Moznost obrocnega placevanja za to vozilo</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => {
                    if (!hasFinancing) {
                      // Check if user is business or private, show modal accordingly
                      if (isBusiness) {
                        // Business users can use financing directly
                        setHasFinancing(true)
                      } else {
                        // Private users need to see the package
                        setShowFinancingModal(true)
                      }
                    } else {
                      setHasFinancing(false)
                    }
                  }} className={"relative inline-flex h-7 w-12 items-center rounded-full transition-colors " + (hasFinancing ? 'bg-green-500' : 'bg-gray-300')} >
                    <span className={"inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform " + (hasFinancing ? 'translate-x-6' : 'translate-x-1')} />
                  </button>
                </div>
                {hasFinancing && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-green-200" >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mesecni proracun (EUR)</label>
                        <input type="number" placeholder="npr. 350" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Predplacilo (opcijsko)</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input type="number" placeholder={downPaymentType === 'percentage' ? 'npr. 20' : 'npr. 5000'} value={downPaymentValue} onChange={(e) => setDownPaymentValue(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                          <button type="button" onClick={() => { const newType = downPaymentType === 'amount' ? 'percentage' : 'amount'; setDownPaymentType(newType); setDownPaymentValue('') }} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap" >
                            {downPaymentType === 'amount' ? '%' : 'EUR'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <Input label={t('mileage_label')} type="number" placeholder="50000" value={formData.mileage} onChange={(e) => handleChange('mileage', parseInt(e.target.value))} />
            <Dropdown label={t('fuelType_label') + ' *'} name="fuelType" value={formData.fuelType} options={fuelTypes} />
            <Dropdown label={t('transmission_label') + ' *'} name="transmission" value={formData.transmission} options={transmissions} />
            <Dropdown label={t('bodyType_label') + ' *'} name="bodyType" value={formData.bodyType} options={bodyTypes} />
            
            {/* Stanje vozila - Radio buttons */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">Stanje vozila *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {vehicleConditionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.vehicleCondition === option.value
                        ? 'border-[#ff6a00] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicleCondition"
                      value={option.value}
                      checked={formData.vehicleCondition === option.value}
                      onChange={(e) => {
                        handleChange('vehicleCondition', e.target.value)
                        setFormData(prev => ({ ...prev, vehicleConditionSub: [] }))
                      }}
                      className="w-4 h-4 text-[#ff6a00] focus:ring-[#ff6a00]"
                    />
                    <div className="ml-3">
                      <span className="block font-medium text-gray-900">{option.label}</span>
                      <span className="block text-xs text-gray-500">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Sub-options checkboxes */}
              {formData.vehicleCondition && vehicleConditionSubOptions[formData.vehicleCondition] && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-gray-50 rounded-xl">
                  {vehicleConditionSubOptions[formData.vehicleCondition].map((subOpt) => (
                    <label key={subOpt.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.vehicleConditionSub.includes(subOpt.id)}
                        onChange={(e) => {
                          const newSubs = e.target.checked
                            ? [...formData.vehicleConditionSub, subOpt.id]
                            : formData.vehicleConditionSub.filter(id => id !== subOpt.id)
                          setFormData(prev => ({ ...prev, vehicleConditionSub: newSubs }))
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                      />
                      <span className="text-sm text-gray-700">{subOpt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <Dropdown label={t('color') + ' *'} name="color" value={formData.color} options={colors} color={true} />
            <Input label={t('engine')} placeholder={isSl ? 'npr. 2.0 TDI' : 'e.g. 2.0L TFSI'} value={formData.engine} onChange={(e) => handleChange('engine', e.target.value)} />
            <Input label={t('power') + ' (HP)'} type="number" placeholder="200" value={formData.horsepower} onChange={(e) => handleChange('horsepower', parseInt(e.target.value))} />
          </div>
        </div>

        {/* Poraba goriva in emisije */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Poraba goriva in emisije (NEDC)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kombinirana poraba (l/100km)</label>
              <input
                type="number"
                step="0.01"
                placeholder="npr. 5.5"
                value={formData.fuelConsumption}
                onChange={(e) => handleChange('fuelConsumption', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Emisijski razred</label>
              <select
                value={formData.emissionClass}
                onChange={(e) => handleChange('emissionClass', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Izberi...</option>
                {emissionClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CO2 emisija (g/km)</label>
              <input
                type="number"
                placeholder="npr. 120"
                value={formData.co2Emissions}
                onChange={(e) => handleChange('co2Emissions', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoPublishFuelData}
                onChange={(e) => handleChange('autoPublishFuelData', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Podatke o porabi želim avtomatično objaviti ob oglasu</span>
            </label>
          </div>
        </div>

        {/* Starost in lastništvo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Starost in lastništvo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Starost vozila</label>
              <select
                value={formData.vehicleAge}
                onChange={(e) => handleChange('vehicleAge', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Izberi...</option>
                {vehicleAgeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Število lastnikov</label>
              <select
                value={formData.ownerCount}
                onChange={(e) => handleChange('ownerCount', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Izberi...</option>
                {ownerCountOptions.map(count => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Garancija checkboxes */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.hasWarranty}
                onChange={(e) => handleChange('hasWarranty', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Vozilo ima garancijo</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.hasGuarantee}
                onChange={(e) => handleChange('hasGuarantee', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Vozilo ima jamstvo</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.hasOldtimerCert}
                onChange={(e) => handleChange('hasOldtimerCert', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Vozilo ima oldtimer certifikat</span>
            </label>
          </div>
        </div>

        {/* Registracija */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Podatki o registraciji</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prva registracija - mesec</label>
              <select
                value={formData.firstRegMonth}
                onChange={(e) => handleChange('firstRegMonth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Mesec...</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prva registracija - leto</label>
              <select
                value={formData.firstRegYear}
                onChange={(e) => handleChange('firstRegYear', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Leto...</option>
                {getYears().map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tehnični pregled velja do</label>
              <input
                type="date"
                value={formData.technicalValidUntil}
                onChange={(e) => handleChange('technicalValidUntil', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Nova Oprema vozila - Checkboxes by Categories */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Oprema vozila</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {getSelectedCount()} izbrano
            </span>
          </div>
          
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(carEquipmentCategories).map(([key, category]) => {
              const selectedInCategory = getSelectedInCategory(key)
              const isActive = openFeaturesCategory === key
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOpenFeaturesCategory(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {key === 'notranjost' && <Car className="w-4 h-4" />}
                  {key === 'info_multimedia' && <Wifi className="w-4 h-4" />}
                  {key === 'uporabnost' && <Settings className="w-4 h-4" />}
                  {key === 'sedeži_in_vrata' && <Star className="w-4 h-4" />}
                  {key === 'podvozje' && <Settings className="w-4 h-4" />}
                  {key === 'varnost' && <Shield className="w-4 h-4" />}
                  {key === 'zunanjost' && <Sun className="w-4 h-4" />}
                  {key === 'garancija_stanje' && <Award className="w-4 h-4" />}
                  {category.name}
                  {selectedInCategory > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {selectedInCategory}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Features for selected category */}
          <AnimatePresence mode="wait">
            <motion.div
              key={openFeaturesCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {carEquipmentCategories[openFeaturesCategory] && (
                <>
                  {/* Special handling for Sedeži in vrata - dropdown selects */}
                  {openFeaturesCategory === 'sedeži_in_vrata' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(carEquipmentCategories[openFeaturesCategory].subcategories || {}).map(([subKey, subCategory]) => (
                        <div key={subKey}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{subCategory.name}</label>
                          <select
                            value={formData.featureIds.find(f => subCategory.features.includes(f)) || ''}
                            onChange={(e) => {
                              const newValue = e.target.value
                              setFormData(prev => ({
                                ...prev,
                                featureIds: [
                                  ...prev.featureIds.filter(f => !subCategory.features.includes(f)),
                                  ...(newValue ? [newValue] : [])
                                ]
                              }))
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                          >
                            <option value="">Izberi...</option>
                            {subCategory.features.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Regular checkboxes for other categories */}
                  {openFeaturesCategory !== 'sedeži_in_vrata' && Object.entries(carEquipmentCategories[openFeaturesCategory].subcategories || {}).map(([subKey, subCategory]) => (
                    <div key={subKey} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">{subCategory.name}</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const allSelected = subCategory.features.every(f => isFeatureSelected(f))
                            if (allSelected) {
                              setFormData(prev => ({
                                ...prev,
                                featureIds: prev.featureIds.filter(id => !subCategory.features.includes(id))
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                featureIds: [...new Set([...prev.featureIds, ...subCategory.features])]
                              }))
                            }
                          }}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          {subCategory.features.every(f => isFeatureSelected(f)) ? 'Ponastavi' : 'Izberi vse'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {subCategory.features.map((featureName) => {
                          const selected = isFeatureSelected(featureName)
                          return (
                            <label
                              key={featureName}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                                selected 
                                  ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleFeature(featureName)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                selected 
                                  ? 'border-orange-500 bg-orange-500' 
                                  : 'border-gray-300'
                              }`}>
                                {selected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="flex-1 text-xs leading-relaxed whitespace-normal">{featureName}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('city_label')}</h2>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('city_label')} *</label>
            <input type="text" placeholder="Type city name..." value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className={"w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 " + (errors.city ? 'border-red-500' : 'border-gray-200')} />
            <AnimatePresence>
              {citySuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto" >
                  {citySuggestions.map((city) => (
                    <button key={city} type="button" onClick={() => selectCity(city)} className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between" >
                      <span>{city}</span>
                      {formData.city === city && <Check className="w-4 h-4 text-primary-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('photosLabel')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4 max-h-[400px] overflow-y-auto">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={img} alt={"Car " + (index + 1)} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600" >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{t('addPhotos')}</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-sm text-gray-500">Upload as many photos as you want.</p>
          {isPremium && <p className="text-sm text-green-600 font-medium mt-2">✓ Premium: HD photos + 360° enabled</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('description_label')}</h2>
          <textarea placeholder={isSl ? 'Opisite svoje vozilo...' : 'Describe your car...'} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className={"w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px] resize-y " + (errors.description ? 'border-red-500' : 'border-gray-200')} />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Free car limit notice */}
        {!canPostCar.allowed && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">
                  {isSl ? 'Potrebujete paket!' : 'You need a package!'}
                </p>
                <p className="text-sm text-red-600">
                  {canPostCar.reason}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Show remaining free listings */}
        {canPostCar.allowed && !isPremium && currentUserCarCount < FREE_CAR_LIMIT && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">
                    {isSl ? 'Brezplacna objava!' : 'Free listing!'}
                  </p>
                  <p className="text-sm text-green-600">
                    {isSl 
                      ? `Imate ${FREE_CAR_LIMIT - currentUserCarCount} brezplacnih objav preostalo`
                      : `You have ${FREE_CAR_LIMIT - currentUserCarCount} free listings remaining`
                    }
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-700">
                {currentUserCarCount}/{FREE_CAR_LIMIT}
              </span>
            </div>
          </div>
        )}

        {/* Package Pricing Preview */}
        {publishingPackages.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{isSl ? 'Izbira paketa' : 'Package Options'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishingPackages.map((pkg) => {
                const discountedPrice = pkg.discount_active && pkg.discount_percent > 0 
                  ? pkg.price * (1 - pkg.discount_percent / 100) 
                  : pkg.price
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                
                return (
                  <div key={pkg.id} className="bg-white rounded-xl p-4 border border-gray-200 relative">
                    {hasDiscount && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                        -{pkg.discount_percent}%
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{pkg.name_sl || pkg.name}</p>
                        <p className="text-sm text-gray-500">{pkg.min_days} {isSl ? 'dni' : 'days'}</p>
                      </div>
                      <div className="text-right">
                        {hasDiscount ? (
                          <>
                            <p className="text-lg font-bold text-[#ff6a00]">€{discountedPrice.toFixed(2)}</p>
                            <p className="text-xs text-gray-400 line-through">€{pkg.price.toFixed(2)}</p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-[#ff6a00]">€{pkg.price.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-gray-500 mt-3">{isSl ? 'Cena velja za izbrano paketo.' : 'Final price depends on selected package.'}</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg">
          {isEditMode ? t('saveChanges') : (canPostCar.allowed ? t('publishCar') : t('buyPackage'))}
        </Button>
      </form>
    </div>
  )
}

export default AddCarPage;
