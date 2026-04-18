import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Eye, TrendingUp, DollarSign, Car, 
  Settings, CheckCircle, Clock, Edit, Trash2, LogOut, Zap,
  Crown, Package, Calendar, Timer, X, Send, MessageCircle, CheckCircle as CheckIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useAuth } from '@/lib/AuthContext'
import { useCars } from '@/lib/CarContext'
import { useMessages } from '@/lib/MessagesContext'
import { useLanguage } from '@/lib/LanguageContext'
import { carDB } from '@/lib/database'
import { formatPrice, formatNumber, getTimeAgo } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

// Package configurations - IDENTICAL to SellPage
const SUBSCRIPTION_PLANS = [
  { 
    id: 'osnovni', 
    name: 'OSNOVNI', 
    price: 34.99, 
    features: [
      { text: 'Objava do 100 oglasov', included: true },
      { text: '10 fotografij na oglas', included: true },
      { text: 'Neomejeno urejanje vseh oglasov', included: true },
      { text: 'Oglaševanje vseh vozil', included: true },
      { text: 'Statistika', included: false },
      { text: 'HD slike', included: false },
      { text: 'Slika virtual 360', included: false },
      { text: 'Komentarji na objavah', included: false },
    ]},
  { 
    id: 'premium', 
    name: 'PREMIUM', 
    price: 64.99, 
    isPopular: true,
    features: [
      { text: 'Neomejena objava oglasov', included: true },
      { text: '30 fotografij na oglas', included: true },
      { text: 'Neomejeno urejanje vseh oglasov', included: true },
      { text: 'Oglaševanje vseh vozil', included: true },
      { text: 'Statistika', included: true },
      { text: 'HD slike', included: true },
      { text: 'Slika virtual 360', included: true },
      { text: 'Komentarji na objavah', included: true },
    ]},
]

// Boost packages BUSINESS with details (same as SellPage)
const BOOST_PLANS_BUSINESS = [
  { 
    id: 'akcija', 
    name: 'Paket vseh cen', 
    price: 0.75, 
    subtitle: 'akcijska cena', 
    days: 30, 
    color: 'orange',
    features: [
      { text: 'akcijska cena', included: true },
      { text: 'cena s financiranjem', included: true },
      { text: 'znizana cena', included: true },
      { text: 'ugodna cena', included: true },
    ]
  },
  { 
    id: 'top', 
    name: 'Top izbira', 
    price: 0.65, 
    subtitle: '', 
    days: 30, 
    color: 'green',
    features: [
      { text: 'objava na prvih straneh', included: true },
      { text: 'večja vidljivost vozila', included: true },
      { text: 'hitrejša prodaja vozila', included: true },
      { text: 'zlatorumena vidna oznaka', included: true },
    ]
  },
  { 
    id: 'skok', 
    name: 'Skok na vrh', 
    price: 0.50, 
    subtitle: '', 
    days: 30, 
    color: 'blue',
    features: [
      { text: 'takojšen skok oglasa na vrh', included: true },
      { text: 'enostavna promocija', included: true },
      { text: 'skok med prvih 50 oglasov', included: true },
      { text: 'možnost promoviranja starega oglasa', included: true },
    ]
  },
]

// Boost packages PRIVATE with details (same as SellPage)
const BOOST_PLANS_PRIVATE = [
  { 
    id: 'akcija_p', 
    name: 'Paket vseh cen', 
    price: 1.50, 
    subtitle: 'akcijska cena', 
    days: 15, 
    color: 'orange',
    features: [
      { text: 'akcijska cena', included: true },
      { text: 'cena s financiranjem (samo za avtosalone)', included: true },
      { text: 'znizana cena', included: true },
      { text: 'ugodna cena', included: true },
    ]
  },
  { 
    id: 'top_p', 
    name: 'Top izbira', 
    price: 1.50, 
    subtitle: '', 
    days: 15, 
    color: 'green',
    features: [
      { text: 'objava na prvih straneh', included: true },
      { text: 'večja vidljivost vozila', included: true },
      { text: 'hitrejša prodaja vozila', included: true },
      { text: 'zlatorumena vidna oznaka', included: true },
    ]
  },
  { 
    id: 'skok_p', 
    name: 'Skok na vrh', 
    price: 1.00, 
    subtitle: '', 
    days: 15, 
    color: 'blue',
    features: [
      { text: 'takojšen skok oglasa na vrh', included: true },
      { text: 'enostavna promocija', included: true },
      { text: 'skok med prvih 50 oglasov', included: true },
      { text: 'možnost promoviranja starega oglasa', included: true },
    ]
  },
]

