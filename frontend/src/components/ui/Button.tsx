import React from 'react'

type Variant =
  | 'primary'    // Terracotta filled — main CTA
  | 'forest'     // Forest Slate filled — secondary CTA
  | 'secondary'  // Ghost with terracotta border
  | 'ghost'      // No border, text only
  | 'glass'      // Light frosted glass (warm)
  | 'outline'    // Thin border neutral
  | 'danger'     // Red destructive
  // Dark mode variants (kept for Auth / dark page contexts)
  | 'brass'      // Legacy gold — dark bg
  | 'teal'       // Legacy teal — dark bg
  | 'dark-ghost' // White ghost — dark bg

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#E05A38] hover:bg-[#E86B4B] active:bg-[#CC4F2F] text-white font-semibold shadow-sm hover:shadow-[0_4px_16px_rgba(224,90,56,0.30)] border border-transparent hover:-translate-y-px',
  forest:
    'bg-[#3B5249] hover:bg-[#2E4039] active:bg-[#263830] text-white font-semibold shadow-sm hover:shadow-[0_4px_16px_rgba(59,82,73,0.25)] border border-transparent hover:-translate-y-px',
  secondary:
    'bg-transparent border border-[#E6E0D6] text-[#36363D] hover:bg-[#F5F2EB] hover:border-[#D4CCC0] font-medium',
  glass:
    'bg-[#F5F2EB] hover:bg-[#EDE8DF] border border-[#E6E0D6] text-[#36363D] hover:text-[#1A1A1E] font-medium',
  ghost:
    'bg-transparent text-[#E05A38] hover:bg-[#FDEEE9] font-medium border border-transparent',
  outline:
    'bg-transparent border border-[#E6E0D6] text-[#75747A] hover:border-[#D4CCC0] hover:text-[#36363D] font-medium',
  danger:
    'bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold shadow-sm hover:-translate-y-px',
  // ── Dark-context variants ──
  brass:
    'bg-[#C9A84C] hover:bg-[#E5C365] active:bg-[#B8933E] text-[#0D1B2A] font-bold shadow-[0_0_16px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_24px_rgba(201,168,76,0.45)] border border-[#C9A84C]/60',
  teal:
    'bg-[#4EC9B0] hover:bg-[#38B39A] text-[#0D1B2A] font-bold shadow-[0_0_16px_rgba(78,201,176,0.25)]',
  'dark-ghost':
    'bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white hover:text-white font-medium backdrop-blur-md',
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-xs font-semibold rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-[10px]',
  lg: 'px-7 py-3.5 text-base rounded-xl',
  xl: 'px-9 py-4 text-lg rounded-2xl',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-[#E05A38] focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
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
