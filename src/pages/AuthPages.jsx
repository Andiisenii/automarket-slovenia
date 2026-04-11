import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Check, X, User, Building2, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

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
  { code: '+385', name: 'Hrvaška', flag: '🇭🇷' },
]

// Slovenian cities for autocomplete
const slovenianCities = [
  'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper', 'Novo Mesto', 'Velenje', 'Nova Gorica',
  'Kamnik', 'Jesenice', 'Domžale', 'Škofja Loka', 'Murska Sobota', 'Izola', 'Postojna',
  'Slovenj Gradec', 'Ravne na Koroškem', 'Krško', 'Hrastnik', 'Trbovlje', 'Piran',
  'Bled', 'Bovec', 'Tolmin', 'Idrija', 'Ajdovščina', 'Sežana', 'Koper', 'Ankaran',
  'Ptuj', 'Tržič', 'Grosuplje', 'Litija', 'Trebnje', 'Sevnica', 'Laško', 'Zagorje ob Savi',
  'Brežice', 'Krško', 'Sežana', 'Divača', 'Komen', 'Miren', 'Renče', 'Kanal ob Soči',
  'Borca', 'Ivančna Gorica', 'Višnja Gora', 'Trebnje', 'Mokronog', 'Šentjur', 'Rogatec',
  'Zreče', 'Oplotnica', 'Slovenske Konjice', 'Vitanje', 'Vojnik', 'Rogatec', 'Duplek',
  'Spuhlja', 'Pragersko', 'Hajdina', 'Kidričevo', 'Majšperk', 'Videm', 'Središče ob Dravi',
  'Ormož', 'Sveti Tomaž', 'Jurovski Dol', 'Destrnik', 'Trnovska vas', 'Cerkvenjak',
  'Lovrenc na Pohorju', 'Oxblood', 'Ribnica na Pohorju', 'Muta', 'Radlje ob Dravi',
  'Mežica', 'Črna na Koroškem', 'Prevalje', 'Koroška Bela', 'Jelšane', 'Pivka',
  'Ilirska Bistrica', 'Cerknica', 'Loška dolina', 'Bloke', 'Velike Lašče', 'Ribnica',
  'Kočevje', 'Osilnica', 'Loški Potok', 'Dolenjske Toplice', 'Straža', 'Šentjernej',
  'Metlika', 'Črnomelj', 'Semič', 'Mirna', 'Mirna Peč', 'Žužemberk', 'Kostel',
  'Adlešiči', 'Belišče', 'Knezova ulica', 'Dornava', 'Juršinci', 'Markovci',
  'Kidričevo', 'Majšperk', 'Ptuj', 'Videm', 'Zavrč', 'Gorišnica', 'Hajdina',
  'Lendava', 'Turnišče', 'Črenšovci', 'Kobilje', 'Motovun', 'Odranci', 'Puconci',
  'Rogašovci', 'Sveti Jurij', 'Tipet', 'Cankova', 'Grad', 'Križevci', 'Radenci',
  'Gornja Radgona', 'Ljutomer', 'Kobilje', 'Murska Sobota', 'Veržej', 'Beltinci',
  'Križevci', 'Ljutomer', 'Ormož', 'Središče ob Dravi', 'Videm', 'Zgornja Slivnica'
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

// Input component with validation indicator
function FormInput({ label, required, value, onChange, placeholder, helpText, type = 'text', error, success }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">(*)</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 pr-10 ${
            success ? 'border-green-400 focus:ring-green-500' : 
            error ? 'border-red-400 focus:ring-red-500' : 
            'border-gray-200 focus:ring-[#ff6a00]'
          }`}
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {success && <Check className="w-5 h-5 text-green-500" />}
          {error && !success && <X className="w-5 h-5 text-red-500" />}
        </div>
      </div>
      {helpText && <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-gray-500'}`}>{helpText}</p>}
    </div>
  )
}

// City Autocomplete component
function CityInput({ label, required, value, onChange, helpText }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filtered, setFiltered] = useState([])
  
  const handleChange = (val) => {
    onChange(val)
    if (val.length > 0) {
      const filtered = slovenianCities.filter(c => 
        c.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5)
      setFiltered(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setIsOpen(false)
    }
  }
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">(*)</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value.length > 0 && setFiltered(slovenianCities.filter(c => 
          c.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5)) || setIsOpen(false)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
        placeholder={helpText || 'Izberite vašo lokacijo'}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
          {filtered.map((city, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(city); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
            >
              {city}
            </button>
          ))}
        </div>
      )}
      {helpText && !isOpen && <p className="text-xs mt-1 text-gray-500">{helpText}</p>}
    </div>
  )
}

