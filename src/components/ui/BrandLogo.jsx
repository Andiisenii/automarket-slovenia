import { twMerge } from 'tailwind-merge'

// Brand logo URLs (dark mode versions from Wikipedia)
const BRAND_LOGOS = {
  'Volkswagen': 'https://cdn.jsdelivr.net/gh/vscode-stylelint/vscode-stylelint@main/logos/Volkswagen.png',
  'BMW': 'https://cdn.jsdelivr.net/gh/vscode-stylelint/vscode-stylelint@main/logos/BMW.png',
  'Mercedes-Benz': 'https://cdn.jsdelivr.net/gh/vscode-stylelint/vscode-stylelint@main/logos/Mercedes.png',
  'Audi': 'https://cdn.jsdelivr.net/gh/vscode-stylelint/vscode-stylelint@main/logos/Audi.png',
  'Opel': 'https://cdn.jsdelivr.net/gh/vscode-stylelint/vscode-stylelint@main/logos/Opel.png',
  'Ford': 'https://cdn.jsdelivr.net/gh/vscode-stylelint/vscode-stylelint@main/logos/Ford.png',
}

// Fallback SVG logos as data URIs
const BRAND_SVGS = {
  'Volkswagen': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#000" stroke="#fff" stroke-width="3"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-family="Arial" font-size="14" font-weight="bold">VW</text></svg>`,
  'BMW': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#0066b1" stroke="#fff" stroke-width="3"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16" font-weight="bold">BMW</text></svg>`,
  'Mercedes-Benz': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#000" stroke="#fff" stroke-width="3"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-family="Arial" font-size="12" font-weight="bold">Mercedes</text></svg>`,
  'Audi': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#000" stroke="#fff" stroke-width="3"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16" font-weight="bold">Audi</text></svg>`,
  'Opel': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#000" stroke="#fff" stroke-width="3"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16" font-weight="bold">OPEL</text></svg>`,
  'Ford': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#000" stroke="#fff" stroke-width="3"/><text x="50" y="58" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16" font-weight="bold">Ford</text></svg>`,
}

export function BrandLogo({ name, className }) {
  return (
    <div className={twMerge('w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden', className)}>
      <span className="text-white font-bold text-xs">{name?.substring(0, 3).toUpperCase()}</span>
    </div>
  )
}
