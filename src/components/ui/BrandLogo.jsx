import { twMerge } from 'tailwind-merge'

// Brand logo URLs (dark mode versions)
const BRAND_LOGOS = {
  'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Volkswagen_Logo_1964.svg',
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
  'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
  'Audi': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo.svg',
  'Opel': 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Opel-logo.svg',
  'Ford': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_Oval_Logo.svg',
}

export function BrandLogo({ name, className }) {
  const logoUrl = BRAND_LOGOS[name]
  
  if (!logoUrl) {
    return (
      <div className={twMerge('w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500', className)}>
        {name?.charAt(0) || '?'}
      </div>
    )
  }
  
  return (
    <img 
      src={logoUrl} 
      alt={name}
      className={twMerge('w-10 h-10 object-contain', className)}
      onError={(e) => {
        e.target.style.display = 'none'
        e.target.parentElement.innerHTML = `<div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">${name?.charAt(0) || '?'}</div>`
      }}
    />
  )
}
