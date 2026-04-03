import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'

const translations = {
  en: {
    title: 'Paketi',
    select: 'Buy',
    payment: 'Payment',
    youSelected: 'You selected:',
    total: 'Total:',
    cardNumber: 'Card number',
    expiry: 'MM/YY',
    cvc: 'CVC',
    cancel: 'Cancel',
    pay: 'Pay',
    paymentSuccess: 'Payment successful!',
    addCar: 'Add Car',
    monthly: 'monthly',
    // Plan features
    featureAds: 'up to 100 ads',
    featurePhotos: '10 photos per ad',
    featureUnlimitedEdit: 'unlimited editing',
    featurePromotion: 'promote all cars',
    featureStats: 'Statistics',
    featureHD: 'HD photos',
    feature360: '360° virtual photos',
    featureComments: 'comments on ads',
    featureUnlimitedAds: 'unlimited ads',
    feature30Photos: '30 photos per ad',
    // Boost plans
    businessExtra: 'Poslovna dodatna ponudba',
    businessExtraSub: 'Vse cene paketov',
    privateExtra: 'Zasebna dodatna ponudba',
    privateExtraSub: 'Vse cene paketov',
    perDay: '/day',
    duration: 'duration of your choice',
    minOrder: 'minimum order 30 days',
    minOrder15: 'minimum order 15 days',
    akcijaSub1: 'akcijska cena',
    akcijaSub2: 'zni�ana cena',
    akcijaSub3: 'WITH FINANCING',
    akcijaSub4: 'ugodna cena',
  },
  sl: {
    title: 'PAKETI',
    select: 'Izberi',
    payment: 'Plačilo paketa',
    youSelected: 'Izbrali ste:',
    total: 'Skupaj:',
    cardNumber: 'Številka kartice',
    expiry: 'MM/LL',
    cvc: 'CVC',
    cancel: 'Prekliči',
    pay: 'Plačaj',
    paymentSuccess: 'Plačilo uspešno!',
    addCar: 'Dodaj vozilo',
    monthly: 'mesečna cena',
    // Plan features
    featureAds: 'objava oglasov do 100',
    featurePhotos: 'fotografije na oglas 10',
    featureUnlimitedEdit: 'neomejeno urejanje vseh oglasov',
    featurePromotion: 'oglaševanje vseh vozil',
    featureStats: 'Statistika',
    featureHD: 'HD slika',
    feature360: 'slika virtuala 360',
    featureComments: 'komentarji na objavah',
    featureUnlimitedAds: 'objava oglasov neomejeno',
    feature30Photos: 'fotografije na oglas 30',
    // Boost plans
    businessExtra: 'TRGOVCI DODATNA PONUDBA',
    businessExtraSub: 'Paket vseh cen na oglasu',
    privateExtra: 'FIZIČNE OSEBE DODATNA PONUDBA',
    privateExtraSub: 'Paket vseh cen na oglasu',
    perDay: '/dan',
    duration: 'rok trajanja po vaši izbiri',
    minOrder: 'minimalno naročilo 30 dni',
    minOrder15: 'minimalno naročilo 15 dni',
    akcijaSub1: 'akcijska cena',
    akcijaSub2: 'znižana cena',
    akcijaSub3: 'CENA S FINANCIRANJEM',
    akcijaSub4: 'UGODNA CENA',
  },
}

const plans = [
  { id: 'osnovni', name: 'Osnovni', price: 34.99, features: [
    { text: 'objava oglasov do 100', included: true },
    { text: 'fotografije na oglas 10', included: true },
    { text: 'neomejeno urejanje vseh oglasov', included: true },
    { text: 'oglaševanje vseh vozil', included: true },
    { text: 'Statistika', included: false },
    { text: 'HD slika', included: false },
    { text: 'slika virtuala 360', included: false },
    { text: 'komentarji na objavah', included: false },
  ]},
  { id: 'premium', name: 'Premium', price: 64.99, features: [
    { text: 'objava oglasov neomejeno', included: true },
    { text: 'fotografije na oglas 30', included: true },
    { text: 'neomejeno urejanje vseh oglasov', included: true },
    { text: 'oglaševanje vseh vozil', included: true },
    { text: 'Statistika', included: true },
    { text: 'HD slika', included: true },
    { text: 'slika virtuala 360', included: true },
    { text: 'komentarji na objavah', included: true },
  ]},
]

