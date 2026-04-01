import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, Car, DollarSign, BarChart3, Edit, Package, Bell, 
  Send, Mail, ToggleLeft, ToggleRight, Shield, Trash2, Eye, TrendingUp, LogOut, X, Save, RefreshCw, Plus, Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'
import { formatPrice } from '@/lib/utils'
import { API_URL } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'

// Fallback demo data (when API fails)
const DEMO_DATA = {
  users: [
    { id: 1, name: 'Janez Novak', email: 'janez@email.si', user_type: 'private', is_verified: 1, created_at: '2024-01-15' },
    { id: 2, name: 'Auto d.o.o.', email: 'info@auto.si', user_type: 'business', is_verified: 1, created_at: '2024-02-20' },
    { id: 3, name: 'Marko Horvat', email: 'marko@email.si', user_type: 'private', is_verified: 0, created_at: '2024-03-10' },
  ],
  cars: [
    { id: 1, title: 'BMW X5 xDrive40i', brand: 'BMW', price: 45000, status: 'active', views: 1250, seller_name: 'Janez Novak', created_at: '2024-01-20' },
    { id: 2, title: 'Mercedes C220d', brand: 'Mercedes-Benz', price: 38000, status: 'active', views: 890, seller_name: 'Auto d.o.o.', created_at: '2024-02-15' },
    { id: 3, title: 'Audi A6 45 TFSI', brand: 'Audi', price: 42000, status: 'sold', views: 2100, seller_name: 'Marko Horvat', created_at: '2024-03-01' },
    { id: 4, title: 'VW Golf R', brand: 'Volkswagen', price: 35000, status: 'active', views: 650, seller_name: 'Janez Novak', created_at: '2024-03-05' },
    { id: 5, title: 'Ford Mustang GT', brand: 'Ford', price: 48000, status: 'active', views: 1800, seller_name: 'Auto d.o.o.', created_at: '2024-03-10' },
  ],
  purchases: [
    { id: 1, user_name: 'Janez Novak', package_type: 'Premium', price: 64.99, purchased_at: '2024-01-20', expires_at: '2024-02-20', status: 'active' },
    { id: 2, user_name: 'Auto d.o.o.', package_type: 'Business', price: 149.99, purchased_at: '2024-02-15', expires_at: '2024-05-15', status: 'active' },
    { id: 3, user_name: 'Marko Horvat', package_type: 'Basic', price: 34.99, purchased_at: '2024-03-01', expires_at: '2024-03-31', status: 'active' },
  ],
  messages: [
    { id: 1, sender_name: 'Test User', sender_email: 'test@email.si', message: 'Pozdravljeni! Zanima me BMW X5.', is_read: false, created_at: '2024-03-28 10:00' },
    { id: 2, sender_name: 'Janez K', sender_email: 'janez.k@email.si', message: 'Ali imate se kaksne avte?', is_read: true, created_at: '2024-03-27 15:30' },
  ],
  analytics: {
    stats: { totalUsers: 3, totalCars: 15, activeCars: 12, totalRevenue: 4567.50 },
    dailyData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      visitors: Math.floor(Math.random() * 100) + 20,
      revenue: Math.floor(Math.random() * 200) + 50
    }))
  },
  packages: {
    publishing: [
      { id: 1, name: 'Osnovni', name_en: 'Basic', price: 34.99, days: 30, max_cars: 100, active: true },
      { id: 2, name: 'Premium', name_en: 'Premium', price: 64.99, days: 30, max_cars: 999999, active: true },
    ],
    boost: {
      private: [
        { id: 'top_p', name: 'Top izbira', price: 1.50, days: 1 },
        { id: 'skok_p', name: 'Skok na vrh', price: 1.00, days: 1 },
        { id: 'featured_p', name: 'Izpostavljeno', price: 2.00, days: 3 },
      ],
      business: [
        { id: 'top_b', name: 'Top izbira', price: 3.00, days: 1 },
        { id: 'skok_b', name: 'Skok na vrh', price: 2.00, days: 1 },
        { id: 'featured_b', name: 'Izpostavljeno', price: 5.00, days: 7 },
        { id: 'gold_b', name: 'Zlato', price: 10.00, days: 30 },
      ]
    }
  }
}

// API helper with fallback
const api = {
  get: async (action) => {
    try {
      const res = await fetch(`${API_URL}/admin.php?action=${action}`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const data = await res.json()
      // If API returns error or empty, use fallback
      if (!data.success || !data.users?.length && !data.cars?.length) {
        console.log(`Using fallback data for ${action}`)
        return { success: true, ...getFallbackData(action) }
      }
      return data
    } catch (e) {
      console.log(`API failed for ${action}, using fallback`)
      return { success: true, ...getFallbackData(action) }
    }
  },
  post: async (action, data) => {
    try {
      const res = await fetch(`${API_URL}/admin.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Pinggy-No-Screen': 'true' },
        body: JSON.stringify(data)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'API error' }
    }
  }
}

function getFallbackData(action) {
  switch(action) {
    case 'users': return { users: DEMO_DATA.users }
    case 'cars': return { cars: DEMO_DATA.cars }
    case 'purchases': return { purchases: DEMO_DATA.purchases }
    case 'messages': return { messages: DEMO_DATA.messages }
    case 'analytics': return DEMO_DATA.analytics
    case 'packages': return { packages: DEMO_DATA.packages }
    default: return {}
  }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isSl = language === 'sl'
  
  // Auth check
  const [isAuthorized, setIsAuthorized] = useState(() => {
    const adminUser = localStorage.getItem('admin_user')
    const adminToken = localStorage.getItem('admin_token')
    if (!adminUser || !adminToken) return false
    try {
      const user = JSON.parse(adminUser)
      return user.role === 'admin'
    } catch { return false }
  })
  
  useEffect(() => {
    if (!isAuthorized) window.location.href = '/admin'
  }, [isAuthorized])
  
  if (!isAuthorized) return null
  
  // State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [cars, setCars] = useState([])
  const [purchases, setPurchases] = useState([])
  const [messages, setMessages] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [packages, setPackages] = useState({ publishing: [], boost: { private: [], business: [] } })
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  
  // Package editing
  const [editingPackage, setEditingPackage] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', days: '', min_days: 1, max_cars: '', features: '', discount: 0, discount_active: false })
  
  // Load data
  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, carsRes, purchasesRes, analyticsRes, packagesRes, messagesRes] = await Promise.all([
        api.get('users'),
        api.get('cars'),
        api.get('purchases'),
        api.get('analytics'),
        api.get('packages'),
        api.get('messages')
      ])
      
      if (usersRes.success) setUsers(usersRes.users || [])
      if (carsRes.success) setCars(carsRes.cars || [])
      if (purchasesRes.success) setPurchases(purchasesRes.purchases || [])
      if (analyticsRes.success) setAnalytics(analyticsRes)
      if (packagesRes.success) setPackages(packagesRes.packages || { publishing: [], boost: { private: [], business: [] } })
      if (messagesRes.success) setMessages(messagesRes.messages || [])
    } catch (err) { 
      console.error('Error loading data:', err)
    }
    setLoading(false)
    setRefreshing(false)
  }
  
  useEffect(() => { loadData() }, [])
  
  // Handlers
  const handleRefresh = () => { setRefreshing(true); loadData() }
  const handleLogout = () => {
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
    window.location.href = '/admin'
  }
  
  // Package editing
  const startEditPackage = (pkg, type) => {
    setEditingPackage({ ...pkg, type })
    setEditForm({
      name: pkg.name || '',
      name_en: pkg.name_en || '',
      price: pkg.price || '',
      days: pkg.days || pkg.duration_days || 30,
      min_days: pkg.min_days || 1,
      max_cars: pkg.max_cars || '',
      features: pkg.features || '',
      discount: pkg.discount_percent || 0,
      discount_active: pkg.discount_active || false
    })
  }
  
  const savePackage = async () => {
    if (!editingPackage) return
    try {
      const res = await fetch(`${API_URL}/admin.php?action=update_package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Pinggy-No-Screen': 'true' },
        body: JSON.stringify({ ...editForm, id: editingPackage.id, type: editingPackage.type })
      })
      const result = await res.json()
      if (result.success) {
        await loadData()
        setEditingPackage(null)
      }
    } catch (e) {
      console.error('Save package error:', e)
    }
  }
  
  const deletePackage = async (id) => {
    if (!confirm(isSl ? 'Ali ste prepričani?' : 'Are you sure?')) return
    try {
      const res = await fetch(`${API_URL}/admin.php?action=delete_package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Pinggy-No-Screen': 'true' },
        body: JSON.stringify({ id })
      })
      const result = await res.json()
      if (result.success) await loadData()
    } catch (e) {
      console.error('Delete package error:', e)
    }
  }
  
  // Filter helpers
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredCars = cars.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const tabs = [
    { id: 'dashboard', label: isSl ? 'Nadzorna plošča' : 'Dashboard', icon: TrendingUp },
    { id: 'users', label: isSl ? 'Uporabniki' : 'Users', icon: Users, count: users.length },
    { id: 'cars', label: isSl ? 'Vozila' : 'Cars', icon: Car, count: cars.length },
    { id: 'purchases', label: isSl ? 'Nakopi' : 'Purchases', icon: DollarSign, count: purchases.length },
    { id: 'messages', label: isSl ? 'Sporočila' : 'Messages', icon: Mail, count: messages.filter(m => !m.is_read).length },
    { id: 'packages', label: isSl ? 'Paketi' : 'Packages', icon: Package },
  ]
  
  const stats = analytics?.stats || { 
    totalUsers: users.length, 
    totalCars: cars.length, 
    activeCars: cars.filter(c => c.status === 'active').length, 
    totalRevenue: purchases.reduce((a, b) => a + (b.price || 0), 0) 
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">{isSl ? 'Nadzornik sistema' : 'System Administrator'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {isSl ? 'Osveži' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-300 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              {isSl ? 'Izhod' : 'Logout'}
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
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-gray-500">{isSl ? 'Nalaganje...' : 'Loading...'}</p>
            </div>
          </div>
        )}
        
        {/* Dashboard */}
        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isSl ? 'Uporabniki' : 'Users'}</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isSl ? 'Vozila' : 'Cars'}</p>
                    <p className="text-2xl font-bold">{stats.totalCars}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isSl ? 'Aktivna' : 'Active'}</p>
                    <p className="text-2xl font-bold">{stats.activeCars}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isSl ? 'Prihodki' : 'Revenue'}</p>
                    <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Charts */}
            {analytics && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4">{isSl ? 'Obiskovalci' : 'Visitors'}</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.dailyData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Area type="monotone" dataKey="visitors" stroke="#f97316" fill="#fdba74" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4">{isSl ? 'Prihodki' : 'Revenue'}</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analytics.dailyData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}
          </div>
        )}
        
        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">{isSl ? 'Uporabniki' : 'Users'} ({filteredUsers.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={isSl ? 'Išči...' : 'Search...'}
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
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Ime' : 'Name'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Tip' : 'Type'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Status' : 'Status'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Datum' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{user.id}</td>
                        <td className="px-4 py-3 font-medium text-sm">{user.name}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.user_type === 'business' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.user_type === 'business' ? (isSl ? 'Podjetje' : 'Business') : (isSl ? 'Zasebno' : 'Private')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {user.is_verified ? (isSl ? 'Potrjen' : 'Verified') : (isSl ? 'Nepotrjen' : 'Pending')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.created_at?.split(' ')[0]}</td>
                      </tr>
                    ))}
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
              <h2 className="text-xl font-semibold">{isSl ? 'Vozila' : 'Cars'} ({filteredCars.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={isSl ? 'Išči...' : 'Search...'}
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
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Naslov' : 'Title'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Brand</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Cena' : 'Price'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Status' : 'Status'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Prodajalec' : 'Seller'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCars.map(car => (
                      <tr key={car.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{car.id}</td>
                        <td className="px-4 py-3 font-medium text-sm max-w-xs truncate">{car.title}</td>
                        <td className="px-4 py-3 text-sm">{car.brand}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatPrice(car.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${car.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {car.status === 'active' ? (isSl ? 'Aktivno' : 'Active') : car.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{car.seller_name}</td>
                        <td className="px-4 py-3 text-sm">{car.views || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
        
        {/* Purchases Tab */}
        {!loading && activeTab === 'purchases' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{isSl ? 'Nakopi' : 'Purchases'} ({purchases.length})</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Uporabnik' : 'User'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Paket' : 'Package'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Cena' : 'Price'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Datum' : 'Date'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Velja do' : 'Expires'}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{isSl ? 'Status' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {purchases.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{p.id}</td>
                        <td className="px-4 py-3 font-medium text-sm">{p.user_name}</td>
                        <td className="px-4 py-3 text-sm">{p.package_type}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 text-sm">{p.purchased_at?.split(' ')[0]}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{p.expires_at?.split(' ')[0]}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
        
        {/* Messages Tab */}
        {!loading && activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{isSl ? 'Sporočila' : 'Messages'} ({messages.length})</h2>
            <div className="space-y-3">
              {messages.map(msg => (
                <Card key={msg.id} className={`p-4 ${!msg.is_read ? 'border-l-4 border-orange-500' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{msg.sender_name}</p>
                      <p className="text-sm text-gray-600">{msg.sender_email}</p>
                      <p className="mt-2">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{msg.created_at}</p>
                    </div>
                    {!msg.is_read && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">{isSl ? 'Novo' : 'New'}</span>
                    )}
                  </div>
                </Card>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-gray-500 py-8">{isSl ? 'Ni sporočil' : 'No messages'}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Packages Tab */}
        {!loading && activeTab === 'packages' && (
          <div className="space-y-6">
            {/* Publishing Packages */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{isSl ? 'Paketi za objavo' : 'Publishing Packages'}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.publishing?.map(pkg => (
                <Card key={pkg.id} className="p-5 relative">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => startEditPackage(pkg, 'publishing')} className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 mb-1">€{pkg.price}</p>
                  <p className="text-sm text-gray-600">min {pkg.min_days} {isSl ? 'ditë' : 'days'}</p>
                  <p className="text-sm text-gray-600">{isSl ? 'Max vozila:' : 'Max cars:'} {pkg.max_cars}</p>
                  {pkg.discount_percent > 0 && <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">{pkg.discount_percent}% {isSl ? 'zbritje' : 'discount'}</span>}
                </Card>
              ))}
            </div>
            
            {/* Boost Packages - Private */}
            <h2 className="text-xl font-semibold mt-8">{isSl ? 'Paketi za promocijo' : 'Boost Packages'}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">{isSl ? 'Zasebni uporabniki' : 'Private Users'}</h3>
                <div className="space-y-3">
                  {packages.boost?.private?.map(pkg => (
                    <div key={pkg.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-sm text-gray-500">€{pkg.price}/dan · min {pkg.min_days} {isSl ? 'ditë' : 'days'}</p>
                        {pkg.discount_percent > 0 && <span className="text-xs text-red-500 font-medium">-{pkg.discount_percent}%</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">€{pkg.price}</span>
                        <button onClick={() => startEditPackage(pkg, 'boost_private')} className="p-1 hover:bg-gray-200 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-5">
                <h3 className="font-semibold mb-4">{isSl ? 'Poslovni uporabniki' : 'Business Users'}</h3>
                <div className="space-y-3">
                  {packages.boost?.business?.map(pkg => (
                    <div key={pkg.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-sm text-gray-500">€{pkg.price}/dan · min {pkg.min_days} {isSl ? 'ditë' : 'days'}</p>
                        {pkg.discount_percent > 0 && <span className="text-xs text-red-500 font-medium">-{pkg.discount_percent}%</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">€{pkg.price}</span>
                        <button onClick={() => startEditPackage(pkg, 'boost_business')} className="p-1 hover:bg-gray-200 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Edit Modal */}
            {editingPackage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{isSl ? 'Uredi paket' : 'Edit Package'}</h3>
                    <button onClick={() => setEditingPackage(null)}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{isSl ? 'Naziv (SL)' : 'Name (SL)'}</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{isSl ? 'Naziv (EN)' : 'Name (EN)'}</label>
                      <input type="text" value={editForm.name_en} onChange={e => setEditForm({...editForm, name_en: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{isSl ? 'Cena (€)' : 'Price (€)'}</label>
                        <input type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full p-2 border rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{isSl ? 'Min ditë' : 'Min days'}</label>
                        <input type="number" value={editForm.min_days} onChange={e => setEditForm({...editForm, min_days: e.target.value})} className="w-full p-2 border rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{isSl ? 'Zbritje (%)' : 'Discount (%)'}</label>
                        <input type="number" value={editForm.discount} onChange={e => setEditForm({...editForm, discount: e.target.value})} className="w-full p-2 border rounded" placeholder="0" />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editForm.discount_active} onChange={e => setEditForm({...editForm, discount_active: e.target.checked})} className="w-4 h-4" />
                          <span className="text-sm">{isSl ? 'Zbritje aktive' : 'Discount active'}</span>
                        </label>
                      </div>
                    </div>
                    {editingPackage.type === 'publishing' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">{isSl ? 'Max vozil' : 'Max cars'}</label>
                        <input type="number" value={editForm.max_cars} onChange={e => setEditForm({...editForm, max_cars: e.target.value})} className="w-full p-2 border rounded" />
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button onClick={savePackage} className="flex-1">{isSl ? 'Shrani' : 'Save'}</Button>
                      <Button variant="outline" onClick={() => setEditingPackage(null)}>{isSl ? 'Prekliči' : 'Cancel'}</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}