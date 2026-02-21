'use client'

import { useState, useEffect, useCallback, useRef, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CityViewRenderer } from '@/components/CityViewRenderer'
import {
  MOCK_EVENTS,
  BOROUGH_DATA,
  PULSE_ITEMS,
  type BoroughData,
} from '@/data/events'
import type { CityView } from '@/lib/cityview'

type PageState = 'idle' | 'loading' | 'ready'

const EXAMPLE_QUERIES = [
  "what's breaking right now?",
  "brooklyn tonight",
  "show me the quiet spots",
  "where's the energy?",
  "what's the anomaly?",
  "who's loud tonight?",
]

const EXAMPLE_CHIPS = [
  "what's breaking?",
  "brooklyn tonight",
  "show me the quiet",
  "where's the energy?",
]

// Parse initial live view counts from PULSE_ITEMS view strings
function parsePulseViews(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const item of PULSE_ITEMS) {
    const match = item.views.match(/([\d.]+)K?/)
    if (match) {
      const n = parseFloat(match[1])
      out[item.location] = item.views.includes('K') ? Math.round(n * 1000) : n
    }
  }
  return out
}

function useTimeString() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function CityRightNow() {
  const [pageState, setPageState] = useState<PageState>('idle')
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [cityView, setCityView] = useState<CityView | null>(null)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const time = useTimeString()

  // Live simulation state
  const [liveBoroughs, setLiveBoroughs] = useState<BoroughData[]>(BOROUGH_DATA)
  const [liveViews, setLiveViews] = useState<Record<string, number>>(parsePulseViews)

  // Cycle placeholder text
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % EXAMPLE_QUERIES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // Live simulation: tick every 6s
  useEffect(() => {
    const id = setInterval(() => {
      setLiveViews(prev => {
        const next = { ...prev }
        for (const item of PULSE_ITEMS) {
          if (item.isLive || item.intensity === 'hot') {
            next[item.location] = (next[item.location] ?? 0) + Math.floor(Math.random() * 60 + 10)
          } else if (item.intensity === 'moderate') {
            next[item.location] = (next[item.location] ?? 0) + Math.floor(Math.random() * 20 + 2)
          }
        }
        return next
      })

      setLiveBoroughs(prev => prev.map(b => {
        const drift = (Math.random() - 0.4) * 2
        const clamped = Math.min(99, Math.max(1, b.percentage + drift))
        return { ...b, percentage: Math.round(clamped) }
      }))
    }, 6000)
    return () => clearInterval(id)
  }, [])

  const submitQuery = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return

    setSubmittedQuery(trimmed)
    setPageState('loading')
    setCityView(null)

    try {
      const res = await fetch('/api/cityview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, events: MOCK_EVENTS }),
      })
      const data: CityView = await res.json()
      setCityView(data)
      setPageState('ready')
    } catch {
      setPageState('idle')
    }
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submitQuery(query)
  }

  const handleChip = (chip: string) => {
    setQuery(chip)
    submitQuery(chip)
  }

  const handleReset = () => {
    setPageState('idle')
    setQuery('')
    setCityView(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <main className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hot opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-hot" />
          </span>
          <h1 className="text-xl font-black tracking-tight text-white">CITY RIGHT NOW</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/30">{time}</span>
          {pageState === 'ready' && (
            <button
              onClick={handleReset}
              className="text-[10px] font-mono text-white/30 border border-white/10 rounded-lg px-2.5 py-1 hover:text-white/60 hover:border-white/20 transition-colors"
            >
              ← ask again
            </button>
          )}
        </div>
      </header>

      {/* Query input — always visible */}
      <div className="flex-shrink-0 px-6 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={pageState === 'loading'}
              placeholder={EXAMPLE_QUERIES[placeholderIdx]}
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 pr-24 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-brand-purple/40 focus:bg-white/[0.07] transition-all disabled:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={pageState === 'loading' || !query.trim()}
              className="absolute right-2 text-[10px] font-bold uppercase tracking-widest bg-brand-purple/80 hover:bg-brand-purple disabled:opacity-30 text-white px-3 py-1.5 rounded-xl transition-all"
            >
              {pageState === 'loading' ? '…' : 'ask ↵'}
            </button>
          </div>
        </form>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* IDLE STATE */}
          {pageState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center px-6 pt-6 gap-6"
            >
              {/* Example chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleChip(chip)}
                    className="text-[11px] font-mono text-white/40 border border-white/10 rounded-full px-3 py-1.5 hover:text-white/70 hover:border-white/25 hover:bg-white/[0.05] transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Hint text */}
              <p className="text-[11px] text-white/20 font-mono text-center max-w-xs leading-relaxed">
                Ask anything about NYC tonight. Claude reads the live signals and builds you a custom view.
              </p>

              {/* Ghost data preview */}
              <div className="w-full max-w-lg opacity-20 pointer-events-none">
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl" style={{ width: `${85 - i * 10}%` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {pageState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col px-6 pt-4 gap-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 border-2 border-white/15 border-t-white/50 rounded-full animate-spin" />
                <span className="text-[11px] font-mono text-white/30">
                  Claude is reading the city for "{submittedQuery}"…
                </span>
              </div>
              {/* Skeleton widgets */}
              <div className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
              <div className="h-24 bg-white/[0.03] rounded-xl animate-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="h-20 bg-white/[0.04] rounded-xl animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-32 bg-white/[0.03] rounded-xl animate-pulse" style={{ animationDelay: '0.3s' }} />
            </motion.div>
          )}

          {/* READY STATE */}
          {pageState === 'ready' && cityView && (
            <motion.div
              key={`ready-${submittedQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pb-8"
            >
              <CityViewRenderer
                view={cityView}
                boroughs={liveBoroughs}
                pulseItems={PULSE_ITEMS}
                liveViews={liveViews}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}
