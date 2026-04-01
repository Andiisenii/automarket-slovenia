import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Select({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select...',
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedOption = options.find(opt => opt.value === value)
  
  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all duration-200 flex items-center justify-between'
        )}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          'w-5 h-5 text-gray-400 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                  'flex items-center justify-between',
                  value === option.value && 'bg-primary-50 text-primary-700'
                )}
              >
                {option.label}
                {value === option.value && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
