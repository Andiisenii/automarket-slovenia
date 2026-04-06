import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, Star, Zap, Package, TrendingDown, Shield, Car, Clock, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { supabase } from '@/lib/supabase'

const isSl = true

const translations = {
  sl: {
    title: 'IZBERITE PAKET',
    subtitle: 'Prodajte hitreje in prejmite vec kupcev',
    select: 'Izberi paket',
    payment: 'Placilo paketa',
    youSelected: 'Izbrali ste:',
    total: 'Skupaj:',
    cancel: 'Preklici',
    pay: 'Placaj',
    paymentSuccess: 'Placilo uspesno!',
    monthly: 'mesec',
    perDay: '/dan',
    duration: 'Minimalno trajanje',
    publishPackages: 'Paketi za objavo',
    boostPackages: 'Paketa za promocijo',
    privateBoost: 'Za zasebne uporabnike',
    businessBoost: 'Za poslovne uporabnike',
    discount: 'Zbitka',
    discounted: 'Znizana cena',
    original: 'Originalna cena',
    popular: 'Najbolj priljubljen',
    day: 'dan',
    days: 'dni',
    features: 'Kaj dobite:',
    upgrade: 'Nadgradite svojo prodajo',
  }
}

// Default features if not in database
const DEFAULT_PUBLISHING_FEATURES = {
  'Osnovni': [
    'Do 100 objav na mesec',
    '10 fotografij na objavo',
    'Osnovne funkcije',
    'Neomejeno urejanje',
    'Statistika ogledov'
  ],
  'Premium': [
    'Neomejene objave',
    '30 fotografij na objavo',
    'HD slike + 360° posnetki',
    'Premium uvrstitev',
    'Komentarji kupcev',
    'Prioritetna podpora'
  ]
}

const DEFAULT_BOOST_FEATURES = [
  'Prikaz na vrhu rezultatov',
  'Vec vidljivosti med kupci',
  'Hitreje prodajte vozilo',
  'Prepoznavnost blagovne znacke'
]

