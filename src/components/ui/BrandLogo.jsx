import { twMerge } from 'tailwind-merge'

// Local logo paths (from public/logos folder)
const BRAND_LOGOS = {
  'Volkswagen': '/logos/vw.svg',
  'BMW': '/logos/bmw.svg',
  'Mercedes-Benz': '/logos/mercedes.svg',
  'Audi': '/logos/audi.svg',
  'Opel': '/logos/opel.svg',
  'Ford': '/logos/ford.svg',
}

export function BrandLogo({ name, className }) {
  const logoPath = BRAND_LOGOS[name]
  
  if (logoPath) {
    return (
      <img 
        src={logoPath}
        alt={name}
        className={twMerge('h-10 w-10 object-contain', className)}
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.parentElement.innerHTML = `<div style="width:40px;height:40px;background:#333;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:11px;">${name?.substring(0,3).toUpperCase() || 'BR'}</div>`
        }}
      />
    )
  }
  
  return (
    <div className={twMerge('w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500', className)}>
      {name?.charAt(0) || '?'}
    </div>
  )
}
