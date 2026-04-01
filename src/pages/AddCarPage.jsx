import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, X, Check, CreditCard, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { useCars } from '@/lib/CarContext'
import { packageDB, carDB } from '@/lib/database'
import { getAllBrands, getModelsForBrand, getAllCities, fuelTypes, transmissions, bodyTypes, colors, LUXURY_CAR_THRESHOLD } from '@/lib/data'

export function AddCarPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { addCar, updateCar, getCarById } = useCars()
  const { t, language } = useLanguage()
  const isSl = language === 'sl'

  const [allBrands, setAllBrands] = useState([])
  const [allCities, setAllCities] = useState([])
  const [brandModels, setBrandModels] = useState({})
  const [boostPackages, setBoostPackages] = useState({ private: [], business: [] })
  const [publishingPackages, setPublishingPackages] = useState([])
  
  const [formData, setFormData] = useState({
    title: '', brand: '', model: '', year: new Date().getFullYear(),
    price: '', mileage: '', fuelType: '', transmission: '', bodyType: '',
    engine: '', horsepower: '', color: '', city: '', description: '',
  })

  const [hasFinancing, setHasFinancing] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [downPaymentType, setDownPaymentType] = useState('amount')
  const [downPaymentValue, setDownPaymentValue] = useState('')
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const [selectedBoost, setSelectedBoost] = useState(null)
  const [boostDays, setBoostDays] = useState(30)

  

  const userId = user?.id

  // Package check  const userPackage = packageDB.getCurrentPackage()  const isPremium = packageDB.isPremium()  const photoQuality = isPremium ? 'HD + 360' + [char]0x00B0 + ' ' + ': 'Standard'  const maxPhotos = isPremium ? 30 : 10
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

  const getMonthlyCarCount = () => {
    if (!userId) return 0
    const myCars = JSON.parse(localStorage.getItem('myListings') || '[]')
    const now = new Date()
    return myCars.filter(car => {
      const carDate = new Date(car.createdAt || Date.now())
      return car.seller?.id === userId && carDate.getMonth() === now.getMonth() && carDate.getFullYear() === now.getFullYear()
    }).length
  }

  const monthlyCarCount = getMonthlyCarCount()

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

  useEffect(() => {
    if (editCar) {
      setFormData({
        title: editCar.title || '', brand: editCar.brand || '', model: editCar.model || '',
        year: editCar.year || new Date().getFullYear(), price: editCar.price || '',
        mileage: editCar.mileage || '', fuelType: editCar.fuelType || editCar.fuel_type || '', 
        transmission: editCar.transmission || '', bodyType: editCar.bodyType || editCar.body_type || '', 
        engine: editCar.engine || '', horsepower: editCar.horsepower || '',
        color: editCar.color || '', city: editCar.city || '', description: editCar.description || '',
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
        console.log('Packages fetched:', data.packages)
        if (data.success && data.packages) {
          // Set publishing packages with discount info
          setPublishingPackages(data.packages.filter(p => p.type === 'publishing').map(p => ({
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
    if (!formData.title) newErrors.title = 'Title is required'
    if (!formData.brand) newErrors.brand = 'Brand is required'
    if (!formData.year) newErrors.year = 'Year is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required'
    if (!formData.transmission) newErrors.transmission = 'Transmission is required'
    if (!formData.bodyType) newErrors.bodyType = 'Body type is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.description) newErrors.description = 'Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const userPackage = packageDB.getCurrentPackage()
  const isPremium = packageDB.isPremium()
  const currentUserCarCount = carDB.getMyCarCount()
  const canPost = () => { if (isPremium) return true; if (userPackage?.packageId === 'osnovni' && currentUserCarCount < 100) return true; return false }
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

    if (canPostCar) {
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
    }
    navigate('/payment', { state: { carData: carDataForPayment } })
  }

  const Dropdown = ({ label, name, value, options, color = false }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
      <button type="button" onClick={() => toggleDropdown(name)} className={"w-full px-4 py-3 bg-gray-50 border rounded-xl text-left flex items-center justify-between hover:bg-gray-100 transition-colors " + (!value ? 'text-gray-400' : '')} >
        <span>{value || "Select " + label}</span>
        <ChevronDown className={"w-4 h-4 transition-transform " + (openDropdown === name ? 'rotate-180' : '')} />
      </button>
      <AnimatePresence>
        {openDropdown === name && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto" >
            {options.map((opt) => (
              <button key={opt} type="button" onClick={() => selectOption(name, opt)} className={"w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 " + (value === opt ? 'bg-primary-50 text-primary-700' : '')} >
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label={t('title_label') + ' *'} placeholder={isSl ? 'npr. BMW X5 M Sport' : 'e.g. 2023 BMW X5 xDrive40i'} value={formData.title} onChange={(e) => handleChange('title', e.target.value)} error={errors.title} />
            </div>
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
            <Input label={t('price_label').replace('(€)', '') + ' *'} type="number" placeholder="50000" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} error={errors.price} />

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
                  <button type="button" onClick={() => setHasFinancing(!hasFinancing)} className={"relative inline-flex h-7 w-12 items-center rounded-full transition-colors " + (hasFinancing ? 'bg-green-500' : 'bg-gray-300')} >
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
            <Dropdown label={t('color') + ' *'} name="color" value={formData.color} options={colors} color={true} />
            <Input label={t('engine')} placeholder={isSl ? 'npr. 2.0 TDI' : 'e.g. 2.0L TFSI'} value={formData.engine} onChange={(e) => handleChange('engine', e.target.value)} />
            <Input label={t('power') + ' (HP)'} type="number" placeholder="200" value={formData.horsepower} onChange={(e) => handleChange('horsepower', parseInt(e.target.value))} />
          </div>
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
          {isEditMode ? t('saveChanges') : (canPostCar ? t('publishCar') : t('buyPackage'))}
        </Button>
      </form>
    </div>
  )
}

export default AddCarPage;
