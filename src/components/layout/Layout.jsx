import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  
  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-gray-900"
      style={{
        backgroundImage: isHomePage 
          ? "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000')"
          : "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000')",
      }}
    >
      {/* Dark overlay for all pages except homepage */}
      {!isHomePage && (
        <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#f5f6f8] -z-10" />
      )}
      {isHomePage && (
        <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#f5f6f8] -z-10" />
      )}
      
      <Header />
      <main className="flex-1 pt-16 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
