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
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-150',
        active
          ? 'bg-[#E05A38] text-white shadow-sm ring-1 ring-[#E05A38]'
          : 'bg-[#F5F2EB] text-[#36363D] hover:bg-[#EDE8DF] border border-[#E6E0D6]',
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
