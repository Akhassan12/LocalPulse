import React from 'react'

type BadgeVariant = 'terra' | 'forest' | 'brass' | 'teal' | 'navy' | 'success' | 'warning' | 'danger' | 'ghost'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  terra:   'bg-[#FDEEE9] text-[#E05A38] border border-[#E05A38]/30',
  forest:  'bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30',
  brass:   'bg-[#C9A84C]/20 text-[#b8933e] border border-[#C9A84C]/40',
  teal:    'bg-[#4EC9B0]/20 text-[#38b39a] border border-[#4EC9B0]/40',
  navy:    'bg-[#0D1B2A]/10 text-[#0D1B2A] border border-[#0D1B2A]/20',
  success: 'bg-green-100 text-green-700 border border-green-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  danger:  'bg-red-100 text-red-700 border border-red-200',
  ghost:   'bg-white/10 text-white/80 border border-white/20',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs rounded-[6px]',
  md: 'px-3 py-1 text-sm rounded-[8px]',
}

export function Badge({ variant = 'navy', children, className = '', size = 'md', dot = false }: BadgeProps) {
  return (
    <span className={['inline-flex items-center gap-1.5 font-medium', variantClasses[variant], sizeClasses[size], className].join(' ')}>
      {dot && (
        <span className={['w-1.5 h-1.5 rounded-full', variant === 'success' ? 'bg-green-500' : variant === 'danger' ? 'bg-red-500' : 'bg-current'].join(' ')} />
      )}
      {children}
    </span>
  )
}

export default Badge
