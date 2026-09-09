import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#C9A84C] hover:bg-[#b8933e] text-[#0D1B2A] font-semibold shadow-[0_0_0_0_rgba(201,168,76,0.4)] hover:shadow-[0_4px_24px_rgba(201,168,76,0.35)]',
  secondary: 'bg-transparent border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D1B2A] font-semibold',
  ghost:     'bg-transparent text-[#C9A84C] hover:bg-[#C9A84C]/10 font-medium',
  danger:    'bg-[#EF4444] hover:bg-[#dc2626] text-white font-semibold',
  teal:      'bg-[#4EC9B0] hover:bg-[#38b39a] text-[#0D1B2A] font-semibold',
}

const sizeClasses: Record<Size, string> = {
  sm:  'px-4 py-2 text-sm rounded-[8px]',
  md:  'px-6 py-3 text-base rounded-[12px]',
  lg:  'px-8 py-4 text-lg rounded-[14px]',
  xl:  'px-10 py-5 text-xl rounded-[16px]',
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
