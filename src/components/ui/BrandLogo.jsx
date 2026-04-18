import { twMerge } from 'tailwind-merge'

// Brand logo URLs from mobile.de CDN (dark mode versions)
const BRAND_LOGOS = {
  'Volkswagen': 'https://verkaufen.a/fahrzeug/static/assets/logos/VWDarkMode.png',
  'BMW': 'https://verkaufen.a/fahrzeug/static/assets/logos/BMWDarkMode.png',
  'Mercedes-Benz': 'https://verkaufen.a/fahrzeug/static/assets/logos/MercedesDarkMode.png',
  'Audi': 'https://verkaufen.a/fahrzeug/static/assets/logos/AudiDarkMode.png',
  'Opel': 'https://verkaufen.a/fahrzeug/static/assets/logos/OpelDarkMode.png',
  'Ford': 'https://verkaufen.a/fahrzeug/static/assets/logos/FordDarkMode.png',
}

export function BrandLogo({ name, className }) {
  const logoUrl = BRAND_LOGOS[name]
  
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={name}
        className={twMerge('h-10 w-auto object-contain', className)}
      />
    )
  }
  
  return (
    <div className={twMerge('w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500', className)}>
      {name?.charAt(0) || '?'}
    </div>
  )
}
