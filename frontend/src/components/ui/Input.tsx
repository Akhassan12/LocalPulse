import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  variant?: 'light' | 'dark' | 'glass'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName = '',
      className = '',
      variant = 'light',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const isDark = variant === 'dark' || variant === 'glass'

    const labelClass = isDark
      ? 'text-sm font-medium text-white/90'
      : 'text-xs font-bold uppercase tracking-wider text-[#36363D]'

    const baseInputClass = isDark
      ? 'w-full rounded-[10px] border border-white/20 bg-white/10 px-4 py-3 text-white text-base transition-all duration-150 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]'
      : 'w-full rounded-xl border border-[#E6E0D6] bg-[#F5F2EB]/60 px-3.5 py-2.5 text-[#1A1A1E] text-sm transition-all duration-150 placeholder:text-[#9E9DA3] hover:border-[#D4CCC0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E05A38]/20 focus:border-[#E05A38]'

    const errorClass = error
      ? 'border-[#EF4444] focus:ring-[#EF4444]/30'
      : ''

    const hintClass = isDark
      ? 'text-xs text-white/50'
      : 'text-xs text-[#75747A]'

    return (
      <div className={['flex flex-col gap-1.5', containerClassName].join(' ')}>
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
            {props.required && <span className="text-[#E05A38] ml-1" aria-hidden>*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className={['absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none', isDark ? 'text-white/40' : 'text-[#1A2B3C]/40'].join(' ')}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              baseInputClass,
              errorClass,
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            ].join(' ')}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            aria-invalid={!!error}
            {...props}
          />
          {rightIcon && (
            <span className={['absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none', isDark ? 'text-white/40' : 'text-[#1A2B3C]/40'].join(' ')}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p id={`${inputId}-error`} className="text-sm text-[#EF4444]" role="alert">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className={hintClass}>{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input
