import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, Star, Zap, Package, TrendingDown } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { supabase } from '@/lib/supabase'

const isSl = true

const translations = {
  sl: {
    title: 'PAKETI',
    select: 'Izberi',
    payment: 'Plačilo paketa',
    youSelected: 'Izbrali ste:',
    total: 'Skupaj:',
    cancel: 'Prekliči',
    pay: 'Plačaj',
    paymentSuccess: 'Plačilo uspešno!',
    addCar: 'Dodaj vozilo',
    monthly: 'mesečna cena',
    perDay: '/dan',
    duration: 'rok trajanja po vaši izbiri',
    minOrder: 'minimalno naročilo',
    publishPackages: 'Paketi za objavo',
    boostPackages: 'Paketi za promocijo',
    privateBoost: 'Za zasebne uporabnike',
    businessBoost: 'Za poslovne uporabnike',
    discount: 'Zbritja',
    discounted: 'Znižana cena',
    original: 'Originalna cena',
    popular: 'Priljubljen',
    bestValue: 'Najboljša vrednost',
    day: 'dan',
    days: 'dni',
  }
}

export function SellPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [packages, setPackages] = useState({ publishing: [], boost_private: [], boost_business: [] })
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  const t = translations.sl
  
  // Load packages from Supabase
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('type')
        
        if (data) {
          const grouped = {
            publishing: data.filter(p => p.type === 'publishing'),
            boost_private: data.filter(p => p.type === 'boost_private'),
            boost_business: data.filter(p => p.type === 'boost_business')
          }
          setPackages(grouped)
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
      // Calculate expiry
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (selectedPlan.min_days || 30))
      
      // Insert user_package
      await supabase.from('user_packages').insert({
        user_id: userData.id,
        package_id: selectedPlan.id,
        package_name: selectedPlan.name,
        package_type: selectedPlan.type,
        price_paid: getFinalPrice(selectedPlan),
        expires_at: expiresAt.toISOString(),
        is_active: true
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
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        {/* Back Button */}
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
                </div>
                <div className="flex justify-between items-center py-3 border-t">
                  <span className="font-semibold">{t.total}</span>
                  <span className="text-2xl font-bold text-orange-600">€{getFinalPrice(selectedPlan)}</span>
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{t.publishPackages}</h2>
          <p className="text-gray-600 text-center mb-8">Izberite paket, ki ustreza vašim potrebam</p>
          
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.publishing?.map((pkg, index) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                const isPopular = pkg.name === 'Premium'
                
                return (
                  <motion.div 
                    key={pkg.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-white rounded-2xl overflow-hidden ${isPopular ? 'border-2 border-orange-500 shadow-xl' : 'border border-gray-200 shadow-lg'}`}
                  >
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                          <TrendingDown className="w-4 h-4" />
                          -{pkg.discount_percent}%
                        </div>
                      </div>
                    )}
                    
                    {/* Popular Badge */}
                    {isPopular && !hasDiscount && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                          <Star className="w-4 h-4" />
                          {t.popular}
                        </div>
                      </div>
                    )}
                    
                    {/* Card Header */}
                    <div className={`p-6 text-center ${isPopular ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-gray-50'}`}>
                      <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>{pkg.name}</h3>
                      
                      {/* Price */}
                      <div className="flex items-baseline justify-center gap-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-4xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                            <span className={`text-xl line-through ${isPopular ? 'text-white/70' : 'text-gray-400'}`}>€{pkg.price}</span>
                          </>
                        ) : (
                          <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-orange-600'}`}>€{pkg.price}</span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isPopular ? 'text-white/80' : 'text-gray-500'}`}>{t.monthly}</p>
                      
                      {hasDiscount && (
                        <div className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          {t.discounted}
                        </div>
                      )}
                    </div>
                    
                    {/* Features would go here */}
                    <div className="p-6">
                      <button 
                        onClick={() => handleSelectPlan(pkg)}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all ${
                          isPopular 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700' 
                            : 'bg-orange-500 text-white hover:bg-orange-600'
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
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{t.boostPackages}</h2>
            <p className="text-gray-600 text-center mb-8">{t.privateBoost}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.boost_private?.map((pkg) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                
                return (
                  <motion.div 
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {hasDiscount && (
                      <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm font-bold">
                        -{pkg.discount_percent}% {t.discount}
                      </div>
                    )}
                    
                    <div className="p-6 pt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{pkg.name}</h3>
                      
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-3xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                            <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                          </>
                        ) : (
                          <span className="text-3xl font-bold text-orange-600">€{pkg.price}</span>
                        )}
                        <span className="text-gray-500">{t.perDay}</span>
                      </div>
                      
                      <p className="text-center text-sm text-gray-500 mb-6">
                        {t.minOrder} {pkg.min_days} {pkg.min_days === 1 ? t.day : t.days}
                      </p>
                      
                      <button 
                        onClick={() => handleSelectPlan(pkg)}
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
      {showBusiness && packages.boost_business?.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">{t.boostPackages}</h2>
            <p className="text-gray-600 text-center mb-8">{t.businessBoost}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.boost_business?.map((pkg) => {
                const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                
                return (
                  <motion.div 
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-white rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {hasDiscount && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-2 text-sm font-bold">
                        -{pkg.discount_percent}% {t.discount}
                      </div>
                    )}
                    
                    <div className="p-6 pt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{pkg.name}</h3>
                      
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-3xl font-bold text-red-500">€{getFinalPrice(pkg)}</span>
                            <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                          </>
                        ) : (
                          <span className="text-3xl font-bold text-blue-600">€{pkg.price}</span>
                        )}
                        <span className="text-gray-500">{t.perDay}</span>
                      </div>
                      
                      <p className="text-center text-sm text-gray-500 mb-6">
                        {t.minOrder} {pkg.min_days} {pkg.min_days === 1 ? t.day : t.days}
                      </p>
                      
                      <button 
                        onClick={() => handleSelectPlan(pkg)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
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
