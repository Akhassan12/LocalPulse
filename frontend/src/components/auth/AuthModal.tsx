import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal } = useUIStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isLogin = authModalTab === 'login'

  const reset = () => {
    setEmail(''); setPassword(''); setName('')
    setError(null); setSuccess(null); setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        closeAuthModal()
        reset()
        navigate('/discover')
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        })
        if (err) throw err
        setSuccess('Account created! Check your email to confirm, then sign in.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={authModalOpen} onClose={() => { closeAuthModal(); reset() }} size="sm">
      {/* Tab switcher */}
      <div className="flex rounded-[12px] bg-[#F5EDD6] p-1 mb-6">
        {(['login', 'signup'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { openAuthModal(tab); setError(null) }}
            className={[
              'flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-200',
              authModalTab === tab
                ? 'bg-[#0D1B2A] text-[#C9A84C] shadow-sm'
                : 'text-[#1A2B3C]/60 hover:text-[#0D1B2A]',
            ].join(' ')}
          >
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {!isLogin && (
          <Input
            label="Your Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mia Jensen"
            leftIcon={<User size={16} />}
            autoComplete="name"
          />
        )}

        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          autoComplete="email"
        />

        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button type="button" onClick={() => setShowPass(!showPass)} className="pointer-events-auto cursor-pointer" aria-label={showPass ? 'Hide password' : 'Show password'}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />

        {error && (
          <p role="alert" className="text-sm text-[#EF4444] bg-[#EF4444]/10 rounded-[8px] px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-sm text-green-700 bg-green-50 rounded-[8px] px-3 py-2">
            {success}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full justify-center mt-2"
          icon={<ArrowRight size={16} />}
          iconPosition="right"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      {isLogin && (
        <p className="text-center text-xs text-[#1A2B3C]/50 mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => openAuthModal('signup')}
            className="text-[#C9A84C] font-medium hover:underline"
          >
            Sign up free
          </button>
        </p>
      )}
    </Modal>
  )
}