export function SellPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [packages, setPackages] = useState({ publishing: [], boost_private: [], boost_business: [] })
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  const t = translations.sl
  
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('type')
        
        if (data && data.length > 0) {
          const grouped = {
            publishing: data.filter(p => p.type === 'publishing'),
            boost_private: data.filter(p => p.type === 'boost_private'),
            boost_business: data.filter(p => p.type === 'boost_business')
          }
          setPackages(grouped)
        } else {
          // Fallback to hardcoded packages
          setPackages({
            publishing: [
              { id: 1, name: 'Osnovni', name_sl: 'Osnovni', type: 'publishing', price: 34.99, min_days: 30, discount_percent: 0, discount_active: false, features: DEFAULT_PUBLISHING_FEATURES['Osnovni'] },
              { id: 2, name: 'Premium', name_sl: 'Premium', type: 'publishing', price: 64.99, min_days: 30, discount_percent: 0, discount_active: false, features: DEFAULT_PUBLISHING_FEATURES['Premium'] }
            ],
            boost_private: [
              { id: 3, name: 'Top izbira', name_sl: 'Top izbira', type: 'boost_private', price: 1.50, min_days: 15, discount_percent: 0, discount_active: false, features: DEFAULT_BOOST_FEATURES },
              { id: 4, name: 'Skok na vrh', name_sl: 'Skok na vrh', type: 'boost_private', price: 1.00, min_days: 15, discount_percent: 0, discount_active: false, features: DEFAULT_BOOST_FEATURES }
            ],
            boost_business: [
              { id: 5, name: 'Top izbira', name_sl: 'Top izbira', type: 'boost_business', price: 0.65, min_days: 30, discount_percent: 0, discount_active: false, features: DEFAULT_BOOST_FEATURES },
              { id: 6, name: 'Skok na vrh', name_sl: 'Skok na vrh', type: 'boost_business', price: 0.50, min_days: 30, discount_percent: 0, discount_active: false, features: DEFAULT_BOOST_FEATURES }
            ]
          })
        }
      } catch (err) {
        console.error('Error loading packages:', err)
      }
      setLoading(false)
    }
    loadPackages()
  }, [])
  
  const getUserType = () => user?.user_type || 'private'
  const userType = getUserType()
  const showPrivate = userType === 'private' || !isAuthenticated
  const showBusiness = userType === 'business' || !isAuthenticated
  
  const getFinalPrice = (pkg) => {
    if (pkg.discount_active && pkg.discount_percent > 0) {
      return (pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)
    }
    return pkg.price
  }
  
  const getFeatures = (pkg) => {
    if (pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0) {
      return pkg.features
    }
    // Fallback features
    if (pkg.type === 'publishing') {
      return DEFAULT_PUBLISHING_FEATURES[pkg.name] || ['Objave na mesec', 'Fotografije', 'Urejanje oglasov']
    }
    return DEFAULT_BOOST_FEATURES
  }
  
  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate(`/register?role=seller&package=${plan.id}`)
      return
    }
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }
  
  const handlePayment = async () => {
    const userData = JSON.parse(localStorage.getItem('automarket_user') || '{}')
    
    if (selectedPlan && userData.id) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (selectedPlan.min_days || 30))
      
      await supabase.from('user_packages').insert({
        user_id: userData.id,
        package_id: selectedPlan.id,
        package_name: selectedPlan.name || selectedPlan.name_sl,
        package_type: selectedPlan.type,
        price_paid: getFinalPrice(selectedPlan),
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      
      // Also create an order record
      await supabase.from('orders').insert({
        user_id: userData.id,
        package_type: selectedPlan.type,
        amount: getFinalPrice(selectedPlan),
        payment_status: 'completed'
      })
    }
    
    setShowPaymentModal(false)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      navigate('/dashboard')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Nazaj
        </button>
        <img 
          src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1920&h=600&fit=crop" 
          alt="Car sales" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-lg text-white/80">{t.subtitle}</p>
          </motion.div>
        </div>
      </div>
      
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.paymentSuccess}</h3>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b bg-gray-50">
                <h3 className="text-xl font-bold">{t.payment}</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-500 text-sm">{t.youSelected}</p>
                  <p className="font-semibold text-lg">{selectedPlan.name || selectedPlan.name_sl}</p>
                  {selectedPlan.discount_active && selectedPlan.discount_percent > 0 && (
                    <span className="inline-block mt-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                      -{selectedPlan.discount_percent}% {t.discount}
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">{t.original}</span>
                    <span className="text-gray-400 line-through">€{selectedPlan.price}</span>
                  </div>
                  {selectedPlan.discount_active && selectedPlan.discount_percent > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">{t.discounted}</span>
                      <span className="text-green-600">-€{(selectedPlan.price - getFinalPrice(selectedPlan)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">{t.total}</span>
                    <span className="text-2xl font-bold text-orange-600">€{getFinalPrice(selectedPlan)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700"
                  >
                    {t.pay}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Publishing Packages */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.publishPackages}</h2>
            <p className="text-gray-600">Izberite paket, ki ustreza vasim potrebam</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {packages.publishing?.map((pkg, index) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                const isPopular = pkg.name === 'Premium' || pkg.name_sl === 'Premium'
                const features = getFeatures(pkg)
                
                return (
                  <motion.div 
                    key={pkg.id || index} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-white rounded-3xl overflow-hidden transition-all hover:scale-[1.02] ${
                      isPopular 
                        ? 'border-2 border-orange-500 shadow-2xl shadow-orange-500/20' 
                        : 'border border-gray-200 shadow-lg'
                    }`}
                  >
                    {/* Discount Banner */}
                    {hasDiscount && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-2.5 text-sm font-bold z-10">
                        <span className="flex items-center justify-center gap-2">
                          <TrendingDown className="w-4 h-4" />
                          {pkg.discount_percent}% {t.discount} - Priznajte prihranek €{(pkg.price - getFinalPrice(pkg)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Popular Badge */}
                    {isPopular && !hasDiscount && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-1.5 rounded-b-2xl text-sm font-bold flex items-center gap-1 shadow-lg">
                          <Sparkles className="w-4 h-4" />
                          {t.popular}
                        </div>
                      </div>
                    )}
                    
                    {/* Card Content */}
                    <div className={`p-8 ${isPopular ? 'pt-14' : 'pt-8'} ${isPopular ? 'bg-gradient-to-br from-orange-50 to-white' : ''}`}>
                      {/* Package Name */}
                      <div className="text-center mb-6">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 ${
                          isPopular ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          <Package className={`w-7 h-7 ${isPopular ? 'text-orange-600' : 'text-gray-600'}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{pkg.name || pkg.name_sl}</h3>
                      </div>
                      
                      {/* Price Section */}
                      <div className="text-center mb-6">
                        {hasDiscount ? (
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-center gap-2">
                              <span className="text-5xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                              <span className="text-xl text-gray-400 line-through">€{pkg.price}</span>
                            </div>
                            <p className="text-sm text-gray-500">
                              <span className="text-green-600 font-medium">Prihranek €{(pkg.price - getFinalPrice(pkg)).toFixed(2)}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-center gap-1">
                            <span className={`text-5xl font-bold ${isPopular ? 'text-orange-600' : 'text-gray-900'}`}>€{pkg.price}</span>
                          </div>
                        )}
                        <p className="text-gray-500 mt-1">{t.monthly}</p>
                      </div>
                      
                      {/* Features List */}
                      <div className="mb-8">
                        <p className="text-sm font-semibold text-gray-700 mb-3">{t.features}</p>
                        <ul className="space-y-3">
                          {features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full ${isPopular ? 'bg-orange-100' : 'bg-green-100'} flex items-center justify-center mt-0.5`}>
                                <Check className={`w-3 h-3 ${isPopular ? 'text-orange-600' : 'text-green-600'}`} />
                              </div>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* CTA Button */}
                      <button 
                        onClick={() => handleSelectPlan(pkg)}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${
                          isPopular 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30' 
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {t.select}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
      
      {/* Boost Packages - Private */}
      {showPrivate && packages.boost_private?.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.boostPackages}</h2>
              <p className="text-gray-600">{t.privateBoost}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...packages.boost_private, ...(showBusiness ? packages.boost_business || [] : [])].map((pkg, idx) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                const isBusiness = pkg.type === 'boost_business'
                const features = getFeatures(pkg)
                
                return (
                  <motion.div 
                    key={pkg.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  >
                    {/* Discount */}
                    {hasDiscount && (
                      <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm font-bold z-10">
                        -{pkg.discount_percent}% {t.discount}
                      </div>
                    )}
                    
                    <div className={`p-6 ${hasDiscount ? 'pt-10' : ''}`}>
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${isBusiness ? 'bg-blue-100' : 'bg-orange-100'}`}>
                        <Zap className={`w-6 h-6 ${isBusiness ? 'text-blue-600' : 'text-orange-600'}`} />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{pkg.name || pkg.name_sl}</h3>
                      {isBusiness && <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mb-3">Poslovni</span>}
                      
                      {/* Price */}
                      <div className="mb-4">
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                            <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                          </div>
                        ) : (
                          <span className={`text-3xl font-bold ${isBusiness ? 'text-blue-600' : 'text-orange-600'}`}>€{pkg.price}</span>
                        )}
                        <span className="text-gray-500 ml-1">{t.perDay}</span>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4" />
                        {t.duration}: {pkg.min_days} {pkg.min_days === 1 ? t.day : t.days}
                      </div>
                      
                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      
                      <button 
                        onClick={() => handleSelectPlan(pkg)}
                        className={`w-full py-3 rounded-xl font-bold transition-colors ${
                          isBusiness 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {t.select}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}
      
      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.upgrade}</h2>
          <p className="text-white/80 mb-8">Zacnite prodajati hitreje ze danes</p>
          <button 
            onClick={() => navigate(isAuthenticated ? '/add-car' : '/register')}
            className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-xl"
          >
            {isAuthenticated ? 'Dodajte vozilo' : 'Registrirajte se'}
          </button>
        </div>
      </section>
    </div>
  )
}