function SettingsTab({ user, updateProfile }) {
  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || '', username: user?.username || '', email: user?.email || '',
    phone: user?.phone || '', address: user?.address || '', city: user?.city || '',
    hasPhone: user?.has_phone !== 0, hasWhatsapp: user?.has_whatsapp === 1, hasViber: user?.has_viber === 1,
    photo: user?.profile_photo || user?.photo || '',
  })
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || user?.photo || '')
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
        setSettingsForm({ ...settingsForm, photo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSaveSettings = async () => { 
    // Prepare data for API - include contact options
    const profileData = {
      name: settingsForm.name,
      username: settingsForm.username,
      phone: settingsForm.phone,
      profile_photo: settingsForm.photo,
      hasPhone: settingsForm.hasPhone ? 1 : 0,
      hasWhatsapp: settingsForm.hasWhatsapp ? 1 : 0,
      hasViber: settingsForm.hasViber ? 1 : 0,
    }
    
    console.log('Saving profile:', profileData)
    
    const result = await updateProfile(profileData)
    
    console.log('Save result:', result)
    
    if (result && (result.user || result.success)) {
      alert('✅ Nastavitve shranjene!')
    } else {
      alert('❌ Napaka pri shranjevanju')
    }
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Nastavitve računa</h3>
      <div className="space-y-6">
        {/* Profile Photo */}
        <div className="flex items-center gap-6">
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-gray-400">{settingsForm.name?.charAt(0) || '?'}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profilna slika</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:cursor-pointer" />
            <p className="text-xs text-gray-500 mt-1">JPG, PNG ali GIF. Max 2MB.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ime in priimek</label>
            <input type="text" value={settingsForm.name} onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uporabniško ime</label>
            <input type="text" value={settingsForm.username} onChange={(e) => setSettingsForm({...settingsForm, username: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={settingsForm.username} onChange={(e) => setSettingsForm({...settingsForm, username: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" value={settingsForm.phone} onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Možnosti kontakta</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settingsForm.hasPhone} onChange={(e) => setSettingsForm({...settingsForm, hasPhone: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              <span>Telefonski klici</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settingsForm.hasWhatsapp} onChange={(e) => setSettingsForm({...settingsForm, hasWhatsapp: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              <span>WhatsApp</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settingsForm.hasViber} onChange={(e) => setSettingsForm({...settingsForm, hasViber: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              <span>Viber</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="bg-orange-500 hover:bg-orange-600">Shrani spremembe</Button>
        </div>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useAuth()
  const { myListings, deleteCar, updateCar, refreshCars } = useCars()
  const { messages } = useMessages()
  const { language, setLanguage } = useLanguage()
  const isSl = language === 'sl'
  
  const getUserPackage = () => {
    if (!user) return null
    const saved = localStorage.getItem(`automarket_package_${user.id}`)
    return saved ? JSON.parse(saved) : null
  }
  
  // Get all purchased boost packages
  const getPurchasedBoosts = () => {
    if (!user || !user.id) return []
    const key = `automarket_boosts_${user.email || user.id}`
    const saved = localStorage.getItem(key)
    const boosts = saved ? JSON.parse(saved) : []
    console.log('getPurchasedBoosts called, user:', user.email || user.id, 'boosts:', boosts)
    return boosts
  }
  
  // Handle package cancellation
  const handleCancelPackage = () => {
    if (!userPackage || !confirm('Ali ste prepričani, da želite preklicati paket?')) return
    
    const updatedPackage = {
      ...userPackage,
      cancelled: true,
      cancelledAt: new Date().toISOString()
    }
    
    localStorage.setItem(`automarket_package_${user.id}`, JSON.stringify(updatedPackage))
    setUserPackage(updatedPackage)
    alert('Paket je bil preklican. Še vedno bo veljaven do ' + new Date(userPackage.expiresAt).toLocaleDateString('sl-SI'))
  }
  
  const [userPackage, setUserPackage] = useState(getUserPackage)
  const [purchasedBoosts, setPurchasedBoosts] = useState(getPurchasedBoosts())
  const [supabasePackages, setSupabasePackages] = useState([])
  
  // Load packages from Supabase for discount info
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const { data } = await supabase.from('packages').select('*').eq('is_active', true)
        if (data) {
          setSupabasePackages(data)
        }
      } catch (err) {
        console.error('Error loading packages:', err)
      }
    }
    loadPackages()
  }, [])
  
  // Refresh data when user changes or on mount
  useEffect(() => {
    setUserPackage(getUserPackage())
    setPurchasedBoosts(getPurchasedBoosts())
  }, [user?.id])
  const [activeTab, setActiveTab] = useState('overview')
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [showSoldModal, setShowSoldModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showCarSelectModal, setShowCarSelectModal] = useState(false)
  const [selectedCarForPromo, setSelectedCarForPromo] = useState(null)
  const [selectedCar, setSelectedCar] = useState(null)
  const [selectedBoost, setSelectedBoost] = useState(null)
  const [paymentStep, setPaymentStep] = useState('select')
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [replyText, setReplyText] = useState({})
  const [soldFeedback, setSoldFeedback] = useState({ soldWhere: '', comment: '' })
  
  const isPremium = userPackage?.packageId === 'premium' && new Date(userPackage?.expiresAt) > new Date()
  const hasSubscription = userPackage?.packageId && new Date(userPackage?.expiresAt) > new Date()
  const isBusiness = user?.userType === 'business'
  
  // Get package with discount info from Supabase
  const getPackageWithDiscount = () => {
    if (!userPackage || !supabasePackages.length) return userPackage
    const pkg = supabasePackages.find(p => p.name === userPackage.packageName)
    if (pkg && pkg.discount_active && pkg.discount_percent > 0) {
      return {
        ...userPackage,
        originalPrice: pkg.price,
        discountedPrice: pkg.price * (1 - pkg.discount_percent / 100),
        discountPercent: pkg.discount_percent
      }
    }
    return userPackage
  }
  const packageWithDiscount = getPackageWithDiscount()
  
  // Business promotions - support multiple promotions
  const getBusinessPromotions = () => {
    if (!user || !isBusiness) return []
    const saved = localStorage.getItem(`automarket_promotions_${user.id}`)
    if (!saved) return []
    const promos = JSON.parse(saved)
    // Return only valid (not expired) promotions
    return promos.filter(promo => new Date(promo.expiresAt) > new Date())
  }
  
  const businessPromotions = getBusinessPromotions()
  // Use first available promotion for simple cases
  const businessPromotion = businessPromotions.find(p => !p.activeOnCar) || businessPromotions[0]
  const listings = myListings.filter(l => l.status !== 'sold')
  const soldCars = myListings.filter(l => l.status === 'sold')
  const totalViews = listings.reduce((acc, l) => acc + (l.views || 0), 0)
  const userMessages = messages.length > 0 ? messages : []
  
  // Get boost plans based on user type
  const boostPlans = isBusiness ? BOOST_PLANS_BUSINESS : BOOST_PLANS_PRIVATE
  
  const stats = [
    { label: 'Aktivne Objave', value: listings.length.toString(), icon: Car, color: 'bg-blue-500' },
    { label: 'Skupaj Ogledov', value: formatNumber(totalViews), icon: Eye, color: 'bg-green-500' },
    { label: 'Sporočila', value: userMessages.length.toString(), icon: MessageCircle, color: 'bg-purple-500' },
    { label: 'Prodane', value: soldCars.length.toString(), icon: CheckCircle, color: 'bg-emerald-500' },
  ]
  
  const premiumStats = [
    { label: 'Povprečna cena', value: listings.length > 0 ? formatPrice(listings.reduce((a, b) => a + b.price, 0) / listings.length) : '€0', icon: DollarSign },
    { label: 'Največ ogledov', value: listings.length > 0 ? formatNumber(Math.max(...listings.map(l => l.views || 0), 0)) : '0', icon: TrendingUp },
  ]
  
  const handleLogout = () => { logout(); navigate('/') }
  
  const handleSelectPackage = (planId) => { 
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    setSelectedBoost(plan)
    setPaymentStep('payment') 
  }
  
  const handleSelectBoost = (boostId) => {
    const boost = boostPlans.find(b => b.id === boostId)
    setSelectedBoost(boost)
    setPaymentStep('payment')
  }
  
  const handlePackagePayment = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) { alert('Izpolnite podatke kartice'); return }
    const newPackage = { duration: selectedBoost.duration || 30,  
      id: Date.now(),
      packageId: selectedBoost.id, 
      activatedAt: new Date().toISOString(), 
      expiresAt: new Date(Date.now() + (selectedBoost.duration || 30) * 24 * 60 * 60 * 1000).toISOString(), 
      price: selectedBoost.price,
      purchasedAt: new Date().toISOString(),
    }
    // Save to user's individual storage
    localStorage.setItem(`automarket_package_${user.id}`, JSON.stringify(newPackage))
    setUserPackage(newPackage)
    
    // Also save to admin purchases for tracking
    const adminPurchases = JSON.parse(localStorage.getItem('adminPurchases') || '[]')
    adminPurchases.push({
      id: Date.now(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      packageId: selectedBoost.id,
      packageName: selectedBoost.name,
      price: selectedBoost.price,
      days: selectedBoost.duration,
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + selectedBoost.duration * 24 * 60 * 60 * 1000).toISOString(),
    })
    localStorage.setItem('adminPurchases', JSON.stringify(adminPurchases))
    
    setPaymentStep('success')
    setTimeout(() => { setShowPackageModal(false); setPaymentStep('select'); setCardDetails({ number: '', expiry: '', cvc: '', name: '' }) }, 1500)
  }
  
  const handleMarkAsSold = (car) => { setSelectedCar(car); setSoldFeedback({ soldWhere: '', comment: '' }); setShowSoldModal(true) }
  
  const confirmSold = () => {
    if (!soldFeedback.soldWhere) { alert('Izberite, kje ste prodali avto'); return }
    updateCar(selectedCar.id, { status: 'sold', soldAt: new Date().toISOString(), soldWhere: soldFeedback.soldWhere, soldComment: soldFeedback.comment })
    setShowSoldModal(false)
  }
  
  const handleBoost = (car) => { setSelectedCar(car); setSelectedBoost(null); setPaymentStep('select'); setShowBoostModal(true) }
  
  // Toggle boost on/off for users
  const handleToggleBoost = (car) => {
    // Check if user has any valid package or promotion
    const activePromos = getBusinessPromotions().filter(p => new Date(p.expiresAt) > new Date())
    const hasValidPackage = userPackage && new Date(userPackage.expiresAt) > new Date()
    const hasValidPromo = activePromos.length > 0
    
    // Check if this specific car has a valid promo
    const carHasValidPromo = activePromos.some(p => p.activeOnCar === car.id)
    const carHasValidUntil = car.promotedUntil && new Date(car.promotedUntil) > new Date()
    
    if (!car.promoted && !hasValidPackage && !hasValidPromo && !carHasValidPromo && !carHasValidUntil) {
      // No valid package or promotion, ask to buy one
      alert('Nimate aktivnega paketa. Kupite paket za promoviranje!')
      setSelectedCar(car)
      setShowBoostModal(true)
      return
    }
    
    // Check if we can toggle off
    const newStatus = !car.promoted
    
    // Get the promotion info
    const promoInfo = activePromos.find(p => p.activeOnCar === car.id) || activePromos[0]
    
    updateCar(car.id, {
      promoted: newStatus,
      hasBoost: newStatus && (hasValidPackage || hasValidPromo || carHasValidPromo || carHasValidUntil),
      boost_package: newStatus ? (promoInfo?.id || userPackage?.packageId || car.boostPackage || 'premium') : null,
      promotedUntil: newStatus ? (promoInfo?.expiresAt || car.promotedUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]) : null,
    })
    
    // Refresh listings
    setTimeout(() => {
      refreshCars()
    }, 100)
  }
  
  const handleBoostPayment = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) { alert('Izpolnite podatke kartice'); return }
    setPaymentStep('success')
    const days = selectedBoost?.selectedDays || 30
    const totalCost = (selectedBoost?.price || 0) * days
    
    console.log('handleBoostPayment called, user:', user?.email || user?.id, 'selectedCar:', selectedCar, 'selectedBoost:', selectedBoost)
    
    setTimeout(() => {
      // Save boost to purchased boosts list (works even without selected car)
      const userKey = user?.email || user?.id
      const existingBoosts = JSON.parse(localStorage.getItem(`automarket_boosts_${userKey}`) || '[]')
      
      const boostData = {
        id: selectedBoost?.id || 'boost_' + Date.now(),
        name: selectedBoost?.name || 'Boost',
        price: selectedBoost?.price || totalCost,
        days: days,
        purchasedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
        usedOn: selectedCar?.title || null,
        usedAt: selectedCar ? new Date().toISOString() : null,
        carId: selectedCar?.id || null,
        carTitle: selectedCar?.title || null
      }
      
      console.log('Saving boost to:', `automarket_boosts_${userKey}`, boostData)
      existingBoosts.push(boostData)
      localStorage.setItem(`automarket_boosts_${userKey}`, JSON.stringify(existingBoosts))
      setPurchasedBoosts(existingBoosts)
      
      // If selected car, apply boost directly
      if (selectedCar && selectedBoost) { 
        updateCar(selectedCar.id, { 
          hasBoost: true, 
          boostSpent: (selectedCar.boostSpent || 0) + totalCost, 
          promoted: true, 
          promotedUntil: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          boostDays: days,
          boostPricePerDay: selectedBoost.price,
          boostPackage: selectedBoost.id
        }) 
      }
      setShowBoostModal(false); setPaymentStep('select'); setSelectedBoost(null); setCardDetails({ number: '', expiry: '', cvc: '', name: '' })
      // Refresh listings
      refreshCars()
    }, 1500)
  }
  
  const handleDelete = (id) => { if (window.confirm(isSl ? 'Izbrisati to objavo?' : 'Delete this listing?')) { deleteCar(id); refreshCars() 
    } 
  }
  
  // Activate boost on selected car - shows selection modal
  const activateBoostOnCar = (boost) => {
    setSelectedBoost(boost)
    setShowCarSelectModal(true)
  }
  
  // Deactivate boost from car
  const deactivateBoost = (boostIdx) => {
    if (!window.confirm(isSl ? 'Deaktivizoni këtë promocije?' : 'Deactivate this promotion?')) return
    
    const userKey = user?.email || user?.id
    const updatedBoosts = [...purchasedBoosts]
    const boost = updatedBoosts[boostIdx]
    
    // Remove from car if it was active
    if (boost.carId) {
      const car = listings.find(c => c.id === boost.carId)
      if (car) {
        updateCar(car.id, { 
          promoted: false, 
          hasBoost: false 
        })
      }
    }
    
    // Update boost to unused
    updatedBoosts[boostIdx] = {
      ...boost,
      usedOn: null,
      usedAt: null,
      carId: null,
      carTitle: null
    }
    
    localStorage.setItem(`automarket_boosts_${userKey}`, JSON.stringify(updatedBoosts))
    setPurchasedBoosts(updatedBoosts)
    refreshCars()
    alert(isSl ? 'Promocija u deaktivizua!' : 'Promotion deactivated!')
  }
  
  // Handle applying boost to selected car (from modal)
  const handleApplyBoostToCar = (car) => {
    const userKey = user?.email || user?.id
    const updatedBoosts = purchasedBoosts.map((b, idx) => {
      if (b === selectedBoost) {
        return {
          ...b,
          usedOn: car.title,
          usedAt: new Date().toISOString(),
          carId: car.id,
          carTitle: car.title
        }
      }
      return b
    })
    
    localStorage.setItem(`automarket_boosts_${userKey}`, JSON.stringify(updatedBoosts))
    setPurchasedBoosts(updatedBoosts)
    
    // Update car as promoted
    updateCar(car.id, { 
      hasBoost: true, 
      promoted: true, 
      promotedUntil: selectedBoost?.expiresAt?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      boostPackage: selectedBoost?.id,
      boostDays: selectedBoost?.days
    })
    
    setShowCarSelectModal(false)
    setSelectedBoost(null)
    refreshCars()
    alert(isSl ? `Promocija u aktivizua në ${car.title}!` : `Promotion activated on ${car.title}!`)
  }
  
  const handleReply = (msgId) => { 
    if (replyText[msgId]?.trim()) {
      // Update in user messages
      const userMessages = JSON.parse(localStorage.getItem('automarket_messages') || '[]')
      const updatedUserMessages = userMessages.map(m => 
        m.id === msgId ? { ...m, reply: replyText[msgId], repliedAt: new Date().toISOString() } : m
      )
      localStorage.setItem('automarket_messages', JSON.stringify(updatedUserMessages))
      
      // Also save to admin messages
      const adminMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]')
      adminMessages.push({
        id: Date.now(),
        fromUserId: user?.id,
        fromUserName: user?.name,
        name: user?.name,
        email: user?.email,
        comment: replyText[msgId],
        sentAt: new Date().toISOString(),
        reply: replyText[msgId],
        repliedAt: new Date().toISOString()
      })
      localStorage.setItem('adminMessages', JSON.stringify(adminMessages))
      
      alert(`Odgovor poslan`)
      setReplyText({ ...replyText, [msgId]: '' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-gray-300">Dobrodošli, {user?.name}</p>
              <div className="flex items-center gap-2 mt-2">
                {/* User Type Badge */}
                {isBusiness ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                    🏢 Biznis
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                    👤 Zasebno
                  </span>
                )}
                {/* Package Badge */}
                {/* Package Status */}
                {hasSubscription ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                    <Package className="w-4 h-4" /> {packageWithDiscount?.packageName || 'Aktivno'}
                    {packageWithDiscount?.discountPercent && (
                      <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs">-{packageWithDiscount.discountPercent}%</span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
                    <Package className="w-4 h-4" /> Brez paketa
                  </span>
                )}
                {userPackage && <span className="text-xs text-gray-400">Velja do: {new Date(userPackage.expiresAt).toLocaleDateString('sl-SI')}</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/cars"><Button className="bg-orange-500 hover:bg-orange-600 border-0 text-sm"><Car className="w-4 h-4 mr-1" />Browse</Button></Link>
              <Link to="/add-car"><Button className="bg-orange-500 hover:bg-orange-600 border-0 text-sm"><Plus className="w-4 h-4 mr-1" />Dodaj</Button></Link>
              <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10 p-2"><LogOut className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 hover:shadow-lg"><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500 mb-1">{stat.label}</p><p className="text-xl font-bold">{stat.value}</p></div><div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}><stat.icon className="w-5 h-5 text-white" /></div></div></Card>
            </motion.div>
          ))}
        </div>
        
        {/* Premium Stats */}
        {isPremium && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {premiumStats.map((stat, i) => (
              <Card key={stat.label} className="p-4 border-2 border-orange-100 bg-orange-50/50">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><stat.icon className="w-5 h-5 text-orange-600" /></div><div><p className="text-xs text-orange-600/70">{stat.label}</p><p className="text-lg font-bold text-orange-900">{stat.value}</p></div></div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Package & Boosts Status Banner - REMOVED - now only in Tabs */}
        
        {/* Language Switcher - Added to header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">{isSl ? 'Jezik:' : 'Language:'}</span>
          <button 
            onClick={() => setLanguage('sl')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${language === 'sl' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            SL
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${language === 'en' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            EN
          </button>
        </div>
        
        {/* Removed Promocije in paketi banner - now in Tab */}
        
        {/* Tabs - Mobile Friendly */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 shadow-sm border overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: isSl ? 'Moje Objave' : 'My Listings', icon: Car },
            { id: 'messages', label: isSl ? 'Sporočila' : 'Messages', icon: MessageCircle },
            { id: 'sold', label: isSl ? 'Prodane' : 'Sold', icon: CheckIcon },
            { id: 'package', label: isSl ? 'Paket' : 'Package', icon: Package },
            { id: 'promo', label: isSl ? 'Promocije' : 'Promotions', icon: Zap },
            { id: 'settings', label: isSl ? 'Nastavitve' : 'Settings', icon: Settings }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Business Promotions Banner */}
        {isBusiness && businessPromotions.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Aktivne promocije!</h3>
                  <p className="text-sm text-green-600">
                    Imate {businessPromotions.length} aktivn{businessPromotions.length === 1 ? 'o' : 'e'} promocij{businessPromotions.length === 1 ? 'o' : 'e'}
                  </p>
                </div>
              </div>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => {
                  setSelectedCarForPromo(null)
                  setShowCarSelectModal(true)
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Upravljaj promocije
              </Button>
            </div>
            
            {/* List of active promotions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              {businessPromotions.map((promo, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{promo.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${promo.activeOnCar ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {promo.activeOnCar ? 'Aktivno' : 'Neaktivno'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {promo.days} dni • Do: {new Date(promo.expiresAt).toLocaleDateString('sl-SI')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {listings.length > 0 ? listings.map((car) => (
              <motion.div key={car.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-48 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={car.images?.[0] || car.image || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400'} alt={car.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div><h3 className="font-semibold text-gray-900 text-lg">{car.title}</h3><p className="text-gray-500 text-sm">{car.year} • {car.mileage?.toLocaleString()} km • {car.fuelType}</p></div>
                      <div className="text-right"><p className="text-xl font-bold text-orange-600">{formatPrice(car.price)}</p><p className="text-xs text-gray-500">{getTimeAgo(car.createdAt)}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <span className="flex items-center gap-1 text-sm text-gray-600"><Eye className="w-4 h-4" />{formatNumber(car.views || 0)} ogledov</span>
                      {car.promoted && <span className="flex items-center gap-1 text-sm text-orange-600"><Zap className="w-4 h-4" />Promovirano</span>}
                      {car.hasBoost && isBusiness && (
                        <button 
                          onClick={() => handleToggleBoost(car)}
                          className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${car.promoted ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
                        >
                          {car.promoted ? '✓ Aktivno' : '○ Neaktivno'}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link to={`/cars/${car.id}`}><Button variant="secondary" size="sm"><Eye className="w-4 h-4 mr-1" />Ogled</Button></Link>
                      <Link to={`/add-car?edit=${car.id}`}><Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" />Uredi</Button></Link>
                      <Button variant="outline" size="sm" onClick={() => handleBoost(car)}><Zap className="w-4 h-4 mr-1" />Promoviraj</Button>
                      <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleMarkAsSold(car)}><CheckCircle className="w-4 h-4 mr-1" />Prodano</Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDelete(car.id)}><Trash2 className="w-4 h-4 mr-1" />Izbriši</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <Card className="p-12 text-center"><Car className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Nobene objave</h3><Link to="/add-car"><Button className="bg-orange-500"><Plus className="w-4 h-4 mr-2" />Dodaj avto</Button></Link></Card>
            )}
          </div>
        )}
        
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {userMessages.length > 0 ? userMessages.map((msg) => (
              <Card key={msg.id} className={`p-4 ${msg.isFromAdmin ? 'border-l-4 border-l-orange-500 bg-orange-50/50' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                    {msg.isFromAdmin ? 'A' : (msg.fromUserName?.charAt(0) || 'U')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{msg.isFromAdmin ? (isSl ? 'Admin' : 'Admin') : msg.fromUserName}</h4>
                        <p className="text-xs text-gray-500">{getTimeAgo(msg.timestamp || msg.sentAt)}</p>
                      </div>
                      {!msg.read && <Badge variant="primary">Novo</Badge>}
                    </div>
                    <p className="text-gray-600 mt-2">{msg.text || msg.comment || 'No message'}</p>
                    {msg.carTitle && <Link to={`/cars/${msg.carId}`} className="text-sm text-orange-600 hover:underline mt-2 inline-block">{msg.carTitle}</Link>}
                    <div className="flex gap-2 mt-3">
                      <input type="text" placeholder="Odgovori..." value={replyText[msg.id] || ''} onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      <Button onClick={() => handleReply(msg.id)}><Send className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            )) : (
              <Card className="p-12 text-center"><MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Nobenih sporočil</h3></Card>
            )}
          </div>
        )}
        
        {/* Sold Tab */}
        {activeTab === 'sold' && (
          <div className="space-y-4">
            {soldCars.length > 0 ? soldCars.map((car) => (
              <Card key={car.id} className="p-4 border-l-4 border-l-green-500 bg-green-50/50">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-24 bg-gray-100 rounded-xl overflow-hidden"><img src={car.images?.[0] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400'} alt={car.title} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{car.title}</h3><Badge variant="success">Prodano</Badge></div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{formatPrice(car.price)}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{car.soldAt ? new Date(car.soldAt).toLocaleDateString('sl-SI') : 'N/A'}</span>
                      {car.soldWhere && <span>{car.soldWhere === 'website' ? 'Splet' : car.soldWhere === 'private' ? 'Zasebno' : car.soldWhere}</span>}
                    </div>
                    {car.soldComment && <p className="text-sm text-gray-500 mt-2 italic">"{car.soldComment}"</p>}
                  </div>
                </div>
              </Card>
            )) : (
              <Card className="p-12 text-center"><CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Nobenih prodanih</h3></Card>
            )}
          </div>
        )}
        
        {/* Package Tab */}
        {activeTab === 'package' && (
          <div className="space-y-6">
            {/* Current Package */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{isSl ? 'Trenutni paket' : 'Current Package'}</h3>
              {userPackage ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPremium ? 'bg-orange-100' : 'bg-gray-200'}`}>
                        {isPremium ? <Crown className="w-6 h-6 text-orange-600" /> : <Package className="w-6 h-6 text-gray-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{isPremium ? 'Premium' : 'Osnovni'}</h4>
                        <p className="text-sm text-gray-500">{isSl ? 'Aktiviran:' : 'Activated:'} {userPackage.activatedAt ? new Date(userPackage.activatedAt).toLocaleDateString('sl-SI') : '-'}</p>
                      </div>
                    </div>
                    <Badge variant={isPremium ? 'primary' : 'secondary'}>{isPremium ? 'Premium' : 'Osnovni'}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Timer className="w-4 h-4 text-gray-500" />
                    <span>{isSl ? 'Velja do:' : 'Valid until:'} <strong>{userPackage.expiresAt ? new Date(userPackage.expiresAt).toLocaleDateString('sl-SI') : '-'}</strong></span>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {!isPremium && (
                      <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => { setSelectedBoost(SUBSCRIPTION_PLANS[1]); setPaymentStep('payment'); setShowPackageModal(true) }}>
                        <Crown className="w-4 h-4 mr-2" />
                        {isSl ? 'Nadgradite na Premium' : 'Upgrade to Premium'}
                      </Button>
                    )}
                    <Button variant="outline" className="border-red-300 text-red-700" onClick={handleCancelPackage}>
                      {isSl ? 'Prekliči paket' : 'Cancel package'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">{isSl ? 'Nimate aktivno paketo' : 'No active package'}</p>
                  <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate('/sell')}>
                    <Package className="w-4 h-4 mr-2" />
                    {isSl ? 'Blej paketen' : 'Buy Package'}
                  </Button>
                </div>
              )}
            </Card>
            
            {/* Package Plans */}
            {(!userPackage || !isPremium) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUBSCRIPTION_PLANS.map((pkg) => (
                  <Card key={pkg.id} className={`p-6 cursor-pointer transition-all ${pkg.id === 'premium' ? 'border-2 border-orange-500 ring-2 ring-orange-100' : 'hover:shadow-md'}`} onClick={() => handleSelectPackage(pkg.id)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pkg.id === 'premium' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          {pkg.id === 'premium' ? <Crown className="w-5 h-5 text-orange-600" /> : <Package className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div><h4 className="font-semibold">{pkg.name}</h4><p className="text-xs text-gray-500">30 {isSl ? 'dni' : 'days'}</p></div>
                      </div><span className="text-2xl font-bold">€{pkg.price}</span>
                    </div>
                    <ul className="space-y-2">
                      {pkg.features?.map((f, idx) => (
                        <li key={idx} className={`flex items-center gap-2 text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {f.included ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300" />
                          )}
                          {f.text}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Promocije Tab - Boost Packages */}
        {activeTab === 'promo' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{isSl ? 'Moje promocije' : 'My Promotions'}</h3>
              
              {/* No promotions message */}
              {purchasedBoosts.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">{isSl ? 'Nimate promocije të blera' : 'You have no promotions purchased'}</p>
                  <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => { setSelectedBoost(null); setPaymentStep('select'); setShowBoostModal(true) }}>
                    {isSl ? 'Bli promocije të reja' : 'Buy new promotions'}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Active Promotions - Not Used */}
                  {purchasedBoosts.filter(b => !b.usedOn).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">{isSl ? 'Aktive (të gatshme për aktivizim)' : 'Active (ready to activate)'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {purchasedBoosts.filter(b => !b.usedOn).map((boost, idx) => (
                          <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{boost.name}</span>
                              <span className="text-sm text-green-600">{boost.days} {isSl ? 'dni' : 'days'}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{isSl ? 'E bleme:' : 'Purchased:'} {new Date(boost.purchasedAt).toLocaleDateString()}</p>
                            {listings.length > 0 ? (
                              <Button 
                                size="sm" 
                                className="w-full bg-green-500 hover:bg-green-600"
                                onClick={() => activateBoostOnCar(boost)}
                              >
                                {isSl ? 'Aktivizo' : 'Activate'}
                              </Button>
                            ) : (
                              <p className="text-xs text-orange-500">{isSl ? 'Shtoni makine për të aktivizuar' : 'Add car to activate'}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Used Promotions - Can deactivate */}
                  {purchasedBoosts.filter(b => b.usedOn).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">{isSl ? 'Në përdorim' : 'In Use'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {purchasedBoosts.filter(b => b.usedOn).map((boost, idx) => (
                          <div key={idx} className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{boost.name}</span>
                              <span className="text-sm text-orange-600">{boost.days} {isSl ? 'dni' : 'days'}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{isSl ? 'Aktive në:' : 'Active on:'} <strong>{boost.usedOn}</strong></p>
                            <p className="text-xs text-gray-500 mb-2">{isSl ? 'Derë:' : 'Until:'} {boost.expiresAt ? new Date(boost.expiresAt).toLocaleDateString() : '-'}</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 border-orange-300 text-orange-700"
                                onClick={() => activateBoostOnCar(boost)}
                              >
                                {isSl ? 'Ndërro' : 'Change'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 border-red-300 text-red-700"
                                onClick={() => deactivateBoost(idx)}
                              >
                                {isSl ? 'Deaktivizo' : 'Deactivate'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Buy More Button */}
              <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4" onClick={() => { setSelectedBoost(null); setPaymentStep('select'); setShowBoostModal(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                {isSl ? 'Bli promocije të reja' : 'Buy new promotions'}
              </Button>
            </Card>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && <SettingsTab user={user} updateProfile={updateProfile} />}
      </div>
      
      {/* Sold Modal */}
      <AnimatePresence>
        {showSoldModal && selectedCar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">Označi prodano</h3><button onClick={() => setShowSoldModal(false)}><X className="w-5 h-5" /></button></div>
              <p className="text-gray-600 mb-4">Avto: <strong>{selectedCar.title}</strong></p>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Kje ste prodali? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: 'website', label: 'Splet', icon: '🌐' }, { id: 'private', label: 'Zasebno', icon: '👤' }, { id: 'other', label: 'Drugo', icon: '📝' }].map((o) => (
                      <button key={o.id} onClick={() => setSoldFeedback({ ...soldFeedback, soldWhere: o.id })} className={`p-3 rounded-xl border-2 ${soldFeedback.soldWhere === o.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}><span className="text-2xl block mb-1">{o.icon}</span><span className="text-sm font-medium">{o.label}</span></button>
                    ))}
                  </div>
                </div>
                {soldFeedback.soldWhere === 'other' && <div><label className="block text-sm font-medium mb-2">Komentar (neobvezno)</label><textarea value={soldFeedback.comment} onChange={(e) => setSoldFeedback({ ...soldFeedback, comment: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" rows={3} /></div>}
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={confirmSold}><CheckCircle className="w-4 h-4 mr-2" />Potrdi</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Package Modal */}
      <AnimatePresence>
        {showPackageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-md w-full p-6">
              {paymentStep === 'select' ? (
                <>
                  <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">Izberite paket</h3><button onClick={() => setShowPackageModal(false)}><X className="w-5 h-5" /></button></div>
                  <div className="space-y-3">
                    {SUBSCRIPTION_PLANS.map((pkg) => (
                      <button key={pkg.id} onClick={() => handleSelectPackage(pkg.id)} className={`w-full p-4 rounded-xl border-2 text-left ${selectedBoost?.id === pkg.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pkg.id === 'premium' ? 'bg-orange-100' : 'bg-gray-100'}`}>{pkg.id === 'premium' ? <Crown className="w-5 h-5 text-orange-600" /> : <Package className="w-5 h-5 text-gray-600" />}</div><div><h4 className="font-semibold">{pkg.name}</h4><p className="text-xs text-gray-500">30 dni</p></div></div><span className="text-2xl font-bold">€{pkg.price}</span></div></button>
                    ))}
                  </div>
                </>
              ) : paymentStep === 'payment' ? (
                <>
                  <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">Plačilo</h3><button onClick={() => setPaymentStep('select')}><X className="w-5 h-5" /></button></div>
                  <p className="text-gray-600 mb-4">Paket: <strong>{selectedBoost?.name}</strong> - €{selectedBoost?.price}</p>
                  <div className="space-y-3">
                    <input type="text" placeholder="Številka kartice" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim() })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" maxLength={19} />
                    <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} className="px-4 py-3 border border-gray-200 rounded-xl" maxLength={5} /><input type="text" placeholder="CVC" value={cardDetails.cvc} onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="px-4 py-3 border border-gray-200 rounded-xl" maxLength={4} /></div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handlePackagePayment}>Plačaj €{selectedBoost?.price}</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><h3 className="text-xl font-bold">Plačilo uspešno!</h3></div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Boost Modal */}
      <AnimatePresence>
        {showBoostModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-md w-full p-6">
              {paymentStep === 'select' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{isSl ? 'Kupite promocijo' : 'Buy Promotion'}</h3>
                    <button onClick={() => setShowBoostModal(false)}><X className="w-5 h-5" /></button>
                  </div>
                  
                  {/* Car Selection - if no car selected, show dropdown */}
                  {listings.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{isSl ? 'Izberi avto za promocijo' : 'Select car for promotion'}</label>
                      <select 
                        id="car-select"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={selectedCar?.id || ''}
                        onChange={(e) => {
                          const car = listings.find(c => c.id === parseInt(e.target.value))
                          setSelectedCar(car || null)
                        }}
                      >
                        <option value="">{isSl ? '-- Izberi avto --' : '-- Select car --'}</option>
                        {listings.map(car => (
                          <option key={car.id} value={car.id}>
                            {car.title} {car.promoted ? '(promoviran)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Business users with existing promotion - show them */}
                  {isBusiness && businessPromotion && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">{isSl ? 'Imate aktivno promocijo!' : 'You have an active promotion!'}</p>
                          <p className="text-xs text-green-600">
                            {businessPromotion.name} - {businessPromotion.days} dni<br />
                            {isSl ? 'Velja do:' : 'Valid until:'} {new Date(businessPromotion.expiresAt).toLocaleDateString('sl-SI')}
                          </p>
                        </div>
                        <Zap className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                  )}
                  
                  {/* Days Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{isSl ? 'Stevilo dni' : 'Number of days'}</label>
                    <input 
                      type="number" 
                      min={isBusiness ? 30 : 15}
                      defaultValue={isBusiness ? 30 : 15}
                      id="boost-days"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min. {isBusiness ? "30" : "15"} {isSl ? 'dni' : 'days'}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {boostPlans.map((pkg) => (
                      <button key={pkg.id} onClick={() => { 
                        const days = parseInt(document.getElementById('boost-days')?.value || (isBusiness ? 30 : 15))
                        const minDays = isBusiness ? 30 : 15
                        const finalDays = Math.max(days, minDays)
                        setSelectedBoost({...pkg, selectedDays: finalDays, totalPrice: pkg.price * finalDays})
                        setPaymentStep('payment') 
                      }} className={`w-full p-4 rounded-xl border-2 hover:border-orange-500 text-left transition-all ${
                        pkg.color === 'orange' ? 'border-orange-300 bg-orange-50' : pkg.color === 'green' ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div><h4 className="font-semibold">{pkg.name}</h4><p className="text-xs text-gray-500">{pkg.days}</p></div>
                          <span className="text-xl font-bold">€{pkg.price}<span className="text-xs">/dan</span></span>
                        </div>
                        {pkg.subtitle && <p className="text-xs text-orange-600 mt-1">{pkg.subtitle}</p>}
                      </button>
                    ))}
                  </div>
                </>
              ) : paymentStep === 'payment' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Placilo</h3>
                    <button onClick={() => setPaymentStep('select')}><X className="w-5 h-5" /></button>
                  </div>
                  
                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">{isSl ? 'Avto' : 'Car'}</span>
                      <span className="font-semibold">{selectedCar?.title || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">{isSl ? 'Promocija' : 'Promotion'}</span>
                      <span className="font-semibold">{selectedBoost?.name}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">{isSl ? 'Stevilo dni' : 'Days'}</span>
                      <span className="font-semibold">{selectedBoost?.selectedDays || 30}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">{isSl ? 'Cena na dan' : 'Price/day'}</span>
                      <span className="font-semibold">€{selectedBoost?.price}</span>
                    </div>
                    <hr className="my-3"/>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{isSl ? 'Skupaj' : 'Total'}</span>
                      <span className="font-bold text-2xl text-orange-600">€{((selectedBoost?.price || 0) * (selectedBoost?.selectedDays || 30)).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <input type="text" placeholder={isSl ? 'Stevilka kartice' : 'Card number'} value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim() })} className="w-full px-4 py-3 border border-gray-200 rounded-xl" maxLength={19} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} className="px-4 py-3 border border-gray-200 rounded-xl" maxLength={5} />
                      <input type="text" placeholder="CVC" value={cardDetails.cvc} onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="px-4 py-3 border border-gray-200 rounded-xl" maxLength={4} />
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleBoostPayment}>{isSl ? 'Placaj' : 'Pay'} €{((selectedBoost?.price || 0) * (selectedBoost?.selectedDays || 30)).toFixed(2)}</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">{isSl ? 'Placilo uspesno!' : 'Payment successful!'}</h3>
                  <p className="text-gray-600 mt-2">{selectedCar ? (isSl ? 'Vas avto je sedaj promoviran' : 'Your car is now promoted') : (isSl ? 'Promocija kupljena' : 'Promotion purchased')}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Car Selection Modal for Promotion */}
      <AnimatePresence>
        {showCarSelectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Aktiviraj promocijo</h3>
                <button onClick={() => setShowCarSelectModal(false)}><X className="w-5 h-5" /></button>
              </div>
              
              {/* If selectedBoost from purchased boosts */}
              {selectedBoost ? (
                <div>
                  <div className="bg-purple-50 p-4 rounded-xl mb-4">
                    <h4 className="font-semibold text-purple-800">{selectedBoost.name}</h4>
                    <p className="text-sm text-purple-600">{selectedBoost.days} dni</p>
                  </div>
                  <p className="text-gray-600 mb-4">Izberite vozilo za to promocijo:</p>
                  
                  {listings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Nimate vozil za promocijo</p>
                      <Button onClick={() => { setShowCarSelectModal(false); navigate('/add-car') }}>
                        Dodajte vozilo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {listings.map(car => (
                      <div key={car.id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                        <img src={car.images?.[0] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100'} alt={car.title} className="w-16 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="font-medium">{car.title}</h4>
                          <p className="text-xs text-gray-500">{car.year} • {car.mileage?.toLocaleString()} km</p>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600"
                          onClick={() => {
                            // Activate boost on this car
                            updateCar(car.id, { 
                              promoted: true, 
                              hasBoost: true,
                              boostPackage: selectedBoost.id,
                              promotedUntil: new Date(Date.now() + selectedBoost.days * 24 * 60 * 60 * 1000).toISOString()
                            })
                            
                            // Mark boost as used
                            const updatedBoosts = purchasedBoosts.map(b => 
                              b === selectedBoost ? { ...b, usedOn: car.title, usedAt: new Date().toISOString() } : b
                            )
                            localStorage.setItem(`automarket_boosts_${user?.email || user?.id}`, JSON.stringify(updatedBoosts))
                            setPurchasedBoosts(updatedBoosts)
                            
                            setShowCarSelectModal(false)
                            setSelectedBoost(null)
                            setTimeout(() => refreshCars(), 100)
                            alert('Promocija uspešno aktivirana!')
                          }}
                        >
                          Izberi
                        </Button>
                      </div>
                    ))}
                    </div>
                  )}
                  
                  <Button variant="secondary" className="w-full" onClick={() => { setShowCarSelectModal(false); setSelectedBoost(null) }}>
                    Prekliči
                  </Button>
                </div>
              ) : (
                /* Business promotions from localStorage */
                <>
                  <p className="text-gray-600 mb-4">Vsako promocijo lahko dodelite drugemu avtu:</p>
              
                  {/* List of promotions */}
                  <div className="space-y-3 mb-6">
                    {businessPromotions.map((promo, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{promo.name}</h4>
                            <p className="text-xs text-gray-500">{promo.days} dni • Do: {new Date(promo.expiresAt).toLocaleDateString('sl-SI')}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${promo.activeOnCar ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {promo.activeOnCar ? 'Aktivno' : 'Neaktivno'}
                          </span>
                        </div>
                        
                        {/* Select car for this promotion */}
                        <select 
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          value={promo.activeOnCar || ''}
                          onChange={(e) => {
                            const carId = parseInt(e.target.value)
                            if (!carId) {
                              // Deactivate this promotion
                              const updatedPromos = [...businessPromotions]
                              updatedPromos[idx].activeOnCar = null
                              updatedPromos[idx].activeOnCarTitle = null
                              localStorage.setItem(`automarket_promotions_${user.id}`, JSON.stringify(updatedPromos))
                              
                              // Find and update car to remove promotion
                              if (promo.activeOnCar) {
                                const carToUpdate = listings.find(c => c.id === promo.activeOnCar)
                                if (carToUpdate) {
                                  updateCar(carToUpdate.id, { promoted: false, hasBoost: false })
                                }
                              }
                              setTimeout(() => refreshCars(), 100)
                              return
                            }
                            
                            const carToPromote = listings.find(c => c.id === carId)
                            if (carToPromote) {
                              // First deactivate any other promotion on this car
                              listings.forEach(car => {
                                if (car.id === carId && car.promoted) {
                                  updateCar(car.id, { promoted: false, hasBoost: false })
                                }
                              })
                              
                              // Activate this promotion on selected car
                              updateCar(carId, { 
                                promoted: true, 
                                hasBoost: true,
                                boostPackage: promo.id,
                                promotedUntil: promo.expiresAt
                              })
                              
                              // Update promotion to track which car it's on
                              const updatedPromos = [...businessPromotions]
                              updatedPromos[idx].activeOnCar = carId
                              updatedPromos[idx].activeOnCarTitle = carToPromote.title
                              localStorage.setItem(`automarket_promotions_${user.id}`, JSON.stringify(updatedPromos))
                              
                              setTimeout(() => refreshCars(), 100)
                            }
                          }}
                        >
                          <option value="">-- Izberi avto --</option>
                          {listings.map(car => (
                            <option key={car.id} value={car.id}>
                              {car.title} {car.promoted ? '(že promoviran)' : ''}
                            </option>
                          ))}
                        </select>
                        
                        {promo.activeOnCar && (
                          <p className="text-xs text-green-600 mt-2">Trenutno aktivno na: {promo.activeOnCarTitle}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Buy more promotions button */}
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      setShowCarSelectModal(false)
                      setShowBoostModal(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Kupite novo promocijo
                  </Button>
                  
                  <Button variant="secondary" className="w-full mt-3" onClick={() => { setShowCarSelectModal(false); setSelectedBoost(null) }}>
                    Zapri
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