// Country dropdown component
function CountrySelect({ label, required, value, onChange, countries }) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = countries.find(c => c.code === value) || countries[0]
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">(*)</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00] flex items-center gap-2 text-left"
        >
          <span>{selected.flag}</span>
          <span>{selected.name}</span>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => { onChange(country.code); setIsOpen(false) }}
                className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left ${value === country.code ? 'bg-orange-50' : ''}`}
              >
                <span>{country.flag}</span>
                <span className="text-sm">{country.name}</span>
                <span className="ml-auto text-xs text-gray-400">{country.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Phone input with country code
function PhoneInput({ label, required, value, onChange, helpText }) {
  const [countryCode, setCountryCode] = useState('+386')
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">(*)</span>}
      </label>
      <div className="flex gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => document.getElementById('phone-country-dropdown').classList.toggle('hidden')}
            className="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 min-w-[90px]"
          >
            <span>{countries.find(c => c.code === countryCode)?.flag}</span>
            <span className="text-sm text-gray-600">{countryCode}</span>
          </button>
          <div
            id="phone-country-dropdown"
            className="hidden absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          >
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  setCountryCode(country.code)
                  document.getElementById('phone-country-dropdown').classList.add('hidden')
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
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
          placeholder="40 123 456"
        />
      </div>
      {helpText && <p className="text-xs mt-1 text-gray-500">{helpText}</p>}
    </div>
  )
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userType, setUserType] = useState('private') // 'private' or 'business'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Private fields
  const [privateForm, setPrivateForm] = useState({
    ime: '',
    priimek: '',
    drzava: '+386',
    posta: '',
    ulica: '',
    hisna: '',
    nazivProdajalca: '',
    telefon: '',
    email: '',
    geslo: '',
    potrdiGeslo: '',
  })

  // Business fields
  const [businessForm, setBusinessForm] = useState({
    uradniNaziv: '',
    davcna: '',
    kontaktnaOseba: '',
    drzava: '+386',
    posta: '',
    naslov: '',
    nazivPoslovalnice: '',
    telefon: '',
    email: '',
    spletnaStran: '',
    geslo: '',
    potrdiGeslo: '',
  })

  // Validation states
  const [touched, setTouched] = useState({})

  // Validation for private (all fields required)
  const validatePrivate = () => {
    const errors = {}
    if (!privateForm.ime) errors.ime = true
    if (!privateForm.priimek) errors.priimek = true
    if (!privateForm.posta) errors.posta = true
    if (!privateForm.ulica) errors.ulica = true
    if (!privateForm.hisna) errors.hisna = true
    if (!privateForm.email) errors.email = true
    if (privateForm.email && !/\S+@\S+\.\S+/.test(privateForm.email)) errors.email = true
    if (!privateForm.geslo || privateForm.geslo.length < 5) errors.geslo = true
    if (privateForm.geslo !== privateForm.potrdiGeslo) errors.potrdiGeslo = true
    if (!privateForm.telefon || privateForm.telefon.replace(/\s/g, '').length < 10) errors.telefon = true
    return errors
  }

  // Validation for business
  const validateBusiness = () => {
    const errors = {}
    if (!businessForm.uradniNaziv) errors.uradniNaziv = true
    if (!businessForm.davcna) errors.davcna = true
    if (!businessForm.posta) errors.posta = true
    if (!businessForm.naslov) errors.naslov = true
    if (!businessForm.email) errors.email = true
    if (businessForm.email && !/\S+@\S+\.\S+/.test(businessForm.email)) errors.email = true
    if (!businessForm.geslo || businessForm.geslo.length < 5) errors.geslo = true
    if (businessForm.geslo !== businessForm.potrdiGeslo) errors.potrdiGeslo = true
    if (!businessForm.telefon || businessForm.telefon.replace(/\s/g, '').length < 10) errors.telefon = true
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const errors = userType === 'private' ? validatePrivate() : validateBusiness()
    if (Object.keys(errors).length > 0) {
      setError('Prosim izpolnite vsa obvezna polja pravilno')
      setLoading(false)
      return
    }

    try {
      const formData = userType === 'private' ? privateForm : businessForm
      const fullName = userType === 'private' ? `${formData.ime} ${formData.priimek}` : formData.uradniNaziv

      await register({
        name: fullName,
        username: fullName.replace(/\s+/g, '_').toLowerCase(),
        phone: formData.telefon,
        email: formData.email,
        password: formData.geslo,
        role: 'buyer',
        userType: userType,
        // Additional fields
        companyName: userType === 'business' ? formData.uradniNaziv : null,
        taxId: userType === 'business' ? formData.davcna : null,
        address: userType === 'private' ? `${formData.ulica} ${formData.hisna}, ${formData.posta}` : formData.naslov,
        city: formData.posta,
      })

      navigate('/dashboard')
    } catch (e) {
      setError(e.message || 'Napaka pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  const updatePrivate = (field, value) => {
    setPrivateForm(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const updateBusiness = (field, value) => {
    setBusinessForm(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const isFieldValid = (field, formData, isPrivate = true) => {
    if (!touched[field]) return null
    const val = formData[field]
    if (field === 'email') return /\S+@\S+\.\S+/.test(val)
    if (field === 'geslo' || field === 'potrdiGeslo') return val && val.length >= 5
    if (field === 'telefon') return val && val.replace(/\s/g, '').length >= 10
    if (field === 'potrdiGeslo') return val === formData.geslo
    return !!val
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src="/logo.png" alt="AvtoMarket" className="h-[60px] w-auto" />
          </Link>
        </div>

        {/* User Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setUserType('private')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                userType === 'private'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Zasebni
            </button>
            <button
              type="button"
              onClick={() => setUserType('business')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                userType === 'business'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Podjetje
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* PRIVATE REGISTRATION */}
          {userType === 'private' && (
            <>
              {/* Osnovni podatki */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Osnovni podatki (*)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Ime"
                    required
                    value={privateForm.ime}
                    onChange={(v) => updatePrivate('ime', v)}
                    placeholder="Janez"
                    helpText="podatek je obvezen, vendar ob objavi oglasov NE BO objavljen"
                    success={isFieldValid('ime', privateForm) === true}
                    error={isFieldValid('ime', privateForm) === false}
                  />
                  <FormInput
                    label="Priimek"
                    required
                    value={privateForm.priimek}
                    onChange={(v) => updatePrivate('priimek', v)}
                    placeholder="Novak"
                    helpText="podatek je obvezen, vendar ob objavi oglasov NE BO objavljen"
                    success={isFieldValid('priimek', privateForm) === true}
                    error={isFieldValid('priimek', privateForm) === false}
                  />
                  <CountrySelect
                    label="Država"
                    required
                    value={privateForm.drzava}
                    onChange={(v) => updatePrivate('drzava', v)}
                    countries={countries}
                  />
                  <CityInput
                    label="Pošta oz. kraj"
                    required
                    value={privateForm.posta}
                    onChange={(v) => updatePrivate('posta', v)}
                    helpText="izberite vašo lokacijo"
                  />
                  <FormInput
                    label="Ulica"
                    required
                    value={privateForm.ulica}
                    onChange={(v) => updatePrivate('ulica', v)}
                    placeholder="Dunajska"
                    helpText="podatek je obvezen, vendar ob objavi oglasov NE BO objavljen"
                    success={isFieldValid('ulica', privateForm) === true}
                    error={isFieldValid('ulica', privateForm) === false}
                  />
                  <FormInput
                    label="Hišna številka"
                    required
                    value={privateForm.hisna}
                    onChange={(v) => updatePrivate('hisna', v)}
                    placeholder="15"
                    helpText="podatek je obvezen, vendar ob objavi oglasov NE BO objavljen"
                    success={isFieldValid('hisna', privateForm) === true}
                    error={isFieldValid('hisna', privateForm) === false}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-3 rounded-lg">
                  Osnovni podatki (ime in priimek, ulica) služijo le za potrebe spoštovanja določil 6.člena ZPDZC, in ob oglasu NE BODO objavljeni.
                </p>
              </div>

              {/* Kontaktni podatki */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Kontaktni podatki za objavo ob oglasu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Naziv prodajalca"
                    value={privateForm.nazivProdajalca}
                    onChange={(v) => updatePrivate('nazivProdajalca', v)}
                    placeholder="Janez Novak"
                    helpText="podatek ni obvezen"
                  />
                  <PhoneInput
                    label="Telefon"
                    required
                    value={privateForm.telefon}
                    onChange={(v) => updatePrivate('telefon', v)}
                    helpText="Podatek je obvezen"
                  />
                  <div className="md:col-span-2">
                    <FormInput
                      label="E-mail naslov"
                      required
                      value={privateForm.email}
                      onChange={(v) => updatePrivate('email', v)}
                      placeholder="janez.novak@email.com"
                      type="email"
                      helpText="podatek je obvezen, vendar ob objavi oglasov NE BO prikazan"
                      success={isFieldValid('email', privateForm) === true}
                      error={isFieldValid('email', privateForm) === false}
                    />
                  </div>
                </div>
              </div>

              {/* Geslo */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vpišite željeno geslo (minimalno 5 znakov)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Vaše geslo <span className="text-red-500">(*)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={privateForm.geslo}
                        onChange={(e) => updatePrivate('geslo', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 pr-10 ${
                          isFieldValid('geslo', privateForm) === true ? 'border-green-400 focus:ring-green-500' :
                          isFieldValid('geslo', privateForm) === false ? 'border-red-400 focus:ring-red-500' :
                          'border-gray-200 focus:ring-[#ff6a00]'
                        }`}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ponovite geslo <span className="text-red-500">(*)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={privateForm.potrdiGeslo}
                        onChange={(e) => updatePrivate('potrdiGeslo', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 pr-10 ${
                          isFieldValid('potrdiGeslo', privateForm) === true ? 'border-green-400 focus:ring-green-500' :
                          isFieldValid('potrdiGeslo', privateForm) === false ? 'border-red-400 focus:ring-red-500' :
                          'border-gray-200 focus:ring-[#ff6a00]'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {isFieldValid('potrdiGeslo', privateForm) === false && (
                      <p className="text-xs text-red-500 mt-1">Gesli se ne ujemata</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Important notice */}
              <div className="mb-6 p-4 bg-orange-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-2">Pomembno:</p>
                <p className="text-xs text-gray-600 mb-2">
                  Bistvena prednost registracije posameznika je možnost objave oglasa. V izogib kršitvam Zakona o preprečevanju dela in zaposlovanja na črno (ZPDZC) je potrebno ob registraciji vpisati anche podatke o naročniku oglasa. Ti podatki služijo le za potrebe spoštovanja določil 6.člena ZPDZC, in ob oglasu NE BODO objavljeni.
                </p>
                <p className="text-xs text-gray-600">
                  Ob vlogi za registracijo Vas prosimo, da nam posredujete anche podpisano oz. ožigosano kopijo uradnega dokumenta, ki potrjuje registracijo podjetja oz. s.p. (vir: AJPES). Kopijo dokumenta lahko pošljete na email <a href="mailto:info@vozilo.si" className="text-[#ff6a00] underline">info@vozilo.si</a>.
                </p>
              </div>

              <div className="mb-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-sm text-gray-600">
                    Želim prejemati komentarje in ponudbe obiskovalcev na svoj e-mail naslov.
                  </span>
                </label>
              </div>

              {/* Legal checkbox 1 - Bigger */}
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 mt-1 rounded border-gray-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Izjavljam, da v primeru objave oglasa prodajam lastno vozilo/opremo kot fizična oseba posameznik in z naročilom objave ne bo oglaševano delo na črno v smislu ZPDZC.
                  </span>
                </label>
              </div>

              {/* Legal checkbox 2 - Smaller */}
              <div className="mb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-gray-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-xs text-gray-600">
                    Potrjujem seznanitev z vsebino pravnega obvestila ter se z njim v celoti strinjam.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* BUSINESS REGISTRATION */}
          {userType === 'business' && (
            <>
              {/* Uradni podatki trgovca */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Uradni podatki trgovca (*)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Uradni naziv"
                    required
                    value={businessForm.uradniNaziv}
                    onChange={(v) => updateBusiness('uradniNaziv', v)}
                    placeholder="Podjetje d.o.o."
                    helpText="podatek je obvezen"
                    success={isFieldValid('uradniNaziv', businessForm, false) === true}
                    error={isFieldValid('uradniNaziv', businessForm, false) === false}
                  />
                  <FormInput
                    label="Davčna številka"
                    required
                    value={businessForm.davcna}
                    onChange={(v) => updateBusiness('davcna', v)}
                    placeholder="SI12345678"
                    helpText="podatek je obvezen"
                    success={isFieldValid('davcna', businessForm, false) === true}
                    error={isFieldValid('davcna', businessForm, false) === false}
                  />
                  <FormInput
                    label="Kontaktna oseba"
                    required
                    value={businessForm.kontaktnaOseba}
                    onChange={(v) => updateBusiness('kontaktnaOseba', v)}
                    placeholder="Janez Novak"
                    helpText="podatek je obvezen, vendar ob objavi oglasov NE BO objavljen"
                  />
                  <CountrySelect
                    label="Država"
                    required
                    value={businessForm.drzava}
                    onChange={(v) => updateBusiness('drzava', v)}
                    countries={countries}
                  />
                  <CityInput
                    label="Pošta oz. kraj"
                    value={businessForm.posta}
                    onChange={(v) => updateBusiness('posta', v)}
                  />
                  <FormInput
                    label="Naslov"
                    required
                    value={businessForm.naslov}
                    onChange={(v) => updateBusiness('naslov', v)}
                    placeholder="Dunajska 15, 1000 Ljubljana"
                    helpText="podatek je obvezen"
                    success={isFieldValid('naslov', businessForm, false) === true}
                    error={isFieldValid('naslov', businessForm, false) === false}
                  />
                </div>
              </div>

              {/* Kontaktni podatki */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Kontaktni podatki</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Naziv poslovalnice"
                    value={businessForm.nazivPoslovalnice}
                    onChange={(v) => updateBusiness('nazivPoslovalnice', v)}
                    placeholder="Poslovalnica Ljubljana"
                    helpText="podatek ni obvezen"
                  />
                  <PhoneInput
                    label="Telefon"
                    required
                    value={businessForm.telefon}
                    onChange={(v) => updateBusiness('telefon', v)}
                  />
                  <FormInput
                    label="E-mail naslov"
                    required
                    value={businessForm.email}
                    onChange={(v) => updateBusiness('email', v)}
                    placeholder="info@podjetje.si"
                    type="email"
                    helpText="podatek je obvezen"
                    success={isFieldValid('email', businessForm, false) === true}
                    error={isFieldValid('email', businessForm, false) === false}
                  />
                  <FormInput
                    label="Spletna stran"
                    value={businessForm.spletnaStran}
                    onChange={(v) => updateBusiness('spletnaStran', v)}
                    placeholder="https://www.podjetje.si"
                    helpText="podatek ni obvezen"
                  />
                </div>
              </div>

              {/* Geslo */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vpišite željeno geslo (minimalno 5 znakov)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Vaše geslo <span className="text-red-500">(*)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={businessForm.geslo}
                        onChange={(e) => updateBusiness('geslo', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 pr-10 ${
                          isFieldValid('geslo', businessForm, false) === true ? 'border-green-400 focus:ring-green-500' :
                          isFieldValid('geslo', businessForm, false) === false ? 'border-red-400 focus:ring-red-500' :
                          'border-gray-200 focus:ring-[#ff6a00]'
                        }`}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ponovite geslo <span className="text-red-500">(*)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={businessForm.potrdiGeslo}
                        onChange={(e) => updateBusiness('potrdiGeslo', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 pr-10 ${
                          isFieldValid('potrdiGeslo', businessForm, false) === true ? 'border-green-400 focus:ring-green-500' :
                          isFieldValid('potrdiGeslo', businessForm, false) === false ? 'border-red-400 focus:ring-red-500' :
                          'border-gray-200 focus:ring-[#ff6a00]'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {isFieldValid('potrdiGeslo', businessForm, false) === false && (
                      <p className="text-xs text-red-500 mt-1">Gesli se ne ujemata</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Important notice */}
              <div className="mb-6 p-4 bg-orange-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-2">Pomembno:</p>
                <p className="text-xs text-gray-600 mb-2">
                  Ob vlogi za registracijo Vas prosimo, da nam posredujete anche podpisano oz. ožigosano kopijo uradnega dokumenta, ki potrjuje registracijo podjetja oz. s.p. (vir: AJPES).
                </p>
                <p className="text-xs text-gray-600">
                  Kopijo dokumenta lahko pošljete na email <a href="mailto:info@vozilo.si" className="text-[#ff6a00] underline">info@vozilo.si</a>.
                </p>
              </div>

              <div className="mb-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-sm text-gray-600">
                    Želim prejemati komentarje in ponudbe obiskovalcev na svoj e-mail naslov.
                  </span>
                </label>
              </div>

              {/* Legal checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                  />
                  <span className="text-sm text-gray-600">
                    Potrjujem seznanitev z vsebino pravnega obvestila ter se z njim v celoti strinjam.
                  </span>
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#ff6a00] text-white font-semibold rounded-xl hover:bg-[#ff7f2a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Registracija...' : 'Ustvari račun'}
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
  )
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

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
