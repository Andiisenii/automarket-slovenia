import { twMerge } from 'tailwind-merge'

// Brand logo data URIs (inline SVGs to ensure they always work)
const BRAND_LOGOS_DATA = {
  'Volkswagen': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23000' stroke='%23fff' stroke-width='4'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%23fff' font-family='Arial' font-size='18' font-weight='bold'%3EVW%3C/text%3E%3C/svg%3E",
  'BMW': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%230066b1' stroke='%23fff' stroke-width='4'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%23fff' font-family='Arial' font-size='16' font-weight='bold'%3EBMW%3C/text%3E%3C/svg%3E",
  'Mercedes-Benz': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23000' stroke='%23fff' stroke-width='4'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%23fff' font-family='Arial' font-size='14' font-weight='bold'%3EMB%3C/text%3E%3C/svg%3E",
  'Audi': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23000' stroke='%23fff' stroke-width='4'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%23fff' font-family='Arial' font-size='18' font-weight='bold'%3EAudi%3C/text%3E%3C/svg%3E",
  'Opel': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23000' stroke='%23fff' stroke-width='4'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%23fff' font-family='Arial' font-size='18' font-weight='bold'%3EOPEL%3C/text%3E%3C/svg%3E",
  'Ford': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23000' stroke='%23fff' stroke-width='4'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%23fff' font-family='Arial' font-size='18' font-weight='bold'%3EFord%3C/text%3E%3C/svg%3E",
}

export function BrandLogo({ name, className }) {
  const logoData = BRAND_LOGOS_DATA[name]
  
  if (logoData) {
    return (
      <img 
        src={logoData}
        alt={name}
        className={twMerge('h-10 w-10 object-contain', className)}
      />
    )
  }
  
  return (
    <div className={twMerge('w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500', className)}>
      {name?.charAt(0) || '?'}
    </div>
  )
}
