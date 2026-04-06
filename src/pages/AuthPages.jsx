import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Check, Star, Zap } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { API_URL } from '@/lib/api'
import { supabase } from '@/lib/supabase'

const pricingPlans = [
  {
    id: 'basic',
    name: 'Osnovni Oglas',
    price: 5,
    duration: 30,
    features: [
      'Standardna objava',
      'Osnovni statistiki',
      '5 fotografij vključeno',
    ],
  },
  {
    id: 'featured',
    name: 'Predstavljen Oglas',
    price: 12,
    duration: 30,
    popular: true,
    features: [
      'Namestitev na prvi strani',
      'Prednost v iskanju',
      '10 fotografij vključeno',
      'Osnovni statistiki',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Oglas',
    price: 20,
    duration: 30,
    features: [
      'Prednost na prvi strani in v iskanju',
      'Poudarjena objava',
      '20 fotografij vključeno',
      'Napredna analitika',
      'Promocija na socialnih medijih',
    ],
  },
]

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Prosim izpolnite vsa polja')
      return
    }
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Napaka pri prijavi')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="AvtoMarket" className="h-[50px] w-auto" />
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dobrodošli nazaj</h1>
          <p className="text-gray-600 mb-8">Prijavite se v svoj račun</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email naslov
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                placeholder="vas@email.com"
                style={{ boxShadow: 'none' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geslo
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#ff6a00] focus:ring-[#ff6a00]" />
                <span className="ml-2 text-sm text-gray-600">Zapomni si me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#ff6a00] hover:underline">
                Pozabljeno geslo?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#ff6a00] text-white font-semibold rounded-xl hover:bg-[#ff7f2a] transition-colors"
            >
              Prijava
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Še nimate računa?{' '}
            <Link to="/register" className="text-[#ff6a00] font-semibold hover:underline">
              Registracija
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Packages */}
      {role === 'seller' && (
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-black via-gray-900 to-black p-8 items-center justify-center">
          <div className="max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Izberite paket za prodajo
            </h2>

            <div className="space-y-4">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-colors ${
                    plan.popular ? 'ring-2 ring-[#ff6a00]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {plan.popular && (
                        <span className="bg-[#ff6a00] text-white text-xs px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 inline mr-1" />
                          Priporočeno
                        </span>
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-400">{plan.duration} dni</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#ff6a00]">€{plan.price}</span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+386') // Default Slovenia
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('private') // 'private' or 'business'
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  // Country codes with flags
  const countries = [
    { code: '+386', name: 'Slovenija', flag: '🇸🇮' },
    { code: '+383', name: 'Kosovo', flag: '🇽🇰' },
    { code: '+389', name: 'Makedonija', flag: '🇲🇰' },
    { code: '+381', name: 'Srbija', flag: '🇷🇸' },
    { code: '+387', name: 'BiH', flag: '🇧🇦' },
    { code: '+43', name: 'Avstrija', flag: '🇦🇹' },
    { code: '+49', name: 'Nemčija', flag: '🇩🇪' },
    { code: '+39', name: 'Italija', flag: '🇮🇹' },
    { code: '+44', name: 'VB', flag: '🇬🇧' },
    { code: '+1', name: 'ZDA', flag: '🇺🇸' },
    { code: '+420', name: 'Češka', flag: '🇨🇿' },
    { code: '+36', name: 'Madžarska', flag: '🇭🇺' },
    { code: '+421', name: 'Slovaška', flag: '🇸🇰' },
    { code: '+385', name: 'Hrvaška', flag: '🇭🇷' },
  ]

  const getCountryByCode = (code) => {
    return countries.find(c => code.startsWith(c.code.replace('+', ''))) || countries[0]
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    // Auto-detect country code based on input
    const detected = countries.find(c => value.startsWith(c.code))
    if (detected) {
      setCountryCode(detected.code)
      setPhone(value)
    } else {
      setPhone(value)
    }
  }

  const handleCountrySelect = (code) => {
    setCountryCode(code)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !surname || !email || !password) {
      setError('Prosim izpolnite vsa polja')
      return
    }
    const fullName = `${name} ${surname}`

    // Register user with selected user type
    try {
      const result = await register({
        name: fullName,
        username: username || fullName.replace(/\s+/g, '_').toLowerCase(),
        phone: countryCode + ' ' + phone,
        email,
        password,
        role: 'buyer',
        userType: userType
      })

      // Redirect to dashboard after successful registration
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="AvtoMarket" className="h-[50px] w-auto" />
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ustvari račun</h1>
          <p className="text-gray-600 mb-8">Registrirajte se za dostop do vseh funkcij</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ime
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                placeholder="Janez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priimek
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                placeholder="Novak"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uporabniško ime
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                placeholder="janez_novak"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefonska številka
              </label>
              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => document.getElementById('country-dropdown').classList.toggle('hidden')}
                    className="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors min-w-[100px]"
                  >
                    <span>{countries.find(c => c.code === countryCode)?.flag}</span>
                    <span className="text-sm text-gray-600">{countryCode}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    id="country-dropdown"
                    className="hidden absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
                  >
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          handleCountrySelect(country.code)
                          document.getElementById('country-dropdown').classList.add('hidden')
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        <span>{country.flag}</span>
                        <span className="text-sm">{country.name}</span>
                        <span className="ml-auto text-xs text-gray-400">{country.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Phone Input */}
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                  placeholder="40 123 456"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email naslov
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                placeholder="vas@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geslo
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Business account only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vrsta računa
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('business')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    userType === 'business'
                      ? 'border-[#ff6a00] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏢</div>
                    <div className="font-medium text-gray-900">Podjetje</div>
                    <div className="text-xs text-gray-500">Biznis</div>
                  </div>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-[#ff6a00] text-white font-semibold rounded-xl hover:bg-[#ff7f2a] transition-colors"
            >
              Ustvari račun
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Že imate račun?{' '}
            <Link to="/login" className="text-[#ff6a00] font-semibold hover:underline">
              Prijava
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Welcome Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-black via-gray-900 to-black p-8 items-center justify-center">
        <div className="max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Dobrodošli v AvtoMarket
          </h2>
          <p className="text-gray-400">
            Največja platforma za prodajo vozil v Sloveniji
          </p>
        </div>
      </div>
    </div>
  )
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState('email') // 'email' | 'success'
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Check if we have a reset token in URL (from email link)
  const hasResetToken = typeof window !== 'undefined' && window.location.hash.includes('access_token')

  const handleSendResetEmail = async (e) => {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        setError(error.message || 'Napaka pri pošiljanju')
      } else {
        setEmailSent(true)
      }
    } catch (err) {
      setError('Napaka povezave. Poskusite znova.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Geslo mora imeti vsaj 6 znakov')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Gesli se ne ujemata')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setError(error.message || 'Napaka pri ponastavitvi')
      } else {
        setStep('success')
      }
    } catch (err) {
      setError('Napaka povezave. Poskusite znova.')
    } finally {
      setLoading(false)
    }
  }

  // Step: Success
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Geslo ponastavljeno!</h1>
          <p className="text-gray-600 mb-8">
            Vase geslo je bilo uspesno spremenjeno.
          </p>
          <Link to="/login">
            <button className="w-full py-3 bg-[#ff6a00] text-white font-semibold rounded-xl hover:bg-[#ff7f2a] transition-colors">
              Nadaljuj na prijavo
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // Step: Email sent confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="Vozilo.si" className="h-[50px] w-auto" />
          </Link>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-green-700 font-semibold">E-poshta poslana!</p>
            </div>
            <p className="text-green-600 text-sm">
              Poslali smo povezavo za ponastavitev gesla na <strong>{email}</strong>
            </p>
            <p className="text-green-600 text-sm mt-2">
              Preverite svojo e-poshto in kliknite povezavo za ponastavitev gesla.
            </p>
          </div>

          <p className="text-center mt-6 text-gray-600">
            Niste prejeli e-poste?{' '}
            <button 
              onClick={() => setEmailSent(false)} 
              className="text-[#ff6a00] font-semibold hover:underline"
            >
              Poslji znova
            </button>
          </p>

          <p className="text-center mt-4 text-gray-600">
            <Link to="/login" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Nazaj na prijavo
            </Link>
          </p>
        </motion.div>
      </div>
    )
  }

  // Step: Enter email
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2.5 mb-8">
          <img src="/logo.png" alt="Vozilo.si" className="h-[50px] w-auto" />
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pozabljeno geslo?</h1>
        <p className="text-gray-600 mb-8">
          Vnesite svoj e-naslov in poslali vam bomo povezavo za ponastavitev.
        </p>

        <form onSubmit={handleSendResetEmail} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-naslov
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent"
              placeholder="vas@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#ff6a00] text-white font-semibold rounded-xl hover:bg-[#ff7f2a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Pošiljanje...' : 'Poslji povezavo'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Se spomnite gesla?{' '}
          <Link to="/login" className="text-[#ff6a00] font-semibold hover:underline">
            Prijavite se
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
