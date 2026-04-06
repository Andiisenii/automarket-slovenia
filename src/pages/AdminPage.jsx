import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Car, DollarSign, TrendingUp, Edit, Trash2, Eye, X, Save, 
  RefreshCw, Search, Send, Mail, MessageSquare, Bell, Shield, Check,
  ChevronDown, ChevronUp, Star, Zap, Package, ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

const isSl = true // Default to Slovenian

export default function AdminPage() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
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
  
  // Search & filters
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCarModal, setShowCarModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCar, setSelectedCar] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  
  // Forms
  const [messageForm, setMessageForm] = useState({ recipientId: '', subject: '', content: '' })
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', content: '' })
  
  // Load admin user from localStorage
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
  
  // Show loading until mounted (avoids hydration mismatch)
  if (!mounted || !adminUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Nalaganje...</p>
        </div>
      </div>
    )
  }
  
  const currentUser = adminUser

  // Load data from Supabase
  const loadData = async () => {
    setLoading(true)
    try {
      const [
        usersRes, 
        carsRes, 
        packagesRes, 
        messagesRes,
        userPackagesRes
      ] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('cars').select('*').order('created_at', { ascending: false }),
        supabase.from('packages').select('*').order('type'),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
        supabase.from('user_packages').select('*')
      ])
      
      if (usersRes.data) setUsers(usersRes.data)
      if (carsRes.data) setCars(carsRes.data)
      if (packagesRes.data) setPackages(packagesRes.data)
      if (messagesRes.data) setMessages(messagesRes.data)
      
      // Group user packages by user_id
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
  
  useEffect(() => { loadData() }, [])
  
  const handleRefresh = () => { setRefreshing(true); loadData() }
  
  // Filter helpers
  const filteredUsers = users.filter(u => 
    !searchTerm || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredCars = cars.filter(c => 
    !searchTerm || 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Stats
  const stats = {
    totalUsers: users.length,
    totalCars: cars.length,
    activeCars: cars.filter(c => c.status === 'active').length,
    totalPackages: packages.length,
    unreadMessages: messages.filter(m => !m.is_read && m.recipient_id === currentUser.id).length
  }
  
  // Tabs
  const tabs = [
    { id: 'dashboard', label: 'Nadzorna plošča', icon: TrendingUp },
    { id: 'users', label: 'Uporabniki', icon: Users, count: users.length },
    { id: 'cars', label: 'Vozila', icon: Car, count: cars.length },
    { id: 'packages', label: 'Paketi', icon: Package },
    { id: 'messages', label: 'Sporočila', icon: Mail, count: stats.unreadMessages },
  ]
  
  // Get user's active packages
  const getUserActivePackages = (userId) => {
    const ups = userPackages[userId] || []
    return ups.filter(up => new Date(up.expires_at) > new Date())
  }
  
  // Send message to user
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
      loadData()
      alert('Sporočilo poslano!')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Napaka pri pošiljanju')
    }
  }
  
  // Send broadcast to all users
  const sendBroadcast = async () => {
    if (!broadcastForm.content.trim()) return
    
    try {
      // Insert broadcast
      const { data: broadcast, error: broadcastErr } = await supabase.from('broadcasts').insert({
        subject: broadcastForm.subject,
        content: broadcastForm.content,
        sent_by: currentUser.id
      }).select().single()
      
      if (broadcastErr) throw broadcastErr
      
      // Send to all users
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
      loadData()
      alert(`Sporočilo poslano ${users.length} uporabnikom!`)
    } catch (err) {
      console.error('Error sending broadcast:', err)
      alert('Napaka pri pošiljanju')
    }
  }
  
  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati uporabnika?')) return
    try {
      await supabase.from('users').delete().eq('id', userId)
      loadData()
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }
  
  // Delete car
  const deleteCar = async (carId) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati vozilo?')) return
    try {
      await supabase.from('cars').delete().eq('id', carId)
      loadData()
    } catch (err) {
      console.error('Error deleting car:', err)
    }
  }
  
  // Update package
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
      loadData()
      alert('Paket posodobljen!')
    } catch (err) {
      console.error('Error updating package:', err)
      alert('Napaka pri posodabljanju')
    }
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
        
        {/* Dashboard */}
        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uporabniki</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
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
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Aktivna</p>
                    <p className="text-2xl font-bold">{stats.activeCars}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sporočila</p>
                    <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Uporabniki ({filteredUsers.length})</h2>
              <div className="flex gap-2">
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
                <Button onClick={() => { setBroadcastForm({ subject: '', content: '' }); setShowBroadcastModal(true) }}>
                  <Send className="w-4 h-4 mr-2" />
                  Pošlji vsem
                </Button>
              </div>
            </div>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Ime</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Tip</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Paketi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Vozila</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(user => {
                      const userCars = cars.filter(c => c.user_id === user.id)
                      const userPacks = getUserActivePackages(user.id)
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{user.id}</td>
                          <td className="px-4 py-3 font-medium text-sm">{user.name}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.user_type === 'business' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {user.user_type === 'business' ? 'Podjetje' : 'Zasebno'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {userPacks.length > 0 ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                {userPacks.length} aktivni
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Ni paketa</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium">{userCars.length}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => { setSelectedUser(user); setShowUserModal(true) }}
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="Pregled"
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button 
                                onClick={() => { setMessageForm({ recipientId: user.id, subject: '', content: '' }); setShowMessageModal(true) }}
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="Sporočilo"
                              >
                                <MessageSquare className="w-4 h-4 text-gray-500" />
                              </button>
                              <button 
                                onClick={() => deleteUser(user.id)}
                                className="p-1.5 hover:bg-red-50 rounded"
                                title="Izbriši"
                              >
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
        
        {/* Cars Tab */}
        {!loading && activeTab === 'cars' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Vozila ({filteredCars.length})</h2>
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
            </div>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Naslov</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Brand</th>
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
                          <td className="px-4 py-3 text-sm">{car.id}</td>
                          <td className="px-4 py-3 font-medium text-sm max-w-xs truncate">{car.title}</td>
                          <td className="px-4 py-3 text-sm">{car.brand}</td>
                          <td className="px-4 py-3 text-sm font-medium">€{car.price?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${car.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {car.status === 'active' ? 'Aktivno' : car.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{seller?.name || 'Neznan'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => navigate(`/car/${car.id}`)}
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="Pregled"
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button 
                                onClick={() => deleteCar(car.id)}
                                className="p-1.5 hover:bg-red-50 rounded"
                                title="Izbriši"
                              >
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
        
        {/* Packages Tab */}
        {!loading && activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Paketi za objavo</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.filter(p => p.type === 'publishing').map(pkg => (
                <Card key={pkg.id} className="p-5 relative overflow-hidden">
                  {/* Discount Sticker */}
                  {pkg.discount_active && pkg.discount_percent > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      -{pkg.discount_percent}%
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    {pkg.discount_active && pkg.discount_percent > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-red-500">€{(pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)}</span>
                        <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-orange-600">€{pkg.price}</span>
                    )}
                    <span className="text-gray-500 text-sm">/mesec</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Min {pkg.min_days} dni</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => { setSelectedPackage(pkg); setShowPackageModal(true) }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Uredi
                  </Button>
                </Card>
              ))}
            </div>
            
            <h2 className="text-xl font-semibold mt-8">Paketi za promocijo - Zasebni</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.filter(p => p.type === 'boost_private').map(pkg => (
                <Card key={pkg.id} className="p-5 relative overflow-hidden">
                  {pkg.discount_active && pkg.discount_percent > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      -{pkg.discount_percent}%
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    {pkg.discount_active && pkg.discount_percent > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-red-500">€{(pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)}</span>
                        <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-orange-600">€{pkg.price}</span>
                    )}
                    <span className="text-gray-500 text-sm">/dan</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Min {pkg.min_days} dni</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelectedPackage(pkg); setShowPackageModal(true) }}>
                    <Edit className="w-4 h-4 mr-2" />Uredi
                  </Button>
                </Card>
              ))}
            </div>
            
            <h2 className="text-xl font-semibold mt-8">Paketi za promocijo - Poslovni</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.filter(p => p.type === 'boost_business').map(pkg => (
                <Card key={pkg.id} className="p-5 relative overflow-hidden">
                  {pkg.discount_active && pkg.discount_percent > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      -{pkg.discount_percent}%
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    {pkg.discount_active && pkg.discount_percent > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-red-500">€{(pkg.price * (1 - pkg.discount_percent / 100)).toFixed(2)}</span>
                        <span className="text-lg text-gray-400 line-through">€{pkg.price}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-orange-600">€{pkg.price}</span>
                    )}
                    <span className="text-gray-500 text-sm">/dan</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Min {pkg.min_days} dni</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelectedPackage(pkg); setShowPackageModal(true) }}>
                    <Edit className="w-4 h-4 mr-2" />Uredi
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Messages Tab */}
        {!loading && activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sporočila ({messages.length})</h2>
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
      
      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-lg font-semibold">Uporabnik #{selectedUser.id}</h3>
                <button onClick={() => setShowUserModal(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Ime</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
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
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Aktivni paketi</p>
                  {getUserActivePackages(selectedUser.id).length > 0 ? (
                    <div className="space-y-2">
                      {getUserActivePackages(selectedUser.id).map(pack => (
                        <div key={pack.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{pack.package_name}</span>
                          <span className="text-xs text-gray-500">do {new Date(pack.expires_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Ni aktivnih paketov</p>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Vozila ({cars.filter(c => c.user_id === selectedUser.id).length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cars.filter(c => c.user_id === selectedUser.id).map(car => (
                      <div key={car.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate flex-1">{car.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${car.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
                          {car.status}
                        </span>
                      </div>
                    ))}
                  </div>
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
                  <Send className="w-4 h-4 mr-2" />
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
                  <Send className="w-4 h-4 mr-2" />
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
                <h3 className="text-lg font-semibold">Uredi paket</h3>
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
