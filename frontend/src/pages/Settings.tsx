import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  User,
  Wallet,
  Backpack,
  Compass,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Tag from '../components/ui/Tag'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { apiGet, apiPut } from '../lib/api'

interface TravelerProfileData {
  id?: string
  display_name: string
  traveler_type: string
  interests: string[]
  dietary_preferences: string[]
  accessibility_needs: string[]
  preferred_budget_min: number
  preferred_budget_max: number
  home_currency: string
  max_carry_capacity_kg: number
  current_carried_weight_kg: number
  liquid_cash: number
  average_daily_spend: number
  remaining_travel_days: number
  minimum_emergency_reserve: number
}

const INTEREST_OPTIONS = [
  'Hidden Alley Food', 'Heritage Architecture', 'Night Markets',
  'Artisan Workshops', 'Live Traditional Music', 'Coastal Viewpoints',
  'Tea Ceremonies', 'Underground Art', 'Secret Bars', 'Local Ceramics',
  'Antique Bazaars', 'Street Photography',
]

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free', 'No restrictions',
]

const ACCESSIBILITY_OPTIONS = [
  'Wheelchair accessible', 'Limited mobility', 'Hearing impaired', 'Visual impairment', 'None needed',
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'THB', 'JPY', 'AUD', 'CAD']

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fetch current profile from backend
  const { data: profile, isLoading } = useQuery({
    queryKey: ['traveler-profile'],
    queryFn: async () => {
      try {
        return await apiGet<TravelerProfileData>('/me/profile')
      } catch {
        // Return sensible mock/fallback if offline or newly authenticated
        return {
          display_name: user?.user_metadata?.display_name || 'Expedition Traveler',
          traveler_type: 'solo',
          interests: ['Hidden Alley Food', 'Night Markets'],
          dietary_preferences: ['No restrictions'],
          accessibility_needs: ['None needed'],
          preferred_budget_min: 20,
          preferred_budget_max: 150,
          home_currency: 'USD',
          max_carry_capacity_kg: 15,
          current_carried_weight_kg: 4.5,
          liquid_cash: 650,
          average_daily_spend: 60,
          remaining_travel_days: 8,
          minimum_emergency_reserve: 150,
        } as TravelerProfileData
      }
    },
    enabled: true,
  })

  const [interests, setInterests] = useState<string[]>([])
  const [dietary, setDietary] = useState<string[]>([])
  const [accessibility, setAccessibility] = useState<string[]>([])

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<TravelerProfileData>()

  useEffect(() => {
    if (profile) {
      reset(profile)
      setInterests(profile.interests || [])
      setDietary(profile.dietary_preferences || [])
      setAccessibility(profile.accessibility_needs || [])
    }
  }, [profile, reset])

  const toggleTag = (list: string[], setter: (v: string[]) => void, val: string) =>
    setter(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])

  const updateMutation = useMutation({
    mutationFn: async (formData: TravelerProfileData) => {
      const payload = {
        ...formData,
        interests,
        dietary_preferences: dietary,
        accessibility_needs: accessibility,
        preferred_budget_min: Number(formData.preferred_budget_min),
        preferred_budget_max: Number(formData.preferred_budget_max),
        max_carry_capacity_kg: Number(formData.max_carry_capacity_kg),
        current_carried_weight_kg: Number(formData.current_carried_weight_kg),
        liquid_cash: Number(formData.liquid_cash),
        average_daily_spend: Number(formData.average_daily_spend),
        remaining_travel_days: Number(formData.remaining_travel_days),
        minimum_emergency_reserve: Number(formData.minimum_emergency_reserve),
      }
      return await apiPut('/me/profile', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traveler-profile'] })
      setSuccessMsg('Profile updated successfully.')
      setErrorMsg(null)
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update profile.')
      setSuccessMsg(null)
    },
  })

  const onSubmit = (data: TravelerProfileData) => {
    updateMutation.mutate(data)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white selection:bg-[#C9A84C]/30 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C]">
                <Compass size={24} />
              </span>
              <h1 className="font-display text-3xl sm:text-4xl text-white font-bold">
                Expedition Settings
              </h1>
            </div>
            <p className="text-white/60 text-sm sm:text-base">
              Manage your traveler baseline, physical backpack thresholds, and runway metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/discover')}
              className="bg-[#C9A84C] text-[#0D1B2A] font-semibold"
            >
              Go to Discover
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#4EC9B0]/10 border border-[#4EC9B0]/30 text-[#4EC9B0] flex items-center gap-3 text-sm animate-in fade-in">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] flex items-center gap-3 text-sm animate-in fade-in">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" variant="brass" />
            <p className="text-white/50 text-sm">Loading your expedition profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Section 1: Traveler Profile */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <User size={20} className="text-[#C9A84C]" />
                <h2 className="font-display text-xl text-white font-semibold">Traveler Persona</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Display Name"
                  required
                  placeholder="e.g. Maya Lin"
                  {...register('display_name', { required: true })}
                />

                <div>
                  <label className="text-sm font-medium text-white block mb-2">
                    Traveler Type
                  </label>
                  <select
                    className="w-full rounded-[10px] border border-white/20 bg-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                    {...register('traveler_type')}
                  >
                    <option value="solo" className="bg-[#0D1B2A]">Solo Explorer</option>
                    <option value="couple" className="bg-[#0D1B2A]">Couple</option>
                    <option value="family" className="bg-[#0D1B2A]">Family with Kids</option>
                    <option value="backpacker" className="bg-[#0D1B2A]">Ultra-light Backpacker</option>
                    <option value="business" className="bg-[#0D1B2A]">Business & Leisure</option>
                  </select>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm font-medium text-white block mb-3">
                  Discovery Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((item) => (
                    <Tag
                      key={item}
                      active={interests.includes(item)}
                      onClick={() => toggleTag(interests, setInterests, item)}
                    >
                      {item}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Dietary & Accessibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="text-sm font-medium text-white block mb-2">Dietary Restrictions</label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((item) => (
                      <Tag
                        key={item}
                        active={dietary.includes(item)}
                        onClick={() => toggleTag(dietary, setDietary, item)}
                      >
                        {item}
                      </Tag>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white block mb-2">Accessibility Needs</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCESSIBILITY_OPTIONS.map((item) => (
                      <Tag
                        key={item}
                        active={accessibility.includes(item)}
                        onClick={() => toggleTag(accessibility, setAccessibility, item)}
                      >
                        {item}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Budget & Spending Range */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <Wallet size={20} className="text-[#4EC9B0]" />
                <h2 className="font-display text-xl text-white font-semibold">Budget & Currency</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Input
                  label="Min Target Budget"
                  type="number"
                  step="1"
                  min={0}
                  variant="glass"
                  {...register('preferred_budget_min')}
                />
                <Input
                  label="Max Target Budget"
                  type="number"
                  step="1"
                  min={0}
                  variant="glass"
                  {...register('preferred_budget_max')}
                />
                <div>
                  <label className="text-sm font-medium text-white/90 block mb-2">Home Currency</label>
                  <select
                    className="w-full rounded-[10px] border border-white/20 bg-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                    {...register('home_currency')}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0D1B2A]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: BazaarLink Constraints */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Backpack size={20} className="text-[#C9A84C]" />
                  <div>
                    <h2 className="font-display text-xl text-white font-semibold">BazaarLink Constraints</h2>
                    <p className="text-white/50 text-xs">Used for real-time physical capacity and cash runway evaluations</p>
                  </div>
                </div>
                <Badge variant="brass" size="sm">Physical Engine</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Max Pack Capacity (kg)"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  hint="Upper weight limit for your gear"
                  variant="glass"
                  {...register('max_carry_capacity_kg')}
                />
                <Input
                  label="Current Pack Weight (kg)"
                  type="number"
                  step="0.1"
                  min={0}
                  hint="Weight currently carried"
                  variant="glass"
                  {...register('current_carried_weight_kg')}
                />
                <Input
                  label="Liquid Cash Available"
                  type="number"
                  step="1"
                  min={0}
                  hint="Cash in wallet / local currency"
                  variant="glass"
                  {...register('liquid_cash')}
                />
                <Input
                  label="Avg Daily Spend"
                  type="number"
                  step="1"
                  min={0}
                  hint="Expected daily burn rate"
                  variant="glass"
                  {...register('average_daily_spend')}
                />
                <Input
                  label="Days Left in Journey"
                  type="number"
                  step="1"
                  min={0}
                  hint="Remaining days"
                  variant="glass"
                  {...register('remaining_travel_days')}
                />
                <Input
                  label="Emergency Cash Reserve"
                  type="number"
                  step="1"
                  min={0}
                  hint="Untouchable safety cushion"
                  variant="glass"
                  {...register('minimum_emergency_reserve')}
                />
              </div>
            </div>

            {/* Save bar */}
            <div className="sticky bottom-6 z-20 glass rounded-2xl p-4 sm:p-6 border border-[#C9A84C]/30 flex items-center justify-between shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Sparkles size={16} className="text-[#C9A84C]" />
                <span>Changes will calibrate recommendation fit scores immediately.</span>
              </div>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || updateMutation.isPending}
                disabled={!isDirty && !updateMutation.isPending}
                className="bg-[#C9A84C] text-[#0D1B2A] font-semibold px-6 shadow-lg shadow-[#C9A84C]/20"
              >
                <Save size={16} className="mr-2" />
                Save Preferences
              </Button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}