const extraPlansBusiness = [
  { id: 'akcija', name: 'Paket vseh cen', price: 0.75, subtitles: ['akcijska cena', 'znižana cena', 'cena s financiranjem', 'ugodna cena'], days: 'rok trajanja po vaši izbiri', color: 'orange', userType: 'business' },
  { id: 'top', name: 'Top izbira', price: 0.65, subtitles: [], days: 'minimalno naročilo 30 dni', color: 'green', userType: 'business' },
  { id: 'skok', name: 'Skok na vrh', price: 0.50, subtitles: [], days: 'minimalno naročilo 30 dni', color: 'blue', userType: 'business' },
]

const extraPlansPrivate = [
  { id: 'akcija_p', name: 'Paket vseh cen', price: 1.50, subtitles: ['akcijska cena', 'znižana cena', 'ugodna cena'], days: 'rok trajanja po vaši izbiri', color: 'orange', userType: 'private' },
  { id: 'top_p', name: 'Top izbira', price: 1.50, subtitles: [], days: 'minimalno naročilo 15 dni', color: 'green', userType: 'private' },
  { id: 'skok_p', name: 'Skok na vrh', price: 1.00, subtitles: [], days: 'minimalno naročilo 15 dni', color: 'blue', userType: 'private' },
]

export function SellPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const { language, setLanguage, t: tFunc } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  // Use translation function - prefer local translations
  const t = (key) => translations[language]?.[key] || key
  
  // Get admin prices if available
  const getAdminPrice = (planId, isBoost = false, userType = 'private') => {
    try {
      const saved = localStorage.getItem('adminPackages')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (isBoost && parsed.boost) {
          const boostPackages = parsed.boost[userType] || parsed.boost.private
          const pkg = boostPackages.find(p => p.id === planId)
          if (pkg) return pkg.price
        } else if (parsed.publishing) {
          const pkg = parsed.publishing.find(p => p.id === planId)
          if (pkg) return pkg.price
        }
      }
    } catch {}
    return null
  }
  
  // Apply admin prices to plans
  const currentPlans = (language === 'en' ? [
    { id: 'osnovni', name: 'Basic', price: 34.99, features: [
      { text: 'up to 100 ads', included: true },
      { text: '10 photos per ad', included: true },
      { text: 'unlimited editing', included: true },
      { text: 'promote all cars', included: true },
      { text: 'Statistics', included: false },
      { text: 'HD photos', included: false },
      { text: '360° virtual photos', included: false },
      { text: 'comments on ads', included: false },
    ]},
    { id: 'premium', name: 'Premium', price: 64.99, features: [
      { text: 'unlimited ads', included: true },
      { text: '30 photos per ad', included: true },
      { text: 'unlimited editing', included: true },
      { text: 'promote all cars', included: true },
      { text: 'Statistics', included: true },
      { text: 'HD photos', included: true },
      { text: '360° virtual photos', included: true },
      { text: 'comments on ads', included: true },
    ]},
  ] : plans).map(plan => {
    const adminPrice = getAdminPrice(plan.id)
    return adminPrice !== null ? { ...plan, price: adminPrice } : plan
  })
  
  const currentExtraBusiness = (language === 'en' ? [
    { id: 'akcija', name: 'All prices', price: 0.75, subtitles: ['discounted price', 'low price', 'with financing', 'best price'], days: 'duration of your choice', color: 'orange', userType: 'business' },
    { id: 'top', name: 'Top choice', price: 0.65, subtitles: [], days: 'minimum order 30 days', color: 'green', userType: 'business' },
    { id: 'skok', name: 'Jump to top', price: 0.50, subtitles: [], days: 'minimum order 30 days', color: 'blue', userType: 'business' },
  ] : extraPlansBusiness).map(plan => {
    const adminPrice = getAdminPrice(plan.id, true, 'business')
    return adminPrice !== null ? { ...plan, price: adminPrice } : plan
  })
  
  const currentExtraPrivate = (language === 'en' ? [
    { id: 'akcija_p', name: 'All prices', price: 1.50, subtitles: ['discounted price', 'low price', 'best price'], days: 'duration of your choice', color: 'orange', userType: 'private' },
    { id: 'top_p', name: 'Top choice', price: 1.50, subtitles: [], days: 'minimum order 15 days', color: 'green', userType: 'private' },
    { id: 'skok_p', name: 'Jump to top', price: 1.00, subtitles: [], days: 'minimum order 15 days', color: 'blue', userType: 'private' },
  ] : extraPlansPrivate).map(plan => {
    const adminPrice = getAdminPrice(plan.id, true, 'private')
    return adminPrice !== null ? { ...plan, price: adminPrice } : plan
  })
  
  // Determine which extra plans to show based on user type
  const userType = user?.userType
  const isLoggedIn = !!user
  
  // Check if business user has active subscription
  const getBusinessSubscription = () => {
    const sub = localStorage.getItem('business_subscription')
    if (!sub) return null
    const parsed = JSON.parse(sub)
    const expiryDate = new Date(parsed.purchasedAt)
    expiryDate.setDate(expiryDate.getDate() + 30)
    if (new Date() > expiryDate) {
      return null
    }
    return parsed
  }
  
  const businessSubscription = isLoggedIn && userType === 'business' ? getBusinessSubscription() : null
  const hasActiveSubscription = !!businessSubscription
  
  // Show business section if logged in as business OR not logged in
  const showBusiness = !isLoggedIn || userType === 'business'
  // Show private section if logged in as private OR not logged in
  const showPrivate = !isLoggedIn || userType === 'private'

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate(`/register?role=seller&package=${plan.id}`)
      return
    }
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handlePayment = () => {
    // Save package or boost to user
    const user = JSON.parse(localStorage.getItem('automarket_user') || '{}')
    
    if (selectedPlan && user.id) {
      // Check if it's a main package (osnovni, premium) or a boost package (akcija, top, etc.)
      const isBoostPackage = ['akcija', 'top', 'skok', 'akcija_p', 'top_p', 'skok_p'].includes(selectedPlan.id)
      
      if (isBoostPackage) {
        // Save boost package to user's boosts
        const userKey = user.email || user.id
        console.log('Saving boost with key:', `automarket_boosts_${userKey}`)
        const existingBoosts = JSON.parse(localStorage.getItem(`automarket_boosts_${userKey}`) || '[]')
        const newBoost = {
          id: selectedPlan.id,
          name: selectedPlan.name,
          price: selectedPlan.price,
          days: selectedPlan.days || 30,
          purchasedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (selectedPlan.days === 'duration of your choice' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          usedOn: null,
          usedAt: null
        }
        localStorage.setItem(`automarket_boosts_${userKey}`, JSON.stringify([...existingBoosts, newBoost]))
      } else {
        // Save main subscription package
        const packageData = {
          packageId: selectedPlan.id,
          planName: selectedPlan.name,
          purchasedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }
        localStorage.setItem(`automarket_package_${user.id}`, JSON.stringify(packageData))
      }
    }
    
    setShowPaymentModal(false)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      navigate('/dashboard')
    }, 2000)
  }

  const getButtonClasses = (color) => {
    const colors = {
      orange: 'bg-orange-500 hover:bg-orange-600',
      green: 'bg-green-500 hover:bg-green-600',
      blue: 'bg-blue-500 hover:bg-blue-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
    }
    return colors[color] || colors.orange
  }
  
  return (
    <div className="min-h-screen">
      <div className="fixed top-16 md:top-20 right-2 md:right-4 z-50">
        <button onClick={() => setLanguage(language === 'sl' ? 'en' : 'sl')} className="bg-white/20 backdrop-blur-sm text-white px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium">
          {language === 'sl' ? '🇸🇮 SL' : '🇬🇧 EN'}
        </button>
      </div>
      
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'sl' ? 'Nazaj' : 'Back'}
        </button>
        <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1920&h=600&fit=crop" alt="Car sales" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2">{t.title}</h1>
          </motion.div>
        </div>
      </div>
      
      {/* Active Subscription Banner for Business Users */}
      {hasActiveSubscription && businessSubscription && (
        <div className="bg-green-50 border-b border-green-200 py-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-green-800 font-medium">
              ✅ Imate aktivno naročnino ({businessSubscription.package})! 
             Objavljajte vozila brezplačno 30 dni.
              <button 
                onClick={() => navigate('/add-car')}
                className="ml-2 text-green-600 underline hover:text-green-800"
              >
                Dodaj vozilo →
              </button>
            </p>
          </div>
        </div>
      )}
      
      <section className="py-8 md:py-16 bg-[#f5f6f8]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {currentPlans.map((plan, index) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full">
                  <div className="p-4 md:p-8">
                    <div className="text-center mb-4 md:mb-6">
                      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">{plan.name}</h2>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl md:text-6xl font-bold text-[#ff6a00]">€{plan.price}</span>
                      </div>
                      <p className="text-gray-500 mt-1">{t.monthly}</p>
                    </div>
                    <ul className="space-y-2 md:space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 md:gap-3 text-sm md:text-base">
                          <span className={feature.included ? 'text-green-500 font-bold text-lg md:text-xl' : 'text-red-500 font-bold text-lg md:text-xl'}>
                            {feature.included ? '✔' : '✕'}
                          </span>
                          <span className={feature.included ? 'text-gray-800' : 'text-gray-400'}>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleSelectPlan(plan)} className="w-full py-4 md:py-4 mt-6 rounded-xl font-bold text-white bg-[#ff6a00] hover:bg-[#ff7f2a] transition-colors text-lg md:text-lg shadow-lg active:scale-95 touch-manipulation min-h-[56px]">
                      {language === 'en' ? 'Buy' : 'Izberi'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {showBusiness && (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{language === 'en' ? 'BUSINESS EXTRA OFFER' : 'TRGOVCI DODATNA PONUDBA'}</h2>
            <p className="text-gray-600">{language === 'en' ? 'All prices packages' : 'Paket vseh cen na oglasu'}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {currentExtraBusiness.map((plan, index) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className={`bg-white rounded-xl overflow-hidden shadow-lg border-2 border-${plan.color}-200`}>
                  <div className={`bg-${plan.color}-50 p-4 text-center border-b border-${plan.color}-200`}>
                    <h3 className={`text-xl font-bold text-${plan.color}-700`}>{plan.name}</h3>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 text-white ${getButtonClasses(plan.color)}`}>PAKET VSEH CEN NA OGLASU</span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                      {plan.subtitles.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {plan.subtitles.map((sub, idx) => (
                            <p key={idx} className="text-xs text-gray-600">{sub}</p>
                          ))}
                        </div>
                      )}
                      <div className="text-5xl font-bold text-[#ff6a00]">€{plan.price}<span className="text-lg text-gray-500">/dan</span></div>
                      <p className="text-xs text-gray-400 mt-2">{plan.days}</p>
                    </div>
                    <button onClick={() => handleSelectPlan(plan)} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 touch-manipulation min-h-[56px] ${getButtonClasses(plan.color)}`}>
                      {language === 'en' ? 'Buy' : 'Izberi'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}
      
      {showPrivate && (
      <section className="py-8 md:py-16 bg-[#f5f6f8]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{language === 'en' ? 'PRIVATE EXTRA OFFER' : 'FIZIČNE OSEBE DODATNA PONUDBA'}</h2>
            <p className="text-gray-600">{language === 'en' ? 'All prices packages' : 'Paket vseh cen na oglasu'}</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {currentExtraPrivate.map((plan, index) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className={`bg-white rounded-xl overflow-hidden shadow-lg border-2 border-${plan.color}-200`}>
                  <div className={`bg-${plan.color}-50 p-4 text-center border-b border-${plan.color}-200`}>
                    <h3 className={`text-xl font-bold text-${plan.color}-700`}>{plan.name}</h3>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 text-white ${getButtonClasses(plan.color)}`}>PAKET VSEH CEN NA OGLASU</span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                      {plan.subtitles.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {plan.subtitles.map((sub, idx) => (
                            <p key={idx} className="text-xs text-gray-600">{sub}</p>
                          ))}
                        </div>
                      )}
                      <div className="text-5xl font-bold text-[#ff6a00]">€{plan.price}<span className="text-lg text-gray-500">/dan</span></div>
                      <p className="text-xs text-gray-400 mt-2">{plan.days}</p>
                    </div>
                    <button onClick={() => handleSelectPlan(plan)} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 touch-manipulation min-h-[56px] ${getButtonClasses(plan.color)}`}>
                      {language === 'en' ? 'Buy' : 'Izberi'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-6">* Paketi so opcionalni. Lahko jih izberete ali preskočite.</p>
        </div>
      </section>
      )}
    </div>
  )
}
