import { twMerge } from 'tailwind-merge'

// Local logo paths (from public/logos folder)
const BRAND_LOGOS = {
  'Volkswagen': '/logos/vw.jpg',
  'BMW': '/logos/bmw.png',
  'Mercedes-Benz': '/logos/mercedes.png',
  'Audi': '/logos/audi.png',
  'Opel': '/logos/opel.png',
  'Ford': '/logos/ford.png',
}

export function BrandLogo({ name, className, showLabel = false }) {
  const logoPath = BRAND_LOGOS[name]
  
  if (logoPath) {
    return (
      <div className={twMerge('flex flex-col items-center gap-1', className)}>
        <img 
          src={logoPath}
          alt={name}
          className="h-12 w-auto object-contain"
        />
        {showLabel && (
          <span className="text-xs text-gray-600 font-medium">{name}</span>
        )}
      </div>
    )
  }
  
  return (
    <div className={twMerge('w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500', className)}>
      {name?.charAt(0) || '?'}
    </div>
  )
}
