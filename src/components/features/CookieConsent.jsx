import { useState, useEffect } from 'react'

const COOKIE_KEY = 'automarket_cookies_accepted'
const COOKIE_PREFERENCES_KEY = 'automarket_cookie_preferences'

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  
  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY)
    if (!accepted) {
      setShowConsent(true)
    }
  }, [])
  
  const acceptAll = () => {
    localStorage.setItem(COOKIE_KEY, 'all')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true
    }))
    setShowConsent(false)
  }
  
  const declineAll = () => {
    localStorage.setItem(COOKIE_KEY, 'necessary')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false
    }))
    setShowConsent(false)
  }
  
  const savePreferences = (preferences) => {
    localStorage.setItem(COOKIE_KEY, 'custom')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
    setShowConsent(false)
    setShowPreferences(false)
  }
  
  if (!showConsent) return null
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" />
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 p-4 md:p-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Spletne piškotke</h3>
              <p className="text-sm text-gray-600">
                Uporabljamo piškotke za izboljšanje vaše izkušnje. Lahko izberete, katere piškotke želite sprejeti.
              </p>
            </div>
          </div>
          
          {!showPreferences ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptAll}
                className="px-6 py-2.5 bg-[#ff6a00] text-white rounded-lg font-medium hover:bg-[#ff7f2a] transition-colors shadow-sm"
              >
                Sprejmi vse
              </button>
              <button
                onClick={declineAll}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Zavrni neobvezne
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Nastavitve
              </button>
            </div>
          ) : (
            <CookiePreferences onSave={savePreferences} onCancel={() => setShowPreferences(false)} />
          )}
        </div>
      </div>
    </>
  )
}

function CookiePreferences({ onSave, onCancel }) {
  const [prefs, setPrefs] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  })
  
  return (
    <div className="space-y-4 bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between py-3 border-b border-gray-200">
        <div>
          <p className="font-medium text-gray-900">Nujni piškotki</p>
          <p className="text-sm text-gray-500">Potrebni za delovanje spletnega mesta</p>
        </div>
        <div className="relative">
          <input type="checkbox" checked disabled className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 cursor-not-allowed"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-3 border-b border-gray-200">
        <div>
          <p className="font-medium text-gray-900">Analitika</p>
          <p className="text-sm text-gray-500">Pomagajo nam izboljšati spletno stran</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={prefs.analytics}
            onChange={(e) => setPrefs({...prefs, analytics: e.target.checked})}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#ff6a00] transition-colors"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5 shadow"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium text-gray-900">Trženje</p>
          <p className="text-sm text-gray-500">Uporabljajo se za prilagojene oglase</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={prefs.marketing}
            onChange={(e) => setPrefs({...prefs, marketing: e.target.checked})}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#ff6a00] transition-colors"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5 shadow"></div>
        </label>
      </div>
      
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(prefs)}
          className="px-6 py-2.5 bg-[#ff6a00] text-white rounded-lg font-medium hover:bg-[#ff7f2a] transition-colors shadow-sm"
        >
          Shrani nastavitve
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium"
        >
          Prekliči
        </button>
      </div>
    </div>
  )
}

// Helper to check if specific cookie type is allowed
export function isCookieAllowed(type) {
  const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY)
  if (!prefs) return type === 'necessary'
  
  const parsed = JSON.parse(prefs)
  return parsed[type] || false
}
