import React from 'react'
import { X } from 'lucide-react'

interface TagProps {
  children: React.ReactNode
  onRemove?: () => void
  active?: boolean
  onClick?: () => void
  className?: string
}

export function Tag({ children, onRemove, active = false, onClick, className = '' }: TagProps) {
  return (
    <span
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
        active
          ? 'bg-[#C9A84C] text-[#0D1B2A] shadow-[0_0_12px_rgba(201,168,76,0.4)]'
          : 'bg-[#E8F0F7] text-[#1A2B3C] hover:bg-[#C9A84C]/15 hover:text-[#b8933e]',
        onClick ? 'cursor-pointer select-none' : '',
        className,
      ].join(' ')}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="hover:text-[#0D1B2A] transition-colors"
          aria-label="Remove tag"
        >
          <X size={12} />
        </button>
      )}
    </span>
  )
}

export default Tag
