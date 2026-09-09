import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, containerClassName = '', className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={['flex flex-col gap-1.5', containerClassName].join(' ')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#1A2B3C]">
            {label}
            {props.required && <span className="text-[#C9A84C] ml-1" aria-hidden>*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2B3C]/40 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-[10px] border bg-white px-4 py-3 text-[#1A2B3C] text-base transition-all duration-150',
              'placeholder:text-[#1A2B3C]/40',
              'focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]',
              error ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : 'border-[#E8F0F7] hover:border-[#C9A84C]/40',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            ].join(' ')}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            aria-invalid={!!error}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A2B3C]/40 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p id={`${inputId}-error`} className="text-sm text-[#EF4444]" role="alert">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-sm text-[#1A2B3C]/50">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input
