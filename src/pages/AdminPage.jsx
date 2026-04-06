import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Car, DollarSign, TrendingUp, Edit, Trash2, Eye, X, Save, 
  RefreshCw, Search, Send, Mail, MessageSquare, Bell, Shield, Check,
  ChevronDown, ChevronUp, Star, Zap, Package, ShoppingCart, TrendingDown,
  Calendar, Filter, Download, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, User,
  Phone, MapPin, CreditCard, Clock, CheckCircle, XCircle, AlertCircle,
  Image, Settings, LogOut, SendHorizontal, UsersRound,
  Plus, Minus, ToggleLeft, ToggleRight, Percent, CalendarDays
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts'

const isSl = true
const COLORS = ['#ff6a00', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#06b6d4']

// Hardcoded package features for display
const PUBLISHING_PACKAGES = [
  { id: 'osnovni', name: 'OSNOVNI', features: [
    { text: 'Objava do 100 oglasov', included: true },
    { text: '10 fotografij na oglas', included: true },
    { text: 'Neomejeno urejanje oglasov', included: true },
    { text: 'Osnovne funkcije', included: true },
    { text: 'Statistika ogledov', included: false },
    { text: 'HD slike', included: false },
    { text: '360 posnetki', included: false },
    { text: 'Premium uvrstitev', included: false },
  ]},
  { id: 'premium', name: 'PREMIUM', features: [
    { text: 'Neomejena objava oglasov', included: true },
    { text: '30 fotografij na oglas', included: true },
    { text: 'Neomejeno urejanje oglasov', included: true },
    { text: 'Statistika ogledov', included: true },
    { text: 'HD slike', included: true },
    { text: '360 posnetki', included: true },
    { text: 'Premium uvrstitev', included: true },
    { text: 'Komentarji kupcev', included: true },
  ]},
]

const BOOST_PRIVATE = [
  { id: 'akcija_p', name: 'Paket vseh cen', features: [
    { text: 'Prikaz na vrhu rezultatov', included: true },
    { text: 'Vec vidljivosti med kupci', included: true },
    { text: 'Hitreje prodajte vozilo', included: true },
    { text: 'Prikaz v posebnem oknu', included: false },
  ]},
  { id: 'top_p', name: 'Top izbira', features: [
    { text: 'Prikaz na vrhu rezultatov', included: true },
    { text: 'Vec vidljivosti med kupci', included: true },
    { text: 'Hitreje prodajte vozilo', included: true },
    { text: 'Zlatorumen gradient', included: true },
  ]},
  { id: 'skok_p', name: 'Skok na vrh', features: [
    { text: 'Takojsten skok na vrh', included: true },
    { text: 'Enostavna promocija', included: true },
    { text: 'Brez dodatnih okraskov', included: false },
    { text: 'Premium oznaka', included: false },
  ]},
]

const BOOST_BUSINESS = [
  { id: 'akcija', name: 'Paket vseh cen', features: [
    { text: 'Prikaz na vrhu rezultatov', included: true },
    { text: 'Vec vidljivosti med kupci', included: true },
    { text: 'Hitreje prodajte vozilo', included: true },
    { text: 'Prikaz v posebnem oknu', included: false },
  ]},
  { id: 'top', name: 'Top izbira', features: [
    { text: 'Prikaz na vrhu rezultatov', included: true },
    { text: 'Vec vidljivosti med kupci', included: true },
    { text: 'Hitreje prodajte vozilo', included: true },
    { text: 'Zlatorumen gradient', included: true },
  ]},
  { id: 'skok', name: 'Skok na vrh', features: [
    { text: 'Takojsten skok na vrh', included: true },
    { text: 'Enostavna promocija', included: true },
    { text: 'Brez dodatnih okraskov', included: false },
    { text: 'Premium oznaka', included: false },
  ]},
]

export default function AdminPage() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  
  // ALL STATE - MUST BE BEFORE ANY RETURNS
  const [adminUser, setAdminUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Data states
  const [users, setUsers] = useState([])
  const [cars, setCars] = useState([])
  const [packages, setPackages] = useState([])
  const [messages, setMessages] = useState([])
  const [userPackages, setUserPackages] = useState({})
  const [orders, setOrders] = useState([])
  
  // Date range for reports
  const [dateRange, setDateRange] = useState('30')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Search & filters
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [carFilter, setCarFilter] = useState('all')
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCarModal, setShowCarModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showRevenueModal, setShowRevenueModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCar, setSelectedCar] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  
  // Forms
  const [messageForm, setMessageForm] = useState({ recipientId: '', subject: '', content: '' })
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', content: '' })
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', phone: '', logo_url: '' })

  // Ref for loadData to avoid hook ordering issues
  const loadDataRef = useRef(null)
  
  // Load data function stored in ref
  loadDataRef.current = async () => {
    setLoading(true)
    try {
      const [
        usersRes, 
        carsRes, 
        packagesRes, 
        messagesRes,
        userPackagesRes,
        ordersRes
      ] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('cars').select('*').order('created_at', { ascending: false }),
        supabase.from('packages').select('*').order('type'),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
        supabase.from('user_packages').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ])
      
      if (usersRes.data) setUsers(usersRes.data)
      if (carsRes.data) setCars(carsRes.data)
      if (packagesRes.data) {
        // Merge hardcoded features with Supabase data
        const packagesWithFeatures = packagesRes.data.map(pkg => {
          let hardcodedPkg = null
          if (pkg.type === 'publishing') {
            hardcodedPkg = PUBLISHING_PACKAGES.find(p => p.id === pkg.id || p.name === pkg.name)
          } else if (pkg.type === 'boost_private') {
            hardcodedPkg = BOOST_PRIVATE.find(p => p.id === pkg.id || p.name === pkg.name)
          } else if (pkg.type === 'boost_business') {
            hardcodedPkg = BOOST_BUSINESS.find(p => p.id === pkg.id || p.name === pkg.name)
          }
          return {
            ...pkg,
            features: hardcodedPkg?.features || [],
            color: hardcodedPkg?.color || 'orange'
          }
        })
        setPackages(packagesWithFeatures)
      }
      if (messagesRes.data) setMessages(messagesRes.data)
      if (ordersRes.data) setOrders(ordersRes.data || [])
      
      const upMap = {}
      if (userPackagesRes.data) {
        userPackagesRes.data.forEach(up => {
          if (!upMap[up.user_id]) upMap[up.user_id] = []
          upMap[up.user_id].push(up)
        })
        setUserPackages(upMap)
      }
      
    } catch (err) {
      console.error('Error loading data:', err)
    }
    setLoading(false)
    setRefreshing(false)
  }

  // ALL USEEFFECTS - MUST BE BEFORE ANY RETURNS
  useEffect(() => {
    setMounted(true)
    try {
      const storedAdmin = localStorage.getItem('automarket_admin_user')
      if (storedAdmin) {
        const parsed = JSON.parse(storedAdmin)
        if (parsed.role === 'admin') {
          setAdminUser(parsed)
        } else {
          navigate('/admin')
        }
      } else {
        navigate('/admin')
      }
    } catch (e) {
      navigate('/admin')
    }
  }, [navigate])
  
  useEffect(() => {
    if (adminUser) {
      loadDataRef.current()
    }
  }, [adminUser])

  // ALL USEMEMO - MUST BE BEFORE ANY RETURNS
  const stats = useMemo(() => {
    const now = new Date()
    const daysAgo = parseInt(dateRange)
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate + 'T23:59:59') : now
    
    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at)
      return orderDate >= start && orderDate <= end
    })
    
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
    
    const activeUsers = users.filter(u => {
      const hasPackage = (userPackages[u.id] || []).some(p => new Date(p.expires_at) > now)
      const hasCars = cars.some(c => c.user_id === u.id && c.status === 'active')
      return hasPackage || hasCars
    })
    
    const revenueByPackage = {}
    filteredOrders.forEach(o => {
      if (o.package_type) {
        revenueByPackage[o.package_type] = (revenueByPackage[o.package_type] || 0) + (o.amount || 0)
      }
    })
    
    const carsByStatus = {
      active: cars.filter(c => c.status === 'active').length,
      pending: cars.filter(c => c.status === 'pending').length,
      sold: cars.filter(c => c.status === 'sold').length
    }
    
    const newUsers = users.filter(u => {
      const created = new Date(u.created_at)
      return created >= start && created <= end
    }).length
    
    const newCars = cars.filter(c => {
      const created = new Date(c.created_at)
      return created >= start && created <= end
    }).length
    
    return {
      totalUsers: users.length,
      totalCars: cars.length,
      activeCars: carsByStatus.active,
      pendingCars: carsByStatus.pending,
      soldCars: carsByStatus.sold,
      totalPackages: packages.length,
      totalRevenue,
      filteredRevenue: totalRevenue,
      activeUsers: activeUsers.length,
      newUsers,
      newCars,
      revenueByPackage,
      unreadMessages: messages.filter(m => !m.is_read).length
    }
  }, [users, cars, packages, orders, messages, userPackages, dateRange, startDate, endDate])

  const revenueChartData = useMemo(() => {
    const now = new Date()
    const days = parseInt(dateRange)
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayOrders = orders.filter(o => o.created_at && o.created_at.startsWith(dateStr))
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
      
      data.push({
        date: date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      })
    }
    return data
  }, [orders, dateRange])

  const activityChartData = useMemo(() => {
    const now = new Date()
    const days = 7
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayUsers = users.filter(u => u.created_at && u.created_at.startsWith(dateStr)).length
      const dayCars = cars.filter(c => c.created_at && c.created_at.startsWith(dateStr)).length
      
      data.push({
        date: date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' }),
        users: dayUsers,
        cars: dayCars
      })
    }
    return data
  }, [users, cars])

  const packageDistribution = useMemo(() => {
    const dist = {}
    Object.values(userPackages).flat().forEach(up => {
      if (new Date(up.expires_at) > new Date()) {
        dist[up.package_name || up.package_type || 'Unknown'] = (dist[up.package_name || up.package_type || 'Unknown'] || 0) + 1
      }
    })
    return Object.entries(dist).map(([name, value]) => ({ name, value }))
  }, [userPackages])

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u => 
      !searchTerm || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (userFilter === 'with_cars') {
      filtered = filtered.filter(u => cars.some(c => c.user_id === u.id))
    } else if (userFilter === 'with_packages') {
      filtered = filtered.filter(u => (userPackages[u.id] || []).some(p => new Date(p.expires_at) > new Date()))
    } else if (userFilter === 'no_package') {
      filtered = filtered.filter(u => !(userPackages[u.id] || []).some(p => new Date(p.expires_at) > new Date()))
    }
    
    return filtered
  }, [users, searchTerm, userFilter, cars, userPackages])
  
  const filteredCars = useMemo(() => {
    let filtered = cars.filter(c => 
      !searchTerm || 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (carFilter === 'active') {
      filtered = filtered.filter(c => c.status === 'active')
    } else if (carFilter === 'pending') {
      filtered = filtered.filter(c => c.status === 'pending')
    } else if (carFilter === 'sold') {
      filtered = filtered.filter(c => c.status === 'sold')
    }
    
    return filtered
  }, [cars, searchTerm, carFilter])

  const currentUser = adminUser
  
  const tabs = [
    { id: 'dashboard', label: 'Nadzorna plošča', icon: BarChart3 },
    { id: 'users', label: 'Uporabniki', icon: Users, count: users.length },
    { id: 'cars', label: 'Vozila', icon: Car, count: cars.length },
    { id: 'packages', label: 'Paketi', icon: Package },
    { id: 'revenue', label: 'Prihodki', icon: DollarSign },
    { id: 'messages', label: 'Sporočila', icon: Mail, count: stats.unreadMessages },
  ]
  
  // NOW WE CAN DO CONDITIONAL RETURNS
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Nalaganje...</p>
        </div>
      </div>
    )
  }
  
  if (!adminUser) {
    return null
  }

  // Helper functions
  const handleRefresh = () => { setRefreshing(true); loadDataRef.current() }
  
  const getUserActivePackages = (userId) => {
    const ups = userPackages[userId] || []
    return ups.filter(up => new Date(up.expires_at) > new Date())
  }
  
  const getUserCars = (userId) => {
    return cars.filter(c => c.user_id === userId)
  }

  const sendMessage = async () => {
    if (!messageForm.content.trim()) return
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        recipient_id: messageForm.recipientId,
        subject: messageForm.subject || '',
        content: messageForm.content,
        is_system: false
      })
      if (error) throw error
      setMessageForm({ recipientId: '', subject: '', content: '' })
      setShowMessageModal(false)
      loadDataRef.current()
      alert('Sporočilo poslano!')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Napaka pri pošiljanju')
    }
  }
  
  const sendBroadcast = async () => {
    if (!broadcastForm.content.trim()) return
    try {
      const { error: broadcastErr } = await supabase.from('broadcasts').insert({
        subject: broadcastForm.subject,
        content: broadcastForm.content,
        sent_by: currentUser.id
      })
      if (broadcastErr) throw broadcastErr
      
      const messageInserts = users.map(u => ({
        sender_id: currentUser.id,
        recipient_id: u.id,
        subject: broadcastForm.subject || 'Obvestilo',
        content: broadcastForm.content,
        is_system: true
      }))
      
      await supabase.from('messages').insert(messageInserts)
      setBroadcastForm({ subject: '', content: '' })
      setShowBroadcastModal(false)
      loadDataRef.current()
      alert(`Sporočilo poslano ${users.length} uporabnikom!`)
    } catch (err) {
      console.error('Error sending broadcast:', err)
      alert('Napaka pri pošiljanju')
    }
  }
  
  const deleteUser = async (userId) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati uporabnika?')) return
    try {
      await supabase.from('users').delete().eq('id', userId)
      loadDataRef.current()
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }
  
  const deleteCar = async (carId) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati vozilo?')) return
    try {
      await supabase.from('cars').delete().eq('id', carId)
      loadDataRef.current()
    } catch (err) {
      console.error('Error deleting car:', err)
    }
  }
  
  const updateCarStatus = async (carId, status) => {
    try {
      const { error } = await supabase.from('cars').update({ status }).eq('id', carId)
      if (error) throw error
      loadDataRef.current()
    } catch (err) {
      console.error('Error updating car:', err)
    }
  }
  
  const updatePackage = async () => {
    if (!selectedPackage) return
    try {
      const { error } = await supabase.from('packages').update({
        price: selectedPackage.price,
        discount_percent: selectedPackage.discount_percent,
        discount_active: selectedPackage.discount_active,
        name: selectedPackage.name,
        name_sl: selectedPackage.name_sl,
        min_days: selectedPackage.min_days
      }).eq('id', selectedPackage.id)
      if (error) throw error
      setShowPackageModal(false)
      loadDataRef.current()
      alert('Paket posodobljen!')
    } catch (err) {
      console.error('Error updating package:', err)
      alert('Napaka pri posodabljanju')
    }
  }
  
  const updateUser = async () => {
    if (!selectedUser) return
    try {
      const { error } = await supabase.from('users').update({
        name: editUserForm.name,
        email: editUserForm.email,
        phone: editUserForm.phone,
        logo_url: editUserForm.logo_url
      }).eq('id', selectedUser.id)
      if (error) throw error
      setShowEditUserModal(false)
      loadDataRef.current()
      alert('Uporabnik posodobljen!')
    } catch (err) {
      console.error('Error updating user:', err)
      alert('Napaka pri posodabljanju')
    }
  }
  
  const openEditUser = (user) => {
    setSelectedUser(user)
    setEditUserForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      logo_url: user.logo_url || ''
    })
    setShowEditUserModal(true)
  }
  
  const openSendMessage = (userId) => {
    setMessageForm({ recipientId: userId, subject: '', content: '' })
    setShowMessageModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Nadzornik sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Osveži
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Nazaj na stran
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}
        
        {/* ========== DASHBOARD TAB ========== */}
        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-4 items-center">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              <select 
                value={dateRange} 
                onChange={(e) => { setDateRange(e.target.value); setStartDate(''); setEndDate('') }}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="7">7 dni</option>
                <option value="30">30 dni</option>
                <option value="90">90 dni</option>
                <option value="custom">Po meri</option>
              </select>
              {dateRange === 'custom' && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
                  <span className="text-gray-400">do</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
                </>
              )}
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500">Prihodek v obdobju</p>
                <p className="text-2xl font-bold text-green-600">€{stats.filteredRevenue.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uporabniki</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600">+{stats.newUsers} to obdobje</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vozila</p>
                    <p className="text-2xl font-bold">{stats.totalCars}</p>
                    <p className="text-xs text-green-600">+{stats.newCars} to obdobje</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Aktivni</p>
                    <p className="text-2xl font-bold">{stats.activeCars}</p>
                    <p className="text-xs text-gray-500">{stats.pendingCars} čakajočih</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Prihodek</p>
                    <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(0)}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-orange-500" />
                  Prihodek po dnevih
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLine data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#ff6a00" strokeWidth={2} dot={false} />
                  </RechartsLine>
                </ResponsiveContainer>
              </Card>
              
              <Card className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Nova registracija (7 dni)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBar data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="users" name="Uporabniki" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cars" name="Vozila" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </Card>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-purple-500" />
                  Aktivni paketi
                </h3>
                {packageDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie data={packageDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {packageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">Ni podatkov</p>
                )}
              </Card>
              
              <Card className="p-5 md:col-span-2">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-500" />
                  Zadnje naročila
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {orders.slice(0, 10).map(order => {
                    const orderUser = users.find(u => u.id === order.user_id)
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{orderUser?.name || 'Neznan'}</p>
                            <p className="text-xs text-gray-500">{order.package_type || 'Package'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">€{order.amount?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('sl-SI')}</p>
                        </div>
                      </div>
                    )
                  })}
                  {orders.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Ni naročil</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* ========== USERS TAB ========== */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Uporabniki ({filteredUsers.length})</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Išči..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <select 
                  value={userFilter} 
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">Vsi uporabniki</option>
                  <option value="with_cars">Z vozili</option>
                  <option value="with_packages">S paketom</option>
                  <option value="no_package">Brez paketa</option>
                </select>
                <Button onClick={() => { setBroadcastForm({ subject: '', content: '' }); setShowBroadcastModal(true) }}>
                  <SendHorizontal className="w-4 h-4 mr-2" />
                  Pošlji vsem
                </Button>
              </div>
            </div>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Ime</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Telefon</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Tip</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Vozila</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Paketi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(user => {
                      const userCars = getUserCars(user.id)
                      const userPacks = getUserActivePackages(user.id)
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-sm">{user.name}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">{user.phone || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.user_type === 'business' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {user.user_type === 'business' ? 'Podjetje' : 'Zasebno'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium">{userCars.length}</span>
                          </td>
                          <td className="px-4 py-3">
                            {userPacks.length > 0 ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                {userPacks.length} aktivni
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Brez paketa</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => { setSelectedUser(user); setShowUserModal(true) }} className="p-1.5 hover:bg-gray-100 rounded" title="Pregled">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button onClick={() => openEditUser(user)} className="p-1.5 hover:bg-gray-100 rounded" title="Uredi">
                                <Edit className="w-4 h-4 text-blue-500" />
                              </button>
                              <button onClick={() => openSendMessage(user.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Sporočilo">
                                <MessageSquare className="w-4 h-4 text-green-500" />
                              </button>
                              <button onClick={() => deleteUser(user.id)} className="p-1.5 hover:bg-red-50 rounded" title="Izbriši">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
        
        {/* ========== CARS TAB ========== */}
        {!loading && activeTab === 'cars' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Vozila ({filteredCars.length})</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Išči..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <select 
                  value={carFilter} 
                  onChange={(e) => setCarFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">Vsa vozila</option>
                  <option value="active">Aktivna</option>
                  <option value="pending">Čakajoča</option>
                  <option value="sold">Prodana</option>
                </select>
              </div>
            </div>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Naslov</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Znamka</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Cena</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Prodajalec</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCars.map(car => {
                      const seller = users.find(u => u.id === car.user_id)
                      return (
                        <tr key={car.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-sm max-w-xs truncate">{car.title}</td>
                          <td className="px-4 py-3 text-sm">{car.brand}</td>
                          <td className="px-4 py-3 text-sm font-medium">€{car.price?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <select 
                              value={car.status || 'active'} 
                              onChange={(e) => updateCarStatus(car.id, e.target.value)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                car.status === 'active' ? 'bg-green-100 text-green-700' : 
                                car.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <option value="active">Aktivno</option>
                              <option value="pending">Čakajoče</option>
                              <option value="sold">Prodano</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm">{seller?.name || 'Neznan'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => navigate(`/cars/${car.id}`)} className="p-1.5 hover:bg-gray-100 rounded" title="Pregled">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button onClick={() => deleteCar(car.id)} className="p-1.5 hover:bg-red-50 rounded" title="Izbriši">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
        
        {/* ========== PACKAGES TAB ========== */}
        {!loading && activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Upravljanje paketov</h2>
            </div>
            
            {/* Publishing Packages */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Paketi za objavo
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.filter(p => p.type === 'publishing').map(pkg => {
                  const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                  const features = pkg.features || []
                  return (
                    <Card key={pkg.id} className="p-5 relative overflow-hidden">
                      {hasDiscount && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                          -{pkg.discount_percent}% Zbritja
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{pkg.name}</h4>
                        <button onClick={() => { setSelectedPackage(pkg); setShowPackageModal(true) }} className="p-1.5 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-2xl font-bold text-red-500">€{(pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)}</span>
                            <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-orange-600">€{pkg.price}</span>
                        )}
                        <span className="text-gray-500 text-sm">/mesec</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Min {pkg.min_days} dni</p>
                      
                      {/* Features */}
                      {features.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              {f.included ? (
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                              )}
                              <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        {hasDiscount ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">{pkg.discount_percent}% zbritja aktivna</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Brez zbritve</span>
                          </>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
            
            {/* Boost Packages - Private */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Paketi za promocijo - Zasebni (min 15 dni)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {packages.filter(p => p.type === 'boost_private').map(pkg => {
                  const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                  const features = pkg.features || []
                  return (
                    <Card key={pkg.id} className="p-5 relative overflow-hidden">
                      {hasDiscount && (
                        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1.5 text-xs font-bold">
                          -{pkg.discount_percent}% Zbritja
                        </div>
                      )}
                      <div className={`${hasDiscount ? 'pt-6' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{pkg.name}</h4>
                          <button onClick={() => { setSelectedPackage(pkg); setShowPackageModal(true) }} className="p-1.5 hover:bg-gray-100 rounded">
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-2xl font-bold text-red-500">€{(pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)}</span>
                              <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-orange-600">€{pkg.price}</span>
                          )}
                          <span className="text-gray-500 text-sm">/dan</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">min {pkg.min_days || 15} dni</p>
                        
                        {/* Features */}
                        {features.length > 0 && (
                          <ul className="space-y-1 mb-3">
                            {features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                {f.included ? (
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                )}
                                <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
            
            {/* Boost Packages - Business */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Paketi za promocijo - Poslovni (min 30 dni)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {packages.filter(p => p.type === 'boost_business').map(pkg => {
                  const hasDiscount = pkg.discount_active && pkg.discount_percent > 0
                  const features = pkg.features || []
                  const borderColor = pkg.color === 'green' ? 'border-green-300' : pkg.color === 'blue' ? 'border-blue-300' : 'border-orange-300'
                  return (
                    <Card key={pkg.id} className={`p-5 relative overflow-hidden border-2 ${borderColor}`}>
                      {hasDiscount && (
                        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1.5 text-xs font-bold">
                          -{pkg.discount_percent}% Zbritja
                        </div>
                      )}
                      <div className={`${hasDiscount ? 'pt-6' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{pkg.name}</h4>
                          <button onClick={() => { setSelectedPackage(pkg); setShowPackageModal(true) }} className="p-1.5 hover:bg-gray-100 rounded">
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-2xl font-bold text-red-500">€{(pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)}</span>
                              <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-purple-600">€{pkg.price}</span>
                          )}
                          <span className="text-gray-500 text-sm">/dan</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">min {pkg.min_days || 30} dni</p>
                        
                        {/* Features */}
                        {features.length > 0 && (
                          <ul className="space-y-1 mb-3">
                            {features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                {f.included ? (
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                )}
                                <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* ========== REVENUE TAB ========== */}
        {!loading && activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-4 items-center">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              <select 
                value={dateRange} 
                onChange={(e) => { setDateRange(e.target.value); setStartDate(''); setEndDate('') }}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="7">7 dni</option>
                <option value="30">30 dni</option>
                <option value="90">90 dni</option>
                <option value="365">1 leto</option>
                <option value="custom">Po meri</option>
              </select>
              {dateRange === 'custom' && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
                  <span className="text-gray-400">do</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
                </>
              )}
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <p className="text-sm text-green-600 mb-1">Skupni prihodek</p>
                <p className="text-3xl font-bold text-green-700">€{stats.filteredRevenue.toFixed(2)}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-gray-500 mb-1">Naročil</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-gray-500 mb-1">Povprečno na naročilo</p>
                <p className="text-3xl font-bold">€{orders.length > 0 ? (stats.filteredRevenue / orders.length).toFixed(2) : '0.00'}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-gray-500 mb-1">Paketi kupljeni</p>
                <p className="text-3xl font-bold">{Object.keys(stats.revenueByPackage).length}</p>
              </Card>
            </div>
            
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Prihodek po dnevih</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLine data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" name="Prihodek" stroke="#ff6a00" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" name="Naročila" stroke="#3b82f6" strokeWidth={2} />
                </RechartsLine>
              </ResponsiveContainer>
            </Card>
            
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Prihodek po tipu paketa</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(stats.revenueByPackage).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-medium">{type}</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">€{amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
        
        {/* ========== MESSAGES TAB ========== */}
        {!loading && activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sporočila ({messages.length})</h2>
              <Button onClick={() => { setBroadcastForm({ subject: '', content: '' }); setShowBroadcastModal(true) }}>
                <SendHorizontal className="w-4 h-4 mr-2" />
                Pošlji vsem uporabnikom
              </Button>
            </div>
            
            <div className="space-y-3">
              {messages.map(msg => {
                const sender = users.find(u => u.id === msg.sender_id)
                return (
                  <Card key={msg.id} className={`p-4 ${!msg.is_read ? 'border-l-4 border-orange-500 bg-orange-50/50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {msg.is_system && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">SISTEM</span>}
                          <span className="font-medium">{sender?.name || 'Neznan'}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-sm text-gray-500">{sender?.email}</span>
                        </div>
                        {msg.subject && <p className="font-medium text-sm mb-1">{msg.subject}</p>}
                        <p className="text-gray-700">{msg.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                      {!msg.is_read && (
                        <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium">Novo</span>
                      )}
                    </div>
                  </Card>
                )
              })}
              {messages.length === 0 && (
                <p className="text-center text-gray-500 py-8">Ni sporočil</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* ========== MODALS ========== */}
      
      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-lg font-semibold">Uporabnik #{selectedUser.id}</h3>
                <button onClick={() => setShowUserModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedUser.name}</p>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium">{selectedUser.phone || 'Ni podatka'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tip</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${selectedUser.user_type === 'business' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedUser.user_type === 'business' ? 'Podjetje' : 'Zasebno'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registriran</p>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString('sl-SI')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vozila</p>
                    <p className="font-medium">{getUserCars(selectedUser.id).length}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Aktivni paketi ({getUserActivePackages(selectedUser.id).length})</p>
                  {getUserActivePackages(selectedUser.id).length > 0 ? (
                    <div className="space-y-2">
                      {getUserActivePackages(selectedUser.id).map(pack => (
                        <div key={pack.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{pack.package_name || pack.package_type}</span>
                          <span className="text-xs text-gray-500">do {new Date(pack.expires_at).toLocaleDateString('sl-SI')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Ni aktivnih paketov</p>
                  )}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Vozila ({getUserCars(selectedUser.id).length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getUserCars(selectedUser.id).map(car => (
                      <div key={car.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate flex-1">{car.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${car.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
                          {car.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => { setShowUserModal(false); openEditUser(selectedUser) }} className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Uredi
                  </Button>
                  <Button variant="outline" onClick={() => { setShowUserModal(false); openSendMessage(selectedUser.id) }}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Sporočilo
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Uredi uporabnika</h3>
                <button onClick={() => setShowEditUserModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ime</label>
                  <input type="text" value={editUserForm.name} onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input type="tel" value={editUserForm.phone} onChange={e => setEditUserForm({...editUserForm, phone: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL (za podjetja)</label>
                  <input type="url" value={editUserForm.logo_url} onChange={e => setEditUserForm({...editUserForm, logo_url: e.target.value})} className="w-full p-2 border rounded" placeholder="https://..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={updateUser} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Shrani
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditUserModal(false)}>Prekliči</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Send Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pošlji sporočilo</h3>
                <button onClick={() => setShowMessageModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Zadeva</label>
                  <input type="text" value={messageForm.subject} onChange={e => setMessageForm({...messageForm, subject: e.target.value})} className="w-full p-2 border rounded" placeholder="Neobvezno" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sporočilo</label>
                  <textarea value={messageForm.content} onChange={e => setMessageForm({...messageForm, content: e.target.value})} className="w-full p-2 border rounded h-32" placeholder="Vnesite sporočilo..." />
                </div>
                <Button onClick={sendMessage} className="w-full">
                  <SendHorizontal className="w-4 h-4 mr-2" />
                  Pošlji
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pošlji vsem uporabnikom</h3>
                <button onClick={() => setShowBroadcastModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Zadeva</label>
                  <input type="text" value={broadcastForm.subject} onChange={e => setBroadcastForm({...broadcastForm, subject: e.target.value})} className="w-full p-2 border rounded" placeholder="Neobvezno" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sporočilo</label>
                  <textarea value={broadcastForm.content} onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})} className="w-full p-2 border rounded h-32" placeholder="Vnesite sporočilo za vse uporabnike..." />
                </div>
                <p className="text-sm text-gray-500">Sporočilo bo poslano {users.length} uporabnikom.</p>
                <Button onClick={sendBroadcast} className="w-full">
                  <SendHorizontal className="w-4 h-4 mr-2" />
                  Pošlji vsem
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Package Edit Modal */}
      <AnimatePresence>
        {showPackageModal && selectedPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Uredi paket: {selectedPackage.name}</h3>
                <button onClick={() => setShowPackageModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Naziv (SL)</label>
                  <input type="text" value={selectedPackage.name || ''} onChange={e => setSelectedPackage({...selectedPackage, name: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cena (€)</label>
                    <input type="number" step="0.01" value={selectedPackage.price || 0} onChange={e => setSelectedPackage({...selectedPackage, price: parseFloat(e.target.value)})} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min dni</label>
                    <input type="number" value={selectedPackage.min_days || 1} onChange={e => setSelectedPackage({...selectedPackage, min_days: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Zbritja (%)</label>
                    <input type="number" value={selectedPackage.discount_percent || 0} onChange={e => setSelectedPackage({...selectedPackage, discount_percent: parseInt(e.target.value)})} className="w-full p-2 border rounded" placeholder="0" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedPackage.discount_active || false} onChange={e => setSelectedPackage({...selectedPackage, discount_active: e.target.checked})} className="w-4 h-4" />
                      <span className="text-sm">Zbritja aktivna</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={updatePackage} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Shrani
                  </Button>
                  <Button variant="outline" onClick={() => setShowPackageModal(false)}>Prekliči</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
