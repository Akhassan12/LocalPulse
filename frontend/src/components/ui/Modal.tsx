import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, children, size = 'md', showCloseButton = true }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0D1B2A]/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className={['relative w-full bg-white rounded-[20px] shadow-[0_8px_48px_rgba(13,27,42,0.32)] animate-fade-in-up', sizeClasses[size]].join(' ')}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-[#E8F0F7]">
            {title && <h2 className="font-display text-xl text-[#0D1B2A]">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#E8F0F7] transition-colors text-[#1A2B3C]/60 hover:text-[#0D1B2A]"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
