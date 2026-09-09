import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal' | 'glass' | 'brass' | 'outline'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#C9A84C] hover:bg-[#E5C365] active:bg-[#B8933E] text-[#0D1B2A] font-bold shadow-[0_0_16px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_24px_rgba(201,168,76,0.45)] border border-[#C9A84C]/60',
  brass:     'bg-[#C9A84C] hover:bg-[#E5C365] active:bg-[#B8933E] text-[#0D1B2A] font-bold shadow-[0_0_16px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_24px_rgba(201,168,76,0.45)] border border-[#C9A84C]/60',
  secondary: 'bg-white/[0.06] border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D1B2A] font-semibold backdrop-blur-md',
  glass:     'bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#4EC9B0]/50 text-white hover:text-[#4EC9B0] font-medium backdrop-blur-md shadow-sm',
  outline:   'bg-transparent border border-white/20 text-white/90 hover:border-[#C9A84C] hover:text-[#C9A84C] font-medium',
  ghost:     'bg-transparent text-[#C9A84C] hover:bg-[#C9A84C]/10 font-medium',
  danger:    'bg-[#EF4444] hover:bg-[#dc2626] text-white font-semibold shadow-md',
  teal:      'bg-[#4EC9B0] hover:bg-[#38b39a] text-[#0D1B2A] font-bold shadow-[0_0_16px_rgba(78,201,176,0.25)]',
}

const sizeClasses: Record<Size, string> = {
  xs:  'px-3 py-1.5 text-xs rounded-lg',
  sm:  'px-4 py-2 text-xs font-semibold rounded-xl',
  md:  'px-5 py-2.5 text-sm rounded-xl',
  lg:  'px-7 py-3.5 text-base rounded-xl',
  xl:  'px-9 py-4 text-lg rounded-2xl',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-[#C9A84C] focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
