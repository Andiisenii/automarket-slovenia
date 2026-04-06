import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthContext'
import { CarProvider } from '@/lib/CarContext'
import { FavoritesProvider } from '@/lib/FavoritesContext'
import { MessagesProvider } from '@/lib/MessagesContext'
import { LanguageProvider } from '@/lib/LanguageContext'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { CarsPage } from '@/pages/CarsPage'
import { CarDetailPage } from '@/pages/CarDetailPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SellPage } from '@/pages/SellPage'
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/AuthPages'
import { AddCarPage } from '@/pages/AddCarPage'
import { PaymentPage } from '@/pages/PaymentPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import AdminLoginPage from '@/pages/AdminLoginPage'
import AdminPage from '@/pages/AdminPage'
import { AboutPage } from '@/pages/AboutPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { FinancingPage } from '@/pages/FinancingPage'
import { CookieConsent } from '@/components/features/CookieConsent'

import { useState, useEffect } from 'react'

function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('automarket_user')
      if (storedAuth) {
        setAuth(JSON.parse(storedAuth))
      } else {
        window.location.href = '/login'
      }
    } catch (e) {
      window.location.href = '/login'
    }
    setLoading(false)
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }
  
  if (!auth) return null
  return children
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CarProvider>
          <FavoritesProvider>
            <MessagesProvider>
              <Router 
                future={{ 
                  v7_startTransition: true, 
                  v7_relativeSplatPath: true 
                }}
              >
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="cars" element={<CarsPage />} />
                    <Route path="cars/:id" element={<CarDetailPage />} />
                    <Route path="sell" element={<SellPage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="financing" element={<FinancingPage />} />
                    <Route path="cars" element={<FinancingPage />} />
                  </Route>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/add-car" element={<ProtectedRoute><AddCarPage /></ProtectedRoute>} />
                  <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route path="/admin-panel" element={<AdminPage />} />
                </Routes>
                <CookieConsent />
              </Router>
            </MessagesProvider>
          </FavoritesProvider>
        </CarProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App