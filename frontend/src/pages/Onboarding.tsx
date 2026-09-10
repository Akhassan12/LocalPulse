import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Backpack, CheckCircle2, ChevronRight,
  ChevronLeft, SkipForward, Map, Wallet,
  Tag as TagIcon, Heart, Accessibility,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Tag from '../components/ui/Tag'
import Badge from '../components/ui/Badge'
import { apiPut } from '../lib/api'

/* ── Types ───────────────────────────────────────────────────────────────── */
const TRAVELER_TYPES = [
  { value: 'solo',        label: 'Solo',        emoji: '🎒' },
  { value: 'couple',      label: 'Couple',      emoji: '💑' },
  { value: 'family',      label: 'Family',      emoji: '👨‍👩‍👧' },
  { value: 'backpacker',  label: 'Backpacker',  emoji: '🌍' },
  { value: 'business',    label: 'Business',    emoji: '💼' },
]

const INTEREST_OPTIONS = [
  'Food & Dining', 'Street Food', 'Culture & Art', 'History', 'Music',
  'Outdoor & Hiking', 'Water Sports', 'Markets', 'Shopping', 'Wellness & Spa',
  'Photography', 'Nightlife', 'Wildlife', 'Architecture', 'Local Crafts',
]

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'No Restrictions',
]

const ACCESSIBILITY_OPTIONS = [
  'Wheelchair accessible', 'Limited mobility', 'Hearing impaired', 'Visual impairment', 'None needed',
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'THB', 'JPY', 'AUD', 'CAD']

/* ── Zod schemas per step ────────────────────────────────────────────────── */
const step1Schema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  traveler_type: z.enum(['solo', 'couple', 'family', 'backpacker', 'business']),
})

const step2Schema = z.object({
  preferred_budget_min: z.coerce.number().min(0),
  preferred_budget_max: z.coerce.number().min(0),
  home_currency: z.string(),
}).refine((d) => d.preferred_budget_max >= d.preferred_budget_min, {
  message: 'Max budget must be ≥ min budget',
  path: ['preferred_budget_max'],
})

