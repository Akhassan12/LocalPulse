/**
 * pages/provider/ExperienceForm.tsx
 * Phase 9: Host & Artisan Experience Creation / Edit Form
 * - Full constraint metadata support (category, duration, price range, city, coords, capacity)
 * - Server-side verified provider ownership
 */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import { api } from '../../lib/api'

export default function ExperienceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'artisan_craft',
    tags: 'weaving, pottery, ancestral, natural_dyes',
    price_min: 35.0,
    price_max: 55.0,
    currency: 'USD',
    duration_minutes: 180,
    city: 'Oaxaca',
    country: 'Mexico',
    address: 'Calle de los Sabores 42',
    lat: 17.060,
    lng: -96.725,
    capacity: 6,
    uniqueness_score: 0.92,
    is_active: true,
  })

  useEffect(() => {
    if (isEditing && id) {
      loadExperience(id)
    }
  }, [id, isEditing])

  const loadExperience = async (expId: string) => {
    setLoading(true)
    try {
      const res = await api.get(`/providers/me/experiences/${expId}`)
      const data = res.data
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'artisan_craft',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        price_min: data.price_min || 35.0,
        price_max: data.price_max || 55.0,
        currency: data.currency || 'USD',
        duration_minutes: data.duration_minutes || 180,
        city: data.city || 'Oaxaca',
        country: data.country || 'Mexico',
        address: data.address || '',
        lat: data.lat || 17.060,
        lng: data.lng || -96.725,
        capacity: data.capacity || 6,
        uniqueness_score: data.uniqueness_score || 0.92,
        is_active: data.is_active ?? true,
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load experience details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      price_min: Number(formData.price_min),
      price_max: Number(formData.price_max),
      currency: formData.currency,
      duration_minutes: Number(formData.duration_minutes),
      city: formData.city,
      country: formData.country,
      address: formData.address,
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      capacity: Number(formData.capacity),
      uniqueness_score: Number(formData.uniqueness_score),
      is_active: formData.is_active,
    }

    try {
      if (isEditing && id) {
        await api.put(`/providers/me/experiences/${id}`, payload)
      } else {
        await api.post('/providers/me/experiences', payload)
      }
      navigate('/provider')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error saving experience. Please verify inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#0D1B2A]">
      <Navbar />

      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/provider"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A2B3C]/70 hover:text-[#0D1B2A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Provider Portal
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#0D1B2A]/10 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-[#0D1B2A]/10">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E0EFC7] text-[#2D6A4F]">
                Host Workshop Listing
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0D1B2A] mt-1">
                {isEditing ? 'Edit Cultural Experience' : 'Create New Cultural Experience'}
              </h1>
              <p className="text-xs text-[#1A2B3C]/70 mt-0.5">
                Accurately list physical and duration constraints so travelers receive calibrated fit scores.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#1A2B3C]/60">Loading listing details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Experience Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Zapotec Indigo Dyeing & Backstrap Loom Masterclass"
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  >
                    <option value="artisan_craft">Artisan Craft</option>
                    <option value="culinary">Culinary & Kitchen</option>
                    <option value="culture">Culture & Rituals</option>
                    <option value="nature">Nature & Agroforestry</option>
                    <option value="music">Music & Performance</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                  Detailed Experience Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the cultural lineage, materials used, hands-on tasks, and take-home craft..."
                  className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.price_min}
                    onChange={(e) => setFormData({ ...formData, price_min: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.price_max}
                    onChange={(e) => setFormData({ ...formData, price_max: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    step="15"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Workshop Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>
              </div>

              {/* Tags & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1.5">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="weaving, zapotec, handmade, family_friendly"
                    className="w-full text-xs bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-xl px-3.5 py-2.5 text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#2D6A4F] rounded border-[#0D1B2A]/20 focus:ring-[#2D6A4F]"
                  />
                  <label htmlFor="is_active" className="text-xs font-bold text-[#0D1B2A] cursor-pointer">
                    Publish Live on Discovery Feed
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6 border-t border-[#0D1B2A]/10 flex items-center justify-end gap-3">
                <Link
                  to="/provider"
                  className="px-5 py-2.5 rounded-xl border border-[#0D1B2A]/15 text-xs font-bold text-[#1A2B3C]/70 hover:text-[#0D1B2A] hover:bg-[#FAF5EB] transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#245640] shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving Listing...' : isEditing ? 'Update Experience' : 'Publish Experience'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
