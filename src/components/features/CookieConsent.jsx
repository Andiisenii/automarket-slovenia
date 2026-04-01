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
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold mb-2">🍪 Cookie Settings</h3>
              <p className="text-sm text-gray-600">
                We use cookies to improve your experience. You can choose which cookies you want to accept.
              </p>
            </div>
          </div>
          
          {!showPreferences ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptAll}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                ✅ Accept All
              </button>
              <button
                onClick={declineAll}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                ❌ Decline Optional
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                ⚙️ Custom Settings
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
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2 border-b">
        <div>
          <p className="font-medium">Necessary Cookies</p>
          <p className="text-sm text-gray-500">Required for the site to work</p>
        </div>
        <input type="checkbox" checked disabled className="w-5 h-5" />
      </div>
      
      <div className="flex items-center justify-between py-2 border-b">
        <div>
          <p className="font-medium">Analytics</p>
          <p className="text-sm text-gray-500">Help us improve the site</p>
        </div>
        <input 
          type="checkbox" 
          checked={prefs.analytics}
          onChange={(e) => setPrefs({...prefs, analytics: e.target.checked})}
          className="w-5 h-5 accent-green-600" 
        />
      </div>
      
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="font-medium">Marketing</p>
          <p className="text-sm text-gray-500">Used for personalized ads</p>
        </div>
        <input 
          type="checkbox" 
          checked={prefs.marketing}
          onChange={(e) => setPrefs({...prefs, marketing: e.target.checked})}
          className="w-5 h-5 accent-green-600" 
        />
      </div>
      
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(prefs)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
        >
          Save Preferences
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
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
