import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Clock,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Bot,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiPost } from '../../lib/api'
import { useContextStore } from '../../store/contextStore'
import { useItineraryStore } from '../../store/itineraryStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  matchedExperiences?: {
    id: string
    title: string
    city: string
    duration_minutes: number
    price: string
    fit_reason: string
  }[]
  suggestedActions?: string[]
}

const QUICK_PROMPTS = [
  'I have 2 hours in Varanasi near Assi Ghat with my family. What is a cultural experience under ₹1000?',
  'It started raining in Jaipur! What sheltered havelis or craft workshops are open?',
  'Best authentic street food trail in Delhi under ₹300 per person?',
  'I only have 45 minutes free right now, what is nearby?',
]

export const AIConciergeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { context } = useContextStore()
  const { addItem, isShortlisted } = useItineraryStore()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! I'm your Pulse AI Concierge. I specialize in scouting hidden cultural rituals, artisan ateliers, and street food across ${context.locationLabel || 'India'}. Tell me who you're traveling with, how much time you have, or what you feel like exploring!`,
      suggestedActions: [
        'Find sheltered havelis',
        'Quick 45m cultural stops',
        'Free sacred aartis',
      ],
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (userText: string) => {
    const query = userText.trim()
    if (!query || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await apiPost<{
        reply: string
        matched_experiences: {
          id: string
          title: string
          city: string
          duration_minutes: number
          price: string
          fit_reason: string
        }[]
        suggested_actions: string[]
      }>('/concierge/chat', {
        message: query,
        city: context.locationLabel || 'Jaipur',
        available_minutes: context.availableMinutes || 120,
        remaining_budget: Number(context.remainingBudget) || 2000,
        group_size: context.groupSize || 2,
      })

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        matchedExperiences: res.matched_experiences,
        suggestedActions: res.suggested_actions,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `I couldn't complete that query right now, but you can explore our verified ${context.locationLabel || 'Indian'} gems on the interactive map!`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Concierge Launcher Pill */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1A1A1E] text-white shadow-[0_8px_24px_rgba(26,26,30,0.25)] hover:shadow-[0_12px_32px_rgba(224,90,56,0.35)] hover:scale-105 transition-all duration-300 border border-[#E05A38]/40 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-[#E05A38] text-white flex items-center justify-center animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs tracking-wide">Pulse AI Concierge</span>
        </button>
      </div>

      {/* Slide-out / Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl flex flex-col border-l border-[#E6E0D6] animate-slide-left">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E6E0D6] bg-[#FDFCF7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FDEEE9] text-[#E05A38] flex items-center justify-center border border-[#E05A38]/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[#1A1A1E] flex items-center gap-1.5">
                  Pulse AI Concierge
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3B5249]/10 text-[#3B5249] font-bold">
                    Gemini 3.6
                  </span>
                </h3>
                <p className="text-[11px] text-[#75747A]">Hyper-local recommendations & circumstance solver</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-[#75747A] hover:text-[#1A1A1E] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#E05A38] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#E05A38] text-white rounded-br-none shadow-sm'
                        : 'bg-white text-[#1A1A1E] rounded-bl-none border border-[#E6E0D6] shadow-[0_2px_8px_rgba(26,26,30,0.04)]'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>

                  {/* Matched Experience Cards inside chat */}
                  {msg.matchedExperiences && msg.matchedExperiences.length > 0 && (
                    <div className="space-y-2 pt-1 w-full">
                      {msg.matchedExperiences.map((exp) => {
                        const shortlisted = isShortlisted(exp.id)
                        return (
                          <div
                            key={exp.id}
                            className="bg-white rounded-xl p-3 border border-[#E6E0D6] hover:border-[#E05A38]/30 shadow-sm space-y-2 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-[#1A1A1E] text-xs line-clamp-1">{exp.title}</h4>
                              <span className="font-mono font-bold text-[#E05A38] text-[11px] flex-shrink-0">
                                {exp.price}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#75747A] line-clamp-2 leading-relaxed italic">
                              "{exp.fit_reason}"
                            </p>

                            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#F5F2EB]">
                              <span className="flex items-center gap-1 text-[#555]">
                                <Clock className="w-3 h-3 text-[#3B5249]" /> {exp.duration_minutes}m duration
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    addItem({
                                      id: exp.id,
                                      experienceId: exp.id,
                                      title: exp.title,
                                      category: 'culture',
                                      price: exp.price,
                                      currency: 'INR',
                                      durationMinutes: exp.duration_minutes,
                                      city: exp.city,
                                      lat: context.lat || 26.9124,
                                      lng: context.lng || 75.7873,
                                    })
                                  }
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    shortlisted
                                      ? 'bg-[#3B5249] text-white'
                                      : 'bg-[#F5F2EB] text-[#36363D] hover:bg-[#EDE8DF]'
                                  }`}
                                >
                                  {shortlisted ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                                  {shortlisted ? 'Saved' : 'Save'}
                                </button>

                                <Link
                                  to={`/experiences/${exp.id}`}
                                  onClick={() => setIsOpen(false)}
                                  className="text-[#E05A38] font-bold flex items-center gap-0.5 hover:underline"
                                >
                                  Details <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Suggested action pills */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(act)}
                          className="px-2.5 py-1 rounded-lg bg-[#F5F2EB] hover:bg-[#EDE8DF] text-[10px] font-medium text-[#36363D] border border-[#E6E0D6] transition-colors cursor-pointer"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-[#1A1A1E] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#75747A] p-3 bg-white rounded-xl border border-[#E6E0D6] w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-[#E05A38]" />
                <span>Scouting authentic local gems in {context.locationLabel || 'India'}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel (when history is small) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-[#FDFCF7] border-t border-[#E6E0D6] overflow-x-auto scrollbar-none flex gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(qp)}
                  className="text-left text-[10px] bg-white border border-[#E6E0D6] hover:border-[#E05A38] text-[#555] hover:text-[#1A1A1E] px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
                >
                  {qp.length > 38 ? qp.slice(0, 38) + '...' : qp}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(input)
            }}
            className="p-3.5 border-t border-[#E6E0D6] bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything (e.g. "2 hours near Assi Ghat under ₹500")...`}
              className="flex-1 bg-[#F5F2EB] text-[#1A1A1E] placeholder:text-[#9E9DA3] text-xs px-3.5 py-2.5 rounded-xl border border-[#E6E0D6] focus:outline-none focus:ring-2 focus:ring-[#E05A38]/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-[#E05A38] text-white hover:bg-[#E86B4B] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default AIConciergeModal
