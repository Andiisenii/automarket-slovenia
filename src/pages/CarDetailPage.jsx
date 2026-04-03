import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/lib/api'
import { 
  ArrowLeft, Heart, Share2, Eye, Calendar, Gauge, Fuel, 
  Settings, Shield, Phone, MessageCircle, 
  Star, Check, Clock, AlertCircle, X, Send, Phone as PhoneIcon, MessageSquare, CreditCard,
  Wifi, Car, Wind, Leaf, Users
} from 'lucide-react'
import { getFeatureNameById, getFeatureById } from '@/lib/data'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatPrice, formatNumber, getTimeAgo } from '@/lib/utils'
import { useFavorites } from '@/lib/FavoritesContext'
import { useMessages } from '@/lib/MessagesContext'
import { useAuth } from '@/lib/AuthContext'
import { useCars } from '@/lib/CarContext'
import { useLanguage } from '@/lib/LanguageContext'

export function CarDetailPage() {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const isSl = language === 'sl'
  const navigate = useNavigate()
  
  // Get car from context for refresh
  const { getCarById } = useCars()
  
  // Local state for fresh car data
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch fresh car data from API
  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch directly from API to ensure fresh data
        const response = await fetch(`${API_URL}/cars.php?id=${id}`, {
          headers: { 'X-Pinggy-No-Screen': 'true' }
        })
        const data = await response.json()
        
        if (data.success && data.car) {
          // Transform API response from snake_case to camelCase
          const carData = data.car
          const transformedCar = {
            ...carData,
            fuelType: carData.fuel_type || carData.fuelType || '',
            bodyType: carData.body_type || carData.bodyType || '',
            transmission: carData.transmission || carData.transmission || '',
            engine: carData.engine || carData.engine || '',
            horsepower: carData.horsepower || carData.horsepower || 0,
            color: carData.color || carData.color || '',
            hasFinancing: carData.has_financing ?? carData.hasFinancing ?? false,
            monthlyBudget: carData.monthly_budget ?? carData.monthlyBudget ?? 0,
            downPaymentType: carData.down_payment_type || carData.downPaymentType || 'amount',
            downPaymentValue: carData.down_payment_value || carData.downPaymentValue || 0,
            featureIds: carData.feature_ids || carData.featureIds || [],
            createdAt: carData.created_at || carData.createdAt,
            seller: {
              name: carData.seller_name || carData.seller?.name || 'Seller',
              phone: carData.seller_phone || carData.seller?.phone || '',
              photo: carData.seller_photo || carData.seller?.photo || '',
              verified: carData.seller_verified || carData.seller?.verified || false,
              rating: carData.seller_rating || carData.seller?.rating || '5.0',
              reviews: carData.seller_reviews || carData.seller?.reviews || 0,
              userType: carData.seller_type || carData.seller?.userType || 'private',
              hasPhone: carData.seller_has_phone ?? carData.seller?.hasPhone ?? true,
              hasWhatsapp: carData.seller_has_whatsapp ?? carData.seller?.hasWhatsapp ?? false,
              hasViber: carData.seller_has_viber ?? carData.seller?.hasViber ?? false,
            }
          }
          console.log('Transformed car data:', transformedCar)
          setCar(transformedCar)
        } else {
          // Fallback to context if API fails
          const contextCar = getCarById(parseInt(id))
          if (contextCar) {
            setCar(contextCar)
          } else {
            setError('Car not found')
          }
        }
      } catch (err) {
        console.error('Error fetching car:', err)
        // Fallback to context
        const contextCar = getCarById(parseInt(id))
        if (contextCar) {
          setCar(contextCar)
        } else {
          setError('Failed to load car')
        }
      }
      
      setLoading(false)
    }
    
    fetchCar()
  }, [id])
  
  const [currentImage, setCurrentImage] = useState(0)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showCallMenu, setShowCallMenu] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  
  const { toggleFavorite, isFavorite: checkFavorite } = useFavorites()
  const { sendMessage } = useMessages()
  const { isAuthenticated, user } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6a00] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading car details...</p>
        </div>
      </div>
    )
  }
  
  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Car Not Found'}</h1>
          <Link to="/cars">
            <Button>Browse Cars</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  const isFav = checkFavorite(car.id)
  const specs = [
    { icon: Calendar, label: t('year'), value: car.year },
    { icon: Gauge, label: t('mileage'), value: `${formatNumber(Number(car.mileage))} km` },
    { icon: Fuel, label: t('fuelType'), value: car.fuelType || 'N/A' },
    { icon: Settings, label: t('transmission'), value: car.transmission || 'N/A' },
    { icon: Shield, label: t('engine'), value: car.engine || 'N/A' },
    { icon: Shield, label: t('power'), value: car.horsepower ? `${car.horsepower} HP` : 'N/A' },
    { icon: Shield, label: t('color'), value: car.color || 'N/A' },
    { icon: Shield, label: t('bodyType'), value: car.bodyType || 'N/A' },
  ]
  
  // Get selected features with names
  const selectedFeatureIds = car.featureIds || []
  const selectedFeatures = selectedFeatureIds.map(id => getFeatureById(id)).filter(Boolean)
  
  const handleSendMessage = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cars/' + car.id)
      return
    }
    if (!messageText.trim()) return
    
    sendMessage({
      fromUserId: user?.id,
      fromUserName: user?.name,
      toUserId: car.seller?.name,
      toUserName: car.seller?.name,
      carId: car.id,
      carTitle: car.title,
      text: messageText,
    })
    
    setShowMessageModal(false)
    setMessageText('')
    alert('Message sent to seller!')
  }
  
  const handleShare = (platform) => {
    const url = window.location.href
    const text = `Check out this ${car.title} for ${formatPrice(Number(car.price))}`
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(car.title)}&body=${encodeURIComponent(text + '\n\n' + url)}`)
        break
      default:
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
    }
    setShowShareMenu(false)
  }
  
  const handleCall = (method) => {
    const phone = car.seller?.phone || '+386 40 123 456'
    
    switch (method) {
      case 'phone':
        window.location.href = `tel:${phone}`
        break
      case 'whatsapp':
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`)
        break
      case 'viber':
        alert(`Open Viber and message: ${phone}`)
        break
      default:
        window.location.href = `tel:${phone}`
    }
    setShowCallMenu(false)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/cars" 
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cars
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={car.images?.[currentImage] || car.images?.[0] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800'}
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {car.images?.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {car.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                        currentImage === index ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => toggleFavorite(car.id)}
                  className={isFav ? 'text-red-500 border-red-200 bg-red-50' : ''}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFav ? 'fill-current' : ''}`} />
                  {isFav ? 'Saved' : 'Save'}
                </Button>
                
                {/* Share Button with Menu */}
                <div className="relative">
                  <Button variant="secondary" onClick={() => setShowShareMenu(!showShareMenu)}>
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[160px] z-10"
                      >
                        <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                          <span className="text-green-500 font-bold">W</span>
                          WhatsApp
                        </button>
                        <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                          <span className="text-blue-600 font-bold">f</span>
                          Facebook
                        </button>
                        <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                          <span className="text-blue-400 font-bold">X</span>
                          X (Twitter)
                        </button>
                        <button onClick={() => handleShare('email')} className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          Email
                        </button>
                        <button onClick={() => handleShare('copy')} className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                          <span className="text-gray-500">Copy</span>
                          Link
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <Eye className="w-5 h-5" />
                <span className="text-sm">{formatNumber(car.views)} views</span>
              </div>
            </div>
            
            {/* Title & Price */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {car.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Listed {getTimeAgo(car.createdAt || car.created_at)}</span>
                    <span>ID: #{String(car.id).padStart(6, '0')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(Number(car.price))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Estimated: {formatPrice(Number(car.price) * 1.1)} with VAT</div>{car.featured && <div className="text-xs text-orange-600 font-medium mt-1">? Featured</div>}{car.promoted && <div className="text-xs text-green-600 font-medium">? Promoted</div>}
                  
                  {/* Financing Info */}
                  {car.hasFinancing && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                        <CreditCard className="w-4 h-4" />
                        <span>Možnost financiranja</span>
                      </div>
                      {car.monthlyBudget && (
                        <div className="text-lg font-bold text-green-800 mt-1">
                          {car.monthlyBudget} €/mes.
                        </div>
                      )}
                      {car.downPaymentValue && (
                        <div className="text-xs text-green-600 mt-1">
                          Predplačilo: {car.downPaymentType === 'percentage' 
                            ? `${car.downPaymentValue}%` 
                            : formatPrice(car.downPaymentValue)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-green-200">
                        Ali plačajte takoj: {formatPrice(Number(car.price))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {car.featured && <Badge variant="warning">Featured</Badge>}
                
                {/* Promotion Badges - specific to THIS car */}
                {Number(car.promoted) === 1 && (car.boostPackage || car.boost_package) === 'akcija' && (
                  <Badge className="bg-orange-500 text-white">🔥 AKCIJA</Badge>
                )}
                {Number(car.promoted) === 1 && (car.boostPackage || car.boost_package) === 'top' && (
                  <Badge className="bg-green-500 text-white">⭐ TOP</Badge>
                )}
                {Number(car.promoted) === 1 && (car.boostPackage || car.boost_package) === 'skok' && (
                  <Badge className="bg-blue-500 text-white">🚀 SKOK NA VRH</Badge>
                )}
                {Number(car.promoted) === 1 && (car.boostPackage || car.boost_package) === 'akcija_p' && (
                  <Badge className="bg-orange-500 text-white">🔥 AKCIJA</Badge>
                )}
                {Number(car.promoted) === 1 && (car.boostPackage || car.boost_package) === 'top_p' && (
                  <Badge className="bg-green-500 text-white">⭐ TOP</Badge>
                )}
                {Number(car.promoted) === 1 && (car.boostPackage || car.boost_package) === 'skok_p' && (
                  <Badge className="bg-blue-500 text-white">🚀 SKOK NA VRH</Badge>
                )}
                
                <Badge variant="success">Active</Badge>
                <Badge variant="primary">{car.bodyType}</Badge>
              </div>
            </Card>
            
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{car.description}</p>
            </Card>
            
            {/* Specifications */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <spec.icon className="w-4 h-4" />
                      <span className="text-xs">{spec.label}</span>
                    </div>
                    <div className="font-semibold text-gray-900">{spec.value}</div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Features / Equipment */}
            {selectedFeatures.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Oprema vozila</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.map((feature) => (
                    <div 
                      key={feature.id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm"
                      title={feature.name_en}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-800">
                        {isSl ? feature.name_sl : feature.name_en}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Skupaj: {selectedFeatures.length} opreme
                </p>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <Card className="p-6 sticky top-4 z-50">
              <div className="flex items-center gap-4 mb-6">
                {car.seller?.photo ? (
                  <img 
                    src={car.seller.photo} 
                    alt={car.seller.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-xl font-bold text-primary-600">
                    {car.seller?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{car.seller?.name || 'Seller'}</h3>
                    {car.seller?.verified && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium">{car.seller?.rating || '5.0'}</span>
                    <span className="text-gray-500">({car.seller?.reviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {/* Call Button with Menu */}
                <div className="relative w-full">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowCallMenu(!showCallMenu)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                  <AnimatePresence>
                    {showCallMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-10"
                      >
                        <p className="text-xs text-gray-500 px-3 py-1 mb-1">Call with:</p>
                        <button 
                          onClick={() => handleCall('phone')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                        >
                          <PhoneIcon className="w-4 h-4 text-primary-600" />
                          Phone Call
                        </button>
                        <button 
                          onClick={() => handleCall('whatsapp')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                        >
                          <span className="text-green-500 font-bold">W</span>
                          WhatsApp
                        </button>
                        <button 
                          onClick={() => handleCall('viber')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                        >
                          <span className="text-purple-600">V</span>
                          Viber
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <Button variant="secondary" className="w-full" onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/cars/' + car.id)
                    return
                  }
                  setShowMessageModal(true)
                }}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  Usually responds within 1 hour
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4" />
                  Always verify the seller before payment
                </div>
              </div>
            </Card>
            
            {/* Company Info - Only for Business Sellers */}
            {car.seller?.userType === 'business' && car.companyInfo && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🏢 Podjetje</h3>
                <div className="space-y-3 text-sm">
                  <div className="font-medium text-gray-700">{car.companyInfo.name}</div>
                  <div className="text-gray-600">📍 {car.companyInfo.address}, {car.companyInfo.postalCode} {car.companyInfo.city}</div>
                  <div className="text-gray-600">📞 {car.companyInfo.phone}</div>
                  <div className="text-gray-600">✉️ {car.companyInfo.email}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">🕐 Delovni cas</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between"><span>Pon:</span><span>{car.companyInfo.workingHours?.monday || '08:00-18:00'}</span></div>
                    <div className="flex justify-between"><span>Tor:</span><span>{car.companyInfo.workingHours?.tuesday || '08:00-18:00'}</span></div>
                    <div className="flex justify-between"><span>Sre:</span><span>{car.companyInfo.workingHours?.wednesday || '08:00-18:00'}</span></div>
                    <div className="flex justify-between"><span>Cet:</span><span>{car.companyInfo.workingHours?.thursday || '08:00-18:00'}</span></div>
                    <div className="flex justify-between"><span>Pet:</span><span>{car.companyInfo.workingHours?.friday || '08:00-18:00'}</span></div>
                    <div className="flex justify-between"><span>Sob:</span><span>{car.companyInfo.workingHours?.saturday || '09:00-14:00'}</span></div>
                    <div className="flex justify-between"><span>Ned:</span><span>{car.companyInfo.workingHours?.sunday || 'Zaprto'}</span></div>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Location Map */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📍 Lokacija</h3>
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-sm text-gray-600">{car.city ? car.city.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase()) : 'Ljubljana'}</p>
                </div>
              </div>
            </Card>
            
            {/* Stats */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Statistika</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Objavljeno:</span><span className="font-medium">{car.createdAt ? new Date(car.createdAt).toLocaleDateString('sl-SI') : (car.created_at ? new Date(car.created_at).toLocaleDateString('sl-SI') : 'N/A')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Ogledi skupaj:</span><span className="font-medium">{formatNumber(car.views||0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Ogledi danes:</span><span className="font-medium text-green-600">{formatNumber(Math.floor((car.views||0)/7))}</span></div>
              </div>
            </Card>
            
            {/* Request in Stock */}
            <Card className="p-6 border-2 border-orange-100 bg-orange-50">
              <div className="text-center">
                <div className="text-3xl mb-2">🔔</div>
                <h4 className="font-semibold mb-2">Iscete drugo vozilo?</h4>
                <p className="text-xs text-gray-600 mb-3">Posiljite zahtevo za vozilo ki ga iščete</p>
                <Button className="w-full bg-orange-500" onClick={() => { if(!isAuthenticated) navigate('/login'); else setShowMessageModal(true) }}>
                  Poslji zahtevo
                </Button>
              </div>
            </Card>
            
            {/* Safety Tips */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Safety Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Meet in a safe, public location
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Inspect the vehicle thoroughly before buying
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Verify documents and ownership
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Use secure payment methods
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowMessageModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Send Message to Seller</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Regarding:</p>
              <p className="font-medium">{car.title}</p>
              <p className="text-sm text-primary-600">{formatPrice(Number(car.price))}</p>
            </div>
            
            <textarea
              placeholder="Write your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            
            <Button className="w-full" onClick={handleSendMessage}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
