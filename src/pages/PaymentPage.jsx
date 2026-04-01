import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Check, CreditCard, Lock, Shield, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/AuthContext'
import { useCars } from '@/lib/CarContext'
import { packageDB, paymentDB, carDB } from '@/lib/database'
import { brands, defaultModels, fuelTypes, transmissions, bodyTypes, colors, slovenianCities, LUXURY_CAR_THRESHOLD, LUXURY_FEE } from '@/lib/data'

export function PaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { user } = useAuth()
  const { addCar } = useCars()
  
  // Get car data from location state or URL params
  const carDataParam = searchParams.get('carData')
  const [carData, setCarData] = useState(null)
  const [boostPackagesData, setBoostPackagesData] = useState({ private: [], business: [] })
  const [publishingPackages, setPublishingPackages] = useState([])
  
  useEffect(() => {
    if (carDataParam) {
      try {
        const decoded = JSON.parse(atob(carDataParam))
        setCarData(decoded)
      } catch (e) {
        console.error('Error parsing car data:', e)
        navigate('/add-car')
      }
    } else if (location.state?.carData) {
      setCarData(location.state.carData)
    } else {
      navigate('/add-car')
    }
  }, [carDataParam, location.state])
  
  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost/api'}/packages.php`, {
          headers: { 'X-Pinggy-No-Screen': 'true' }
        })
        const data = await res.json()
        if (data.success && data.packages) {
          // Set publishing packages with discount info
          setPublishingPackages(data.packages.filter(p => p.type === 'publishing').map(p => ({
            id: p.id,
            name: p.name,
            name_sl: p.name_sl || p.name,
            price: parseFloat(p.price),
            discount_percent: parseInt(p.discount_percent) || 0,
            discount_active: p.discount_active == 1,
            min_days: p.min_days || 30,
            max_cars: p.max_cars || 100,
            features: p.description ? p.description.split('|') : []
          })))
          
          setBoostPackagesData({
            private: data.packages.filter(p => p.type === 'boost_private').map(p => ({
              id: p.id,
              name: p.name,
              price: parseFloat(p.price),
              min_days: p.min_days || 1,
              color: 'green'
            })),
            business: data.packages.filter(p => p.type === 'boost_business').map(p => ({
              id: p.id,
              name: p.name,
              price: parseFloat(p.price),
              min_days: p.min_days || 1,
              color: 'orange'
            }))
          })
        }
      } catch (e) {
        console.error('Error fetching packages:', e)
      }
    }
    fetchPackages()
  }, [])
  
  // Check if user is business
  const isBusiness = user?.userType === 'business'
  
  // Package selection state
  const [selectedPackage, setSelectedPackage] = useState('basic')
  const [selectedBoost, setSelectedBoost] = useState(null)
  const [boostDays, setBoostDays] = useState(30)
  const [showBoostOptions, setShowBoostOptions] = useState(false)
  
  // Payment state
  const [paymentStep, setPaymentStep] = useState('package') // 'package', 'card', 'success'
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
  })
  const [cardType, setCardType] = useState('unknown')
  const [errors, setErrors] = useState({})
  
  // Get boost packages from API
  const getBoostPackages = () => {
    const packages = isBusiness ? boostPackagesData.business : boostPackagesData.private
    return packages.map(p => ({
      id: p.id,
      name: p.name.toUpperCase(),
      subtitles: [],
      price: p.price || 1.00,
      min_days: p.min_days || 1,
      color: p.color || 'green',
      discount_percent: p.discount_percent || 0,
      discount_active: p.discount_active || false
    }))
  }
  
  // Get boost packages
  const boostPackages = getBoostPackages()
  
  // Calculate totals
  const isLuxuryCar = carData?.price > LUXURY_CAR_THRESHOLD && !isBusiness
  const luxuryFee = isLuxuryCar ? LUXURY_FEE : 0
  const selectedPkg = publishingPackages.find(p => p.id === selectedPackage)
  const packagePrice = selectedPkg 
    ? (selectedPkg.discount_active && selectedPkg.discount_percent > 0 
        ? selectedPkg.price * (1 - selectedPkg.discount_percent / 100) 
        : selectedPkg.price)
    : 0
  const boostPrice = selectedBoost ? boostPackages.find(b => b.id === selectedBoost)?.price * boostDays : 0
  const totalPrice = packagePrice + luxuryFee + boostPrice
  
  // Card type detection
  const detectCardType = (number) => {
    const clean = number.replace(/\s+/g, '')
    if (/^4/.test(clean)) return 'visa'
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard'
    if (/^3[47]/.test(clean)) return 'amex'
    if (/^6(?:011|5)/.test(clean)) return 'discover'
    return 'unknown'
  }
  
  const getCardIcon = (type) => {
    switch (type) {
      case 'visa': return '💳 VISA'
      case 'mastercard': return '💳 Mastercard'
      case 'amex': return '💳 American Express'
      case 'discover': return '💳 Discover'
      default: return '💳 Kardica'
    }
  }
  
  // Format card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }
  
  // Format expiry
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }
  
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setCardDetails({ ...cardDetails, number: formatted })
    setCardType(detectCardType(formatted))
  }
  
  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value)
    setCardDetails({ ...cardDetails, expiry: formatted })
  }
  
  const handleCvcChange = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, '')
    setCardDetails({ ...cardDetails, cvc: v.slice(0, 4) })
  }
  
  // Validate card
  const validateCard = () => {
    const newErrors = {}
    if (!cardDetails.name.trim()) newErrors.name = 'Ime in priimek sta obvezna'
    
    const cleanNumber = cardDetails.number.replace(/\s+/g, '')
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      newErrors.number = 'Veljavna številka kartice'
    }
    
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      newErrors.expiry = 'Veljaven datum'
    }
    
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = 'Veljaven CVC'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handlePayment = () => {
    if (!validateCard()) return
    
    // Simulate payment
    setPaymentStep('processing')
    
    setTimeout(() => {
      // Get selected package info
      const pkg = publishingPackages.find(p => p.id === selectedPackage) || {}
      const pkgPrice = pkg.discount_active && pkg.discount_percent > 0 
        ? pkg.price * (1 - pkg.discount_percent / 100)
        : pkg.price
      
      // Save package to database
      packageDB.setPackage({
        packageId: pkg.id || 'basic',
        duration: pkg.min_days || 30,
      })
      
      // Save to admin purchases for tracking
      const purchase = {
        id: Date.now(),
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        packageId: pkg.id || selectedPackage,
        packageName: pkg.name || selectedPackage,
        price: pkgPrice,
        days: pkg.min_days || 30,
        purchasedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (pkg.min_days || 30) * 24 * 60 * 60 * 1000).toISOString(),
      }
      const existingPurchases = JSON.parse(localStorage.getItem('adminPurchases') || '[]')
      existingPurchases.push(purchase)
      localStorage.setItem('adminPurchases', JSON.stringify(existingPurchases))
      
      // Also save to user's individual storage for their dashboard
      localStorage.setItem(`automarket_package_${user?.id}`, JSON.stringify({
        ...purchase,
        activatedAt: new Date().toISOString(),
      }))
      
      // Save car
      if (carData) {
        const finalCarData = {
          ...carData,
          package: selectedPackage,
          packagePrice: totalPrice,
          promoted: !!selectedBoost,
          hasBoost: !!selectedBoost,
          boostPackage: selectedBoost,
          boostSpent: boostPrice,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active',
        }
        addCar(finalCarData)
        
        // Save boost purchase if selected
        if (selectedBoost && boostPrice > 0) {
          const boostFound = boostPackages.find(b => b.id === selectedBoost)
          const boostActualPrice = boostFound?.price || 1.00
          
          const boostPurchase = {
            id: Date.now() + 1,
            userId: user?.id,
            userEmail: user?.email,
            userName: user?.name,
            packageId: selectedBoost,
            packageName: boostPkg?.name || selectedBoost,
            price: boostActualPrice * boostDays,
            days: boostDays,
            purchasedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + boostDays * 24 * 60 * 60 * 1000).toISOString(),
          }
          const existingPurchases = JSON.parse(localStorage.getItem('adminPurchases') || '[]')
          existingPurchases.push(boostPurchase)
          localStorage.setItem('adminPurchases', JSON.stringify(existingPurchases))
        }
      }
      
      setPaymentStep('success')
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    }, 2000)
  }
  
  const getBoostColorClasses = (color) => {
    const colors = {
      orange: 'border-orange-400 bg-orange-50',
      green: 'border-green-400 bg-green-50', 
      blue: 'border-blue-400 bg-blue-50'
    }
    return colors[color] || colors.orange
  }
  
  const getBoostButtonClasses = (color) => {
    const colors = {
      orange: 'bg-orange-500 hover:bg-orange-600',
      green: 'bg-green-500 hover:bg-green-600',
      blue: 'bg-blue-500 hover:bg-blue-600'
    }
    return colors[color] || colors.orange
  }
  
  if (!carData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nazaj
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {paymentStep === 'package' && (
            <motion.div
              key="package"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Izberite paket</h1>
              
              {/* Car Summary */}
              <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <img 
                    src={carData.images?.[0] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=200'} 
                    alt={carData.title}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{carData.title}</h3>
                    <p className="text-sm text-gray-500">{carData.year} • {carData.brand} {carData.model}</p>
                    <p className="text-lg font-bold text-[#ff6a00]">€{carData.price?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Package Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {publishingPackages.map((pkg) => {
                  const discountedPrice = pkg.discount_active ? pkg.price * (1 - pkg.discount_percent / 100) : pkg.price
                  const isSelected = selectedPackage === pkg.id
                  
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                        isSelected
                          ? 'border-[#ff6a00] bg-orange-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Discount Sticker */}
                      {pkg.discount_active && pkg.discount_percent > 0 && (
                        <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          -{pkg.discount_percent}%
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-lg text-gray-900">{pkg.name_sl || pkg.name}</span>
                        {isSelected && <Check className="w-5 h-5 text-[#ff6a00]" />}
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {pkg.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            {feature.trim()}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="text-2xl font-bold text-[#ff6a00]">
                        {pkg.discount_active && pkg.discount_percent > 0 ? (
                          <>
                            <span className="line-through text-gray-400 text-base mr-2">€{pkg.price.toFixed(2)}</span>
                            <span>€{discountedPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span>€{pkg.price.toFixed(2)}</span>
                        )}
                        <span className="text-sm font-normal text-gray-500">/{pkg.min_days} {isSl ? 'dni' : 'days'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {/* Boost Options */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Dodatna promocija (opcijsko)</h3>
                  <button
                    onClick={() => setShowBoostOptions(!showBoostOptions)}
                    className="text-[#ff6a00] text-sm font-medium"
                  >
                    {showBoostOptions ? 'Skrij' : 'Prikaži'}
                  </button>
                </div>
                
                {showBoostOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {/* Days Selection */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Število dni promocije</label>
                      <input 
                        type="number" 
                        min={isBusiness ? 30 : 15}
                        value={boostDays}
                        onChange={(e) => setBoostDays(Math.max(isBusiness ? 30 : 15, parseInt(e.target.value) || (isBusiness ? 30 : 15)))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimalno: {isBusiness ? '30' : '15'} dni</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {boostPackages.map((boost) => {
                        const discountedPrice = boost.discount_active && boost.discount_percent > 0 
                          ? boost.price * (1 - boost.discount_percent / 100) 
                          : boost.price
                        const hasDiscount = boost.discount_active && boost.discount_percent > 0
                        
                        return (
                          <button
                            key={boost.id}
                            onClick={() => setSelectedBoost(selectedBoost === boost.id ? null : boost.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                              selectedBoost === boost.id
                                ? getBoostColorClasses(boost.color)
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Discount Sticker */}
                            {hasDiscount && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                                -{boost.discount_percent}%
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-900">{boost.name}</div>
                                <div className="space-y-0.5 mt-1">
                                  {boost.subtitles.map((sub, idx) => (
                                    <div key={idx} className="text-xs text-gray-500">{sub}</div>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{boost.days}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-[#ff6a00]">
                                  {hasDiscount ? (
                                    <>
                                      <span className="line-through text-gray-400 text-xs mr-1">€{boost.price.toFixed(2)}</span>
                                      <span>€{discountedPrice.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    <span>€{boost.price.toFixed(2)}</span>
                                  )}
                                  <span className="text-xs text-gray-500">/dan</span>
                                </div>
                                {selectedBoost === boost.id && (
                                  <Check className="w-5 h-5 text-green-600 ml-auto mt-1" />
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Price Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Povzetek naročila</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paket</span>
                    <span className="font-medium">{selectedPackage === 'premium' ? 'Premium' : 'Osnovni'}</span>
                  </div>
                  {selectedBoost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Promocija ({boostDays} dni)</span>
                      <span className="font-medium">+€{boostPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {isLuxuryCar && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provizija (nad 30k€)</span>
                      <span className="font-medium">+€{luxuryFee}</span>
                    </div>
                  )}
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Skupaj</span>
                    <span className="font-bold text-[#ff6a00]">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" size="lg" onClick={() => setPaymentStep('card')}>
                Naprej na plačilo
              </Button>
            </motion.div>
          )}
          
          {paymentStep === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Podatki o kartici</h1>
              
              {/* Price Summary */}
              <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Znesek za plačilo</span>
                  <span className="text-xl font-bold text-[#ff6a00]">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Card Form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-gray-600">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Vaši podatki so vareni in šifrirani</span>
                </div>
                
                {/* Card Type Indicator */}
                {cardType !== 'unknown' && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">{getCardIcon(cardType)}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Name on Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ime in priimek
                    </label>
                    <input
                      type="text"
                      placeholder="Janez Novak"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Številka kartice
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] pr-20 ${errors.number ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        {cardType === 'visa' && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">VISA</span>
                        )}
                        {cardType === 'mastercard' && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">MC</span>
                        )}
                        {cardType === 'amex' && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">AMEX</span>
                        )}
                        {cardType === 'discover' && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">DISC</span>
                        )}
                      </div>
                    </div>
                    {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                  </div>
                  
                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Datum veljavnosti
                      </label>
                      <input
                        type="text"
                        placeholder="MM/LL"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] ${errors.expiry ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={handleCvcChange}
                        maxLength={4}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] ${errors.cvc ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
                    </div>
                  </div>
                </div>
                
                {/* Demo Notice */}
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Demo način - pravo plačilo ne bo izvedeno
                  </p>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button variant="secondary" onClick={() => setPaymentStep('package')}>
                    Nazaj
                  </Button>
                  <Button className="flex-1" size="lg" onClick={handlePayment}>
                    <Lock className="w-4 h-4 mr-2" />
                    Plačaj €{totalPrice.toFixed(2)}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {paymentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#ff6a00] border-t-transparent mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Plačilo v obdelavi...</h2>
              <p className="text-gray-500">Prosimo počakajte</p>
            </motion.div>
          )}
          
          {paymentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Plačilo uspešno!</h2>
              <p className="text-gray-600 mb-6">Vaše vozilo je bilo uspešno objavljeno.</p>
              <p className="text-sm text-gray-500">Preusmerjanje na dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
