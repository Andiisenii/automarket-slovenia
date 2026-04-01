import { cn } from '@/lib/utils'

export function Badge({ 
  children, 
  variant = 'primary', 
  className = '' 
}) {
  const variants = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    accent: 'bg-accent-100 text-accent-700',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
