import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Phone, Shield, CreditCard, Lock, HelpCircle, Info, Send, Car, Globe } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'

export function Footer() {
  const { user } = useAuth()
  const { language, setLanguage } = useLanguage()
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    surname: '',
    phone: user?.phone || '',
    email: user?.email || '',
    comment: '',
    screenshot: null
  })
  const [submitting, setSubmitting] = useState(false)

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setContactForm({ ...contactForm, screenshot: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    // Save to localStorage for admin panel
    const newMessage = {
      id: Date.now(),
      name: contactForm.name,
      surname: contactForm.surname,
      email: contactForm.email,
      phone: contactForm.phone,
      comment: contactForm.comment,
      screenshot: contactForm.screenshot,
      sentAt: new Date().toISOString(),
      reply: null
    }
    const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]')
    localStorage.setItem('adminMessages', JSON.stringify([newMessage, ...existingMessages]))
    
    // Simulate submission
    setTimeout(() => {
      alert(language === 'sl' 
        ? '✅ Vaše sporočilo je bilo poslano! Odgovorili vam bomo v najkrajšem času.'
        : '✅ Your message has been sent! We will respond as soon as possible.')
      setShowContactModal(false)
      setContactForm({
        name: user?.name || '',
        surname: '',
        phone: user?.phone || '',
        email: user?.email || '',
        comment: '',
        screenshot: null
      })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <>
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Car className="w-6 h-6 text-orange-500" />
                AutoMarket Slovenia
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                {language === 'sl' 
                  ? 'AutoMarket je vodilna platforma za nakup in prodajo vozil v Sloveniji. Povezujemo kupce in prodajalce vozil na enem mestu - hitro, varno in enostavno.'
                  : 'AutoMarket is the leading platform for buying and selling vehicles in Slovenia. We connect buyers and sellers in one place - fast, safe and easy.'}
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-white">{language === 'sl' ? 'Varen nakup' : 'Safe Purchase'}</span> - {language === 'sl' ? 'Preverjena vozila in prodajalci' : 'Verified vehicles and sellers'}
                </p>
                <p className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-white">{language === 'sl' ? 'Varno plačilo' : 'Secure Payment'}</span> - {language === 'sl' ? 'Šifrirane transakcije' : 'Encrypted transactions'}
                </p>
                <p className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-white">{language === 'sl' ? 'Zasebnost' : 'Privacy'}</span> - {language === 'sl' ? 'Vaši podatki so varovani' : 'Your data is protected'}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">{language === 'sl' ? 'Hitre povezave' : 'Quick Links'}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/cars" className="hover:text-orange-500 transition">🌐 {language === 'sl' ? 'Vsa vozila' : 'All Cars'}</Link></li>
                <li><Link to="/sell" className="hover:text-orange-500 transition">🚗 {language === 'sl' ? 'Prodaj vozilo' : 'Sell Car'}</Link></li>
                <li><Link to="/favorites" className="hover:text-orange-500 transition">❤️ {language === 'sl' ? 'Priljubljeni' : 'Favorites'}</Link></li>
                <li><Link to="/dashboard" className="hover:text-orange-500 transition">👤 {language === 'sl' ? 'Moj račun' : 'My Account'}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">{language === 'sl' ? 'Pomoč' : 'Help'}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="hover:text-orange-500 transition flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {language === 'sl' ? 'Kontaktiraj nas' : 'Contact Us'}
                  </button>
                </li>
                <li><Link to="/about" className="hover:text-orange-500 transition flex items-center gap-2">
                  <Info className="w-4 h-4" />{language === 'sl' ? 'O nas' : 'About'}
                </Link></li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@vozilo.si
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +386 40 123 456
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2026 AutoMarket Slovenia. {language === 'sl' ? 'Vse pravice pridržane.' : 'All rights reserved.'}</p>
            <div className="flex gap-4 mt-4 md:mt-0 items-center">
              <Link to="/privacy" className="hover:text-white">{language === 'sl' ? 'Zasebnost' : 'Privacy'}</Link>
              <Link to="/terms" className="hover:text-white">{language === 'sl' ? 'Pogoji' : 'Terms'}</Link>
              <button 
                onClick={() => setLanguage(language === 'sl' ? 'en' : 'sl')}
                className="flex items-center gap-1 hover:text-white"
              >
                <Globe className="w-4 h-4" />
                {language === 'sl' ? 'EN' : 'SL'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {language === 'sl' ? 'Kontaktiraj nas' : 'Contact Us'}
              </h3>
              <button onClick={() => setShowContactModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'sl' ? 'Ime *' : 'First Name *'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'sl' ? 'Priimek *' : 'Last Name *'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.surname}
                    onChange={(e) => setContactForm({...contactForm, surname: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'sl' ? 'Email (registriran) *' : 'Email (registered) *'}
                </label>
                <input 
                  type="email" 
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'sl' ? 'Telefon' : 'Phone'}
                </label>
                <input 
                  type="tel" 
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'sl' ? 'Opis problema *' : 'Problem Description *'}
                </label>
                <textarea 
                  required
                  rows={4}
                  value={contactForm.comment}
                  onChange={(e) => setContactForm({...contactForm, comment: e.target.value})}
                  placeholder={language === 'sl' ? 'Opišite vaš problem...' : 'Describe your problem...'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'sl' ? 'Priložite screenshot (opcijsko)' : 'Attach screenshot (optional)'}
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:cursor-pointer"
                />
                {contactForm.screenshot && (
                  <img src={contactForm.screenshot} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                )}
              </div>
              
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (language === 'sl' ? 'Pošiljanje...' : 'Sending...') : (
                  <>
                    <Send className="w-4 h-4" />
                    {language === 'sl' ? 'Pošlji sporočilo' : 'Send Message'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
