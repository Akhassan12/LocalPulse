/**
 * pages/provider/ProviderDashboard.tsx
 * Phase 9: Host & Artisan Provider Dashboard
 * - Provider profile header & status
 * - Performance overview & stats
 * - Experience listings management (Create, Edit, Delete)
 * - Real-time Traveler Demand Signals & In-Demand Barter Requests modal
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  Users,
  Package,
  Clock,
  CheckCircle2,
  BarChart3,
  X,
  Compass,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { api } from '../../lib/api'

interface Experience {
  id: string
  title: string
  description?: string
  category: string
  price_min: number
  price_max: number
  currency: string
  duration_minutes: number
  city: string
  country: string
  capacity?: number
  uniqueness_score: number
  is_active: boolean
}

interface ProviderProfile {
  id: string
  business_name: string
  contact_email: string
  description?: string
  verified: boolean
}

interface DemandSignalItem {
  category: string
  item_name: string
  traveler_count: number
  exchange_intent: string
}

interface DemandSignals {
  experience_id: string
  experience_title: string
  total_views: number
  fit_rate_percent: number
  budget_compatibility_percent: number
  top_barter_requests: DemandSignalItem[]
  peak_arrival_window: string
  weekly_inquiries: number
}

export default function ProviderDashboard() {
  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDemandExp, setSelectedDemandExp] = useState<Experience | null>(null)
  const [demandData, setDemandData] = useState<DemandSignals | null>(null)
  const [loadingDemand, setLoadingDemand] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [regForm, setRegForm] = useState({
    business_name: 'Studio Taller Oaxaqueño',
    contact_email: 'artisan@localpulse.mx',
    description: 'Master artisans preserving traditional Zapotec crafts and culinary heritage.',
  })

  useEffect(() => {
    fetchProviderData()
  }, [])

  const fetchProviderData = async () => {
    setLoading(true)
    try {
      const meRes = await api.get('/providers/me')
      setProvider(meRes.data)

      const expRes = await api.get('/providers/me/experiences')
      setExperiences(expRes.data.experiences || [])
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Not registered yet
        setProvider(null)
      } else {
        // Fallback demo state
        setProvider({
          id: 'prov-demo',
          business_name: 'Casa Taller Ancestral',
          contact_email: 'artisan@oaxaca.mx',
          description: 'Generational weaving, pottery, and culinary arts in Oaxaca Valley.',
          verified: true,
        })
        setExperiences([
          {
            id: 'exp-demo-1',
            title: 'Ancestral Botanical Weaving & Cochineal Dyeing',
            category: 'artisan_craft',
            price_min: 45,
            price_max: 70,
            currency: 'USD',
            duration_minutes: 180,
            city: 'Teotitlán del Valle',
            country: 'Mexico',
            capacity: 6,
            uniqueness_score: 0.94,
            is_active: true,
          },
          {
            id: 'exp-demo-2',
            title: 'Black Clay Quartz Burnishing & Smoke Firing',
            category: 'artisan_craft',
            price_min: 35,
            price_max: 55,
            currency: 'USD',
            duration_minutes: 150,
            city: 'San Bartolo Coyotepec',
            country: 'Mexico',
            capacity: 8,
            uniqueness_score: 0.91,
            is_active: true,
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    try {
      const res = await api.post('/providers/register', regForm)
      setProvider(res.data)
      const expRes = await api.get('/providers/me/experiences')
      setExperiences(expRes.data.experiences || [])
    } catch (err) {
      // Local fallback
      setProvider({
        id: 'prov-new',
        business_name: regForm.business_name,
        contact_email: regForm.contact_email,
        description: regForm.description,
        verified: true,
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleOpenDemand = async (exp: Experience) => {
    setSelectedDemandExp(exp)
    setLoadingDemand(true)
    try {
      const res = await api.get(`/providers/me/experiences/${exp.id}/demand`)
      setDemandData(res.data)
    } catch (err) {
      // Fallback demand signals
      setDemandData({
        experience_id: exp.id,
        experience_title: exp.title,
        total_views: 164,
        fit_rate_percent: 89,
        budget_compatibility_percent: 92,
        top_barter_requests: [
          { category: 'Electronics', item_name: 'Anker 20,000mAh Power Bank', traveler_count: 5, exchange_intent: 'Workshop trade' },
          { category: 'Brewing Gear', item_name: 'Aeropress Go Travel Coffee Brewer', traveler_count: 4, exchange_intent: 'Partial credit' },
          { category: 'Outdoor Gear', item_name: 'Ultralight Titanium Camp Cookset', traveler_count: 2, exchange_intent: 'Full craft trade' },
          { category: 'Skills', item_name: 'Spanish/English Translation or Social Media', traveler_count: 3, exchange_intent: 'Skill swap' },
        ],
        peak_arrival_window: 'Thursday – Sunday',
        weekly_inquiries: 14,
      })
    } finally {
      setLoadingDemand(false)
    }
  }

  const handleDeleteExperience = async (expId: string) => {
    if (!confirm('Are you sure you want to deactivate and remove this listing?')) return
    try {
      await api.delete(`/providers/me/experiences/${expId}`)
      setExperiences((prev) => prev.filter((e) => e.id !== expId))
    } catch (err) {
      setExperiences((prev) => prev.filter((e) => e.id !== expId))
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1A1A1E] flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#E05A38] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-[#75747A]">Loading provider portal...</p>
          </div>
        ) : !provider ? (
          /* Provider Onboarding / Registration Form */
          <div className="max-w-xl mx-auto py-12">
            <div className="bento-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FDEEE9] flex items-center justify-center mx-auto mb-4 border border-[#E05A38]/20">
                <Store className="w-8 h-8 text-[#E05A38]" />
              </div>
              <h1 className="text-2xl font-display font-extrabold text-[#1A1A1E]">
                Host with LocalPulse
              </h1>
              <p className="text-xs text-[#75747A] mt-2 mb-6">
                Connect directly with mindful travelers willing to exchange fair cash or valuable barter assets for your authentic heritage knowledge.
              </p>

              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    Workshop or Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.business_name}
                    onChange={(e) => setRegForm({ ...regForm, business_name: e.target.value })}
                    className="w-full text-xs bg-[#F5F2EB] border border-[#E6E0D6] rounded-xl px-3.5 py-2.5 text-[#1A1A1E] focus:outline-none focus:ring-1 focus:ring-[#E05A38] focus:border-[#E05A38]"
                    placeholder="e.g. Bagru Natural Dye Textile Guild"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.contact_email}
                    onChange={(e) => setRegForm({ ...regForm, contact_email: e.target.value })}
                    className="w-full text-xs bg-[#F5F2EB] border border-[#E6E0D6] rounded-xl px-3.5 py-2.5 text-[#1A1A1E] focus:outline-none focus:ring-1 focus:ring-[#E05A38] focus:border-[#E05A38]"
                    placeholder="artisan@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    Craft or Heritage Description
                  </label>
                  <textarea
                    rows={3}
                    value={regForm.description}
                    onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
                    className="w-full text-xs bg-[#F5F2EB] border border-[#E6E0D6] rounded-xl px-3.5 py-2.5 text-[#1A1A1E] focus:outline-none focus:ring-1 focus:ring-[#E05A38] focus:border-[#E05A38]"
                    placeholder="Tell travelers what makes your workshop unique..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 rounded-xl bg-[#E05A38] text-white font-bold text-xs hover:bg-[#E86B4B] shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isRegistering ? 'Registering...' : 'Complete Provider Registration'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Active Provider Dashboard */
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6E0D6]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDF2EF] text-[#3B5249] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Host
                  </span>
                  <span className="text-xs text-[#75747A]">{provider.contact_email}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#1A1A1E]">
                  {provider.business_name}
                </h1>
                <p className="text-xs sm:text-sm text-[#75747A] mt-1">
                  Manage experiences, view traveler carrying fits, and review incoming barter demands.
                </p>
              </div>

              <Link
                to="/provider/experiences/new"
                className="px-5 py-3 rounded-xl bg-[#E05A38] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#E86B4B] shadow-sm transition-all self-start md:self-auto hover:-translate-y-px"
              >
                <Plus className="w-4 h-4" /> Add Experience Listing
              </Link>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bento-card p-5">
                <span className="block text-[11px] font-bold text-[#75747A] uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Store className="w-3.5 h-3.5 text-[#E05A38]" /> Active Listings
                </span>
                <span className="text-2xl font-display font-extrabold text-[#1A1A1E]">
                  {experiences.length}
                </span>
                <span className="block text-[10px] text-[#3B5249] mt-1">All live on Discovery</span>
              </div>

              <div className="bento-card p-5">
                <span className="block text-[11px] font-bold text-[#75747A] uppercase tracking-wider flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E05A38]" /> Traveler Fit Rate
                </span>
                <span className="text-2xl font-display font-extrabold text-[#1A1A1E]">88%</span>
                <span className="block text-[10px] text-[#75747A] mt-1">Weight & budget matched</span>
              </div>

              <div className="bento-card p-5">
                <span className="block text-[11px] font-bold text-[#75747A] uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Package className="w-3.5 h-3.5 text-[#3B5249]" /> Barter Demands
                </span>
                <span className="text-2xl font-display font-extrabold text-[#1A1A1E]">14</span>
                <span className="block text-[10px] text-[#3B5249] mt-1">Active traveler offers</span>
              </div>

              <div className="bento-card p-5">
                <span className="block text-[11px] font-bold text-[#75747A] uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-[#1A1A1E]" /> Monthly Travelers
                </span>
                <span className="text-2xl font-display font-extrabold text-[#1A1A1E]">46</span>
                <span className="block text-[10px] text-[#75747A] mt-1">Direct bookings</span>
              </div>
            </div>

            {/* Experience Listings Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-[#1A1A1E]">
                  Hosted Cultural Experiences
                </h2>
                <span className="text-xs text-[#1A2B3C]/60">
                  {experiences.length} experience{experiences.length !== 1 ? 's' : ''} listed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                  className="bento-card p-5 flex flex-col justify-between gap-4 hover:border-[#E05A38]/30 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FAF5EB] text-[#2D6A4F] border border-[#0D1B2A]/5">
                          {exp.category?.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-[#0D1B2A]">
                          ${exp.price_min} – ${exp.price_max} {exp.currency}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-[#0D1B2A] leading-snug">
                        {exp.title}
                      </h3>

                      <p className="text-xs text-[#1A2B3C]/70 line-clamp-2 leading-relaxed">
                        {exp.description || 'Authentic hands-on experience hosted by master craftspeople.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#1A2B3C]/60 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          {exp.duration_minutes} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-[#C9A84C]" />
                          {exp.city}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#0D1B2A]/5">
                      <button
                        onClick={() => handleOpenDemand(exp)}
                        className="text-xs font-bold text-[#2D6A4F] hover:text-[#245640] flex items-center gap-1.5"
                      >
                        <BarChart3 className="w-3.5 h-3.5" /> View Demand Signals
                      </button>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/provider/experiences/${exp.id}/edit`}
                          className="p-2 rounded-xl border border-[#0D1B2A]/10 text-[#0D1B2A] hover:bg-[#FAF5EB] transition-colors"
                          title="Edit Experience"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Demand Signals Modal */}
        {selectedDemandExp && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#0D1B2A]/10 shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#0D1B2A]/10">
                <div>
                  <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                    Traveler Demand Intelligence
                  </span>
                  <h3 className="text-base font-bold text-[#0D1B2A] truncate">
                    {selectedDemandExp.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDemandExp(null)}
                  className="p-1.5 rounded-full hover:bg-[#FAF5EB] text-[#1A2B3C]/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loadingDemand || !demandData ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-[#1A2B3C]/60">Analyzing traveler carrying signals...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 bg-[#FAF5EB] rounded-2xl">
                      <span className="block text-[10px] text-[#1A2B3C]/60">Search Fit Rate</span>
                      <span className="text-xl font-bold text-[#2D6A4F]">
                        {demandData.fit_rate_percent}%
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAF5EB] rounded-2xl">
                      <span className="block text-[10px] text-[#1A2B3C]/60">Budget Aligned</span>
                      <span className="text-xl font-bold text-[#0D1B2A]">
                        {demandData.budget_compatibility_percent}%
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAF5EB] rounded-2xl">
                      <span className="block text-[10px] text-[#1A2B3C]/60">Weekly Leads</span>
                      <span className="text-xl font-bold text-[#C9A84C]">
                        {demandData.weekly_inquiries}
                      </span>
                    </div>
                  </div>

                  {/* Incoming Barter Intent */}
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1B2A] flex items-center gap-1.5 mb-2">
                      <Package className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      Items Travelers Are Carrying to Trade
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {demandData.top_barter_requests.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-[#FAF5EB] rounded-xl text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[#0D1B2A] block">
                              {item.item_name}
                            </span>
                            <span className="text-[10px] text-[#1A2B3C]/60">
                              {item.category} • {item.exchange_intent}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-white text-[#2D6A4F] font-bold text-[10px] border border-[#0D1B2A]/5">
                            {item.traveler_count} travelers
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#E0EFC7]/50 border border-[#2D6A4F]/20 text-xs text-[#2D6A4F] flex items-center justify-between">
                    <span className="font-semibold">Optimal Scheduling Window:</span>
                    <span className="font-bold">{demandData.peak_arrival_window}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