const step3Schema = z.object({
  max_carry_capacity_kg:     z.coerce.number().min(0).max(100),
  current_carried_weight_kg: z.coerce.number().min(0),
  liquid_cash:               z.coerce.number().min(0),
  average_daily_spend:       z.coerce.number().min(0),
  remaining_travel_days:     z.coerce.number().int().min(0),
  minimum_emergency_reserve: z.coerce.number().min(0),
}).refine((d) => d.current_carried_weight_kg <= d.max_carry_capacity_kg, {
  message: 'Carried weight cannot exceed max capacity',
  path: ['current_carried_weight_kg'],
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

/* ── Progress bar ────────────────────────────────────────────────────────── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 mb-10" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-1.5 flex-1 rounded-full transition-all duration-500',
            i < step ? 'bg-[#C9A84C]' : i === step ? 'bg-[#C9A84C]/40' : 'bg-white/20',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

/* ── Step Wrapper ────────────────────────────────────────────────────────── */
function StepCard({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-[12px] bg-[#C9A84C]/20 flex items-center justify-center">
          <Icon size={20} className="text-[#C9A84C]" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-2xl text-white">{title}</h2>
          <p className="text-white/50 text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-5">{children}</div>
    </div>
  )
}

/* ── Main Onboarding Page ────────────────────────────────────────────────── */
export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Multi-select state (not in RHF — controlled separately)
  const [interests, setInterests] = useState<string[]>([])
  const [dietary, setDietary] = useState<string[]>([])
  const [accessibility, setAccessibility] = useState<string[]>([])

  // Step 1 form
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { display_name: '', traveler_type: 'solo' },
  })

  // Step 2 form
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema) as any,
    defaultValues: { preferred_budget_min: 0, preferred_budget_max: 200, home_currency: 'USD' },
  })

  // Step 3 form
  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema) as any,
    defaultValues: {
      max_carry_capacity_kg: 15,
      current_carried_weight_kg: 0,
      liquid_cash: 500,
      average_daily_spend: 50,
      remaining_travel_days: 7,
      minimum_emergency_reserve: 100,
    },
  })

  const toggleTag = (list: string[], setter: (v: string[]) => void, val: string) =>
    setter(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])

  const handleFinish = async (skipBazaarLink = false) => {
    setError(null)
    setSubmitting(true)
    try {
      const s1 = form1.getValues()
      const s2 = form2.getValues()
      const payload = {
        display_name: s1.display_name,
        traveler_type: s1.traveler_type,
        interests,
        dietary_preferences: dietary,
        accessibility_needs: accessibility,
        preferred_budget_min: s2.preferred_budget_min,
        preferred_budget_max: s2.preferred_budget_max,
        home_currency: s2.home_currency,
        // BazaarLink defaults if skipped
        max_carry_capacity_kg: skipBazaarLink ? 15 : form3.getValues().max_carry_capacity_kg,
        current_carried_weight_kg: skipBazaarLink ? 0 : form3.getValues().current_carried_weight_kg,
        liquid_cash: skipBazaarLink ? 0 : form3.getValues().liquid_cash,
        average_daily_spend: skipBazaarLink ? 50 : form3.getValues().average_daily_spend,
        remaining_travel_days: skipBazaarLink ? 0 : form3.getValues().remaining_travel_days,
        minimum_emergency_reserve: skipBazaarLink ? 0 : form3.getValues().minimum_emergency_reserve,
      }
      await apiPut('/me/profile', payload)
      navigate('/discover')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSubmitting(false)
    }
  }

  const goNext = async () => {
    let valid = false
    if (step === 0) valid = await form1.trigger()
    else if (step === 1) valid = true // multi-select, always valid
    else if (step === 2) valid = await form2.trigger()
    if (valid) setStep((s) => s + 1)
  }

  const STEPS = ['Identity', 'Interests', 'Preferences', 'BazaarLink']

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-[8px] bg-[#C9A84C] flex items-center justify-center">
            <Map size={14} className="text-[#0D1B2A]" aria-hidden />
          </div>
          <span className="font-display text-lg font-bold text-white">
            Local<span className="text-[#C9A84C]">Pulse</span>
          </span>
        </div>

        {/* Step label */}
        <div className="flex justify-between text-xs text-white/40 mb-2">
          {STEPS.map((label, i) => (
            <span key={label} className={i === step ? 'text-[#C9A84C] font-semibold' : ''}>
              {label}
            </span>
          ))}
        </div>
        <ProgressBar step={step} total={STEPS.length} />
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">

        {/* ── Step 0: Identity ─────────────────────────────────────────── */}
        {step === 0 && (
          <StepCard title="Who are you?" subtitle="Tell us a bit about yourself" icon={User}>
            <Input
              label="Display Name"
              required
              placeholder="e.g. Mia Jensen"
              leftIcon={<User size={16} />}
              error={form1.formState.errors.display_name?.message}
              {...form1.register('display_name')}
            />

            <div>
              <p className="text-sm font-medium text-white mb-3">Traveler Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TRAVELER_TYPES.map(({ value, label, emoji }) => {
                  const active = form1.watch('traveler_type') === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => form1.setValue('traveler_type', value as Step1Data['traveler_type'])}
                      className={[
                        'flex flex-col items-center gap-2 p-4 rounded-[16px] border-2 transition-all duration-150 text-sm font-medium',
                        active
                          ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#C9A84C]'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30',
                      ].join(' ')}
                    >
                      <span className="text-2xl" aria-hidden>{emoji}</span>
                      {label}
                    </button>
                  )
                })}
              </div>
              {form1.formState.errors.traveler_type && (
                <p className="text-[#EF4444] text-sm mt-1">{form1.formState.errors.traveler_type.message}</p>
              )}
            </div>
          </StepCard>
        )}

        {/* ── Step 1: Interests ────────────────────────────────────────── */}
        {step === 1 && (
          <StepCard title="What excites you?" subtitle="Pick everything that resonates — your fit scores depend on this" icon={Heart}>
            <div>
              <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <TagIcon size={14} aria-hidden /> Interests
                {interests.length > 0 && <Badge variant="brass" size="sm">{interests.length} selected</Badge>}
              </p>
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

            <div>
              <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Heart size={14} aria-hidden /> Dietary Preferences
              </p>
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
              <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Accessibility size={14} aria-hidden /> Accessibility Needs
              </p>
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
          </StepCard>
        )}

        {/* ── Step 2: Budget & Preferences ─────────────────────────────── */}
        {step === 2 && (
          <StepCard title="Budget & Currency" subtitle="Your preferred spend range for a single experience" icon={Wallet}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Budget"
                type="number"
                required
                min={0}
                error={form2.formState.errors.preferred_budget_min?.message}
                {...form2.register('preferred_budget_min')}
              />
              <Input
                label="Max Budget"
                type="number"
                required
                min={0}
                error={form2.formState.errors.preferred_budget_max?.message}
                {...form2.register('preferred_budget_max')}
              />
            </div>

            <div>
              <label htmlFor="home_currency" className="text-sm font-medium text-white block mb-2">
                Home Currency
              </label>
              <select
                id="home_currency"
                className="w-full rounded-[10px] border border-white/20 bg-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                {...form2.register('home_currency')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0D1B2A]">{c}</option>
                ))}
              </select>
            </div>
          </StepCard>
        )}

        {/* ── Step 3: BazaarLink ────────────────────────────────────────── */}
        {step === 3 && (
          <StepCard title="BazaarLink Setup" subtitle="Track your backpack capacity and cash runway at markets (optional — you can skip)" icon={Backpack}>
            {/* Skip note */}
            <div className="glass rounded-[12px] px-4 py-3 text-sm text-white/60">
              <span className="text-[#C9A84C] font-medium">Skippable:</span> If you skip, sensible defaults are applied (15 kg capacity, no cash tracking). You can update these in Settings anytime.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Capacity (kg)"
                type="number"
                step="0.1"
                min={0}
                max={100}
                hint="Total pack weight limit"
                error={form3.formState.errors.max_carry_capacity_kg?.message}
                {...form3.register('max_carry_capacity_kg')}
              />
              <Input
                label="Currently Carrying (kg)"
                type="number"
                step="0.1"
                min={0}
                hint="What's already in your pack"
                error={form3.formState.errors.current_carried_weight_kg?.message}
                {...form3.register('current_carried_weight_kg')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Liquid Cash"
                type="number"
                step="0.01"
                min={0}
                hint="How much cash you have"
                error={form3.formState.errors.liquid_cash?.message}
                {...form3.register('liquid_cash')}
              />
              <Input
                label="Daily Spend (avg)"
                type="number"
                step="0.01"
                min={0}
                hint="Your average daily budget"
                error={form3.formState.errors.average_daily_spend?.message}
                {...form3.register('average_daily_spend')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Travel Days Left"
                type="number"
                min={0}
                step={1}
                error={form3.formState.errors.remaining_travel_days?.message}
                {...form3.register('remaining_travel_days')}
              />
              <Input
                label="Emergency Reserve"
                type="number"
                step="0.01"
                min={0}
                hint="Min cash to always keep"
                error={form3.formState.errors.minimum_emergency_reserve?.message}
                {...form3.register('minimum_emergency_reserve')}
              />
            </div>
          </StepCard>
        )}

        {/* Error */}
        {error && (
          <p role="alert" className="text-sm text-[#EF4444] bg-[#EF4444]/10 rounded-[8px] px-3 py-2 mt-4">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-10">
          {step > 0 && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => setStep((s) => s - 1)}
              icon={<ChevronLeft size={18} />}
              className="text-white hover:bg-white/10"
            >
              Back
            </Button>
          )}

          <div className="flex-1" />

          {/* BazaarLink step: show Skip option */}
          {step === 3 && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => handleFinish(true)}
              loading={submitting}
              icon={<SkipForward size={16} />}
              className="text-white/60 hover:bg-white/10"
            >
              Skip
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={goNext}
              icon={<ChevronRight size={18} />}
              iconPosition="right"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              loading={submitting}
              onClick={() => handleFinish(false)}
              icon={<CheckCircle2 size={18} />}
              iconPosition="right"
            >
              Let's Go!
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
