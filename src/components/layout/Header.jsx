import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, User, Heart, Car, LogOut, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/AuthContext'
import { useFavorites } from '@/lib/FavoritesContext'
import { useLanguage } from '@/lib/LanguageContext'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const { favorites } = useFavorites()
  const { language, setLanguage } = useLanguage()
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])
  
  const navLinks = [
    { href: '/cars?type=used', label: language === 'sl' ? 'Rabljena' : 'Used' },
    { href: '/cars?type=new', label: language === 'sl' ? 'Nova' : 'New' },
    { href: '/cars?fuel=Electric', label: language === 'sl' ? 'Električna' : 'Electric' },
    { href: '/financing', label: language === 'sl' ? 'Financiranje' : 'Financing' },
    { href: '/sell', label: language === 'sl' ? 'Paketti' : 'Packages' },
  ]
  
  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }
  
  const handleHeaderSearch = (e) => {
    e.preventDefault()
    if (headerSearch.trim()) {
      navigate(`/cars?q=${encodeURIComponent(headerSearch.trim())}`)
      setHeaderSearch('')
    }
  }
  
  // Check if we're on homepage
  const isHomePage = location.pathname === '/'
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-[60px]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="AvtoMarket" 
              className="h-[150px] w-auto"
            />
          </Link>
          
          {/* Desktop Navigation - show on all pages with white text */}
          <nav className="hidden md:flex items-center gap-[30px]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-white font-medium no-underline hover:text-[#ff6a00]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search - only on non-homepage */}
            {!isHomePage && (
              <form onSubmit={handleHeaderSearch} className="relative">
                <input
                  type="text"
                  placeholder={language === 'sl' ? 'Išči...' : 'Search...'}
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  className="w-28 px-2 py-1 pl-7 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff6a00] transition-all"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70" />
              </form>
            )}
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'sl' ? 'en' : 'sl')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white font-medium hover:bg-white/20 transition-colors"
            >
              {language === 'sl' ? '🇸🇮 SL' : '🇬🇧 EN'}
            </button>
            
            {/* Favorites */}
            <Link to="/favorites" className="p-2 text-white/80 hover:text-red-400 transition-colors relative">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <UserCircle className="w-8 h-8 text-[#ff6a00]" />
                  <span className="text-sm font-medium text-white">{user?.name?.split(' ')[0]}</span>
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/cars"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Car className="w-4 h-4" />
                          {language === 'sl' ? 'Pregled vozil' : 'Browse Cars'}
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          {language === 'sl' ? 'Moja plošča' : 'My Dashboard'}
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          {language === 'sl' ? 'Priljubljeni' : 'Favorites'}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          {language === 'sl' ? 'Odjava' : 'Sign Out'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                    {language === 'sl' ? 'Prijava' : 'Sign In'}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-[#ff6a00] hover:bg-[#ff7f2a]">
                    {language === 'sl' ? 'Registracija' : 'Register'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-white font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-white/10" />
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    {language === 'sl' ? 'Moja plošča' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    {language === 'sl' ? 'Odjava' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block">
                    <Button variant="secondary" className="w-full">
                      {language === 'sl' ? 'Prijava' : 'Sign In'}
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-[#ff6a00]">
                      {language === 'sl' ? 'Registracija' : 'Register'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
