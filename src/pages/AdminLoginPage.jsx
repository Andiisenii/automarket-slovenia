import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/lib/LanguageContext'
import { API_URL } from '@/lib/api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isSl = language === 'sl'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Pinggy-No-Screen': 'true'
        },
        body: JSON.stringify({ 
          action: 'login', 
          email, 
          password 
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.user && data.user.role === 'admin') {
        const token = 'admin_' + Date.now()
        localStorage.setItem('automarket_admin_token', token)
        localStorage.setItem('automarket_admin_user', JSON.stringify(data.user))
        navigate('/admin-panel')
      } else {
        setError(isSl ? 'Neveljaven email ali geslo' : 'Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(isSl ? 'Napaka pri povezavi' : 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => navigate('/')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={goBack} className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {isSl ? 'Nazaj' : 'Back'}
        </button>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 mt-2">{isSl ? 'Prijava za administratorje' : 'Administrator login'}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{isSl ? 'Email' : 'Email'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email" 
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="admin@automarket.si"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{isSl ? 'Geslo' : 'Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password" 
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSl ? 'Prijava' : 'Login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
