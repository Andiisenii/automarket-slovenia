import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowLeft, Star, Zap, Package, TrendingDown } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

const isSl = true

const translations = {
  sl: {
    title: 'PAKETI',
    select: 'Izberi',
    payment: 'Placilo paketa',
    youSelected: 'Izbrali ste:',
    total: 'Skupaj:',
    cancel: 'Preklici',
    pay: 'Placaj',
    paymentSuccess: 'Placilo uspesno!',
    monthly: 'mesecna cena',
    perDay: '/dan',
    discount: 'Zbitka',
  }
}

// Original publishing packages WITH features (included/excluded)
const PUBLISHING_PACKAGES = [
  { 
    id: 'osnovni', 
    name: 'OSNOVNI', 
    price: 34.99, 
    features: [
      { text: 'Objava do 100 oglasov', included: true },
      { text: '10 fotografij na oglas', included: true },
      { text: 'Neomejeno urejanje oglasov', included: true },
      { text: 'Osnovne funkcije', included: true },
      { text: 'Statistika ogledov', included: false },
      { text: 'HD slike', included: false },
      { text: '360 posnetki', included: false },
      { text: 'Premium uvrstitev', included: false },
    ]
  },
  { 
    id: 'premium', 
    name: 'PREMIUM', 
    price: 64.99, 
    features: [
      { text: 'Neomejena objava oglasov', included: true },
      { text: '30 fotografij na oglas', included: true },
      { text: 'Neomejeno urejanje oglasov', included: true },
      { text: 'Statistika ogledov', included: true },
      { text: 'HD slike', included: true },
      { text: '360 posnetki', included: true },
      { text: 'Premium uvrstitev', included: true },
      { text: 'Komentarji kupcev', included: true },
    ]
  },
]

// Original boost packages - PRIVATE
const BOOST_PRIVATE = [
  { id: 'akcija_p', name: 'Paket vseh cen', price: 1.50, subtitle: 'akcijska cena', days: 'po izbiri', color: 'orange' },
  { id: 'top_p', name: 'Top izbira', price: 1.50, subtitle: '', days: 'min 15 dni', color: 'green' },
  { id: 'skok_p', name: 'Skok na vrh', price: 1.00, subtitle: '', days: 'min 15 dni', color: 'blue' },
]

// Original boost packages - BUSINESS
const BOOST_BUSINESS = [
  { id: 'akcija', name: 'Paket vseh cen', price: 0.75, subtitle: 'akcijska cena', days: 'po izbiri', color: 'orange' },
  { id: 'top', name: 'Top izbira', price: 0.65, subtitle: '', days: 'min 30 dni', color: 'green' },
  { id: 'skok', name: 'Skok na vrh', price: 0.50, subtitle: '', days: 'min 30 dni', color: 'blue' },
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
  
  // Load packages from Supabase first, fallback to hardcoded
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('type')
        
        if (data && data.length > 0) {
          // Group Supabase packages
          const grouped = {
            publishing: data.filter(p => p.type === 'publishing'),
            boost_private: data.filter(p => p.type === 'boost_private'),
            boost_business: data.filter(p => p.type === 'boost_business')
          }
          setPackages(grouped)
        } else {
          // Use hardcoded packages
          setPackages({
            publishing: PUBLISHING_PACKAGES,
            boost_private: BOOST_PRIVATE,
            boost_business: BOOST_BUSINESS
          })
        }
      } catch (err) {
        console.error('Error loading packages:', err)
        setPackages({
          publishing: PUBLISHING_PACKAGES,
          boost_private: BOOST_PRIVATE,
          boost_business: BOOST_BUSINESS
        })
      }
      setLoading(false)
    }
    loadPackages()
  }, [])
  
  const getFinalPrice = (pkg) => {
    if (pkg.discount_active && pkg.discount_percent > 0) {
      return (pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)
    }
    return pkg.price
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
        package_name: selectedPlan.name,
        package_type: selectedPlan.type,
        price_paid: getFinalPrice(selectedPlan),
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      
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
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2">{t.title}</h1>
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
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">{t.payment}</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-500 text-sm">{t.youSelected}</p>
                  <p className="font-semibold text-lg">{selectedPlan.name}</p>
                  {selectedPlan.discount_active && selectedPlan.discount_percent > 0 && (
                    <span className="inline-block mt-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                      -{selectedPlan.discount_percent}% {t.discount}
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  {selectedPlan.discount_active && selectedPlan.discount_percent > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Originalna cena</span>
                        <span className="text-gray-400 line-through">€{selectedPlan.price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">{t.discount}</span>
                        <span className="text-red-600">-€{(selectedPlan.price - getFinalPrice(selectedPlan)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">{t.total}</span>
                        <span className="text-2xl font-bold text-orange-600">€{getFinalPrice(selectedPlan)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{t.total}</span>
                      <span className="text-2xl font-bold text-orange-600">€{selectedPlan.price}</span>
                    </div>
                  )}
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
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600"
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Paketi za objavo</h2>
          
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {packages.publishing?.map((pkg, index) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                
                return (
                  <motion.div 
                    key={pkg.id || index} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
                  >
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="bg-red-500 text-white text-center py-2 text-sm font-bold">
                        -{pkg.discount_percent}% {t.discount}
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{pkg.name}</h3>
                      
                      {/* Price */}
                      <div className="text-center mb-6">
                        {hasDiscount ? (
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-center gap-2">
                              <span className="text-4xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                              <span className="text-xl text-gray-400 line-through">€{pkg.price}</span>
                            </div>
                            <p className="text-sm text-green-600 font-medium">Prihranek €{(pkg.price - getFinalPrice(pkg)).toFixed(2)}</p>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold text-orange-600">€{pkg.price}</span>
                          </div>
                        )}
                        <p className="text-gray-500 text-sm mt-1">{t.monthly}</p>
                      </div>
                      
                      {/* Features with Check/X */}
                      <ul className="space-y-2 mb-6">
                        {(pkg.features || []).map((feature, i) => (
                          <li key={i} className="flex items-center gap-3">
                            {feature.included ? (
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                <X className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button 
                        onClick={() => handleSelectPlan({...pkg, type: 'publishing'})}
                        className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
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
      {packages.boost_private?.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Paketa za promocijo</h2>
            <p className="text-gray-600 text-center mb-8">Za zasebne uporabnike</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.boost_private.map((pkg, index) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                
                return (
                  <motion.div 
                    key={pkg.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
                  >
                    {/* Discount */}
                    {hasDiscount && (
                      <div className="bg-red-500 text-white text-center py-2 text-sm font-bold">
                        -{pkg.discount_percent}% {t.discount}
                      </div>
                    )}
                    
                    <div className={`p-6 ${hasDiscount ? 'pt-8' : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                        {pkg.subtitle && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{pkg.subtitle}</span>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="mb-4">
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                            <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                          </div>
                        ) : (
                          <span className="text-3xl font-bold text-orange-600">€{pkg.price}</span>
                        )}
                        <span className="text-gray-500 ml-1">/dan</span>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>min {pkg.days}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleSelectPlan({...pkg, type: 'boost_private'})}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
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
      
      {/* Boost Packages - Business */}
      {packages.boost_business?.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Paketa za promocijo</h2>
            <p className="text-gray-600 text-center mb-8">Za poslovne uporabnike</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.boost_business.map((pkg, index) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                const borderColor = pkg.color === 'green' ? 'border-green-300' : pkg.color === 'blue' ? 'border-blue-300' : 'border-orange-300'
                const buttonColor = pkg.color === 'green' ? 'bg-green-600 hover:bg-green-700' : pkg.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
                
                return (
                  <motion.div 
                    key={pkg.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`bg-white rounded-2xl border-2 ${borderColor} shadow-lg overflow-hidden`}
                  >
                    {/* Discount */}
                    {hasDiscount && (
                      <div className="bg-red-500 text-white text-center py-2 text-sm font-bold">
                        -{pkg.discount_percent}% {t.discount}
                      </div>
                    )}
                    
                    <div className={`p-6 ${hasDiscount ? 'pt-8' : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className={`w-5 h-5 ${pkg.color === 'green' ? 'text-green-600' : pkg.color === 'blue' ? 'text-blue-600' : 'text-orange-500'}`} />
                        <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                        {pkg.subtitle && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{pkg.subtitle}</span>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="mb-4">
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                            <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                          </div>
                        ) : (
                          <span className={`text-3xl font-bold ${pkg.color === 'green' ? 'text-green-600' : pkg.color === 'blue' ? 'text-blue-600' : 'text-orange-600'}`}>€{pkg.price}</span>
                        )}
                        <span className="text-gray-500 ml-1">/dan</span>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>min {pkg.days}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleSelectPlan({...pkg, type: 'boost_business'})}
                        className={`w-full py-3 text-white rounded-xl font-bold transition-colors ${buttonColor}`}
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
    </div>
  )
}
