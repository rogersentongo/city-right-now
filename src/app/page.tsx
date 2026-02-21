'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

import { NYCPulse } from '@/components/NYCPulse'
import { BoroughActivity } from '@/components/BoroughActivity'
import { StoryCard } from '@/components/StoryCard'
import { BriefingPanel } from '@/components/BriefingPanel'
import {
  MOCK_EVENTS,
  STORY_CLUSTERS,
  BOROUGH_DATA,
  PULSE_ITEMS,
  type StoryCluster,
  type PulseItem,
  type BoroughData,
} from '@/data/events'
import type { AnalysisResult } from '@/app/api/analyze/route'

type Mode = 'ambient' | 'drilldown' | 'borough' | 'event' | 'ask'
type Lens = 'desk' | 'local' | 'tourist'

const LENS_CONFIG: Record<Lens, { label: string; color: string; activeClass: string }> = {
  desk: { label: 'DESK', color: 'text-brand-purple', activeClass: 'border-brand-purple/50 text-brand-purple bg-brand-purple/10' },
  local: { label: 'LOCAL', color: 'text-cool', activeClass: 'border-cool/50 text-cool bg-cool/10' },
  tourist: { label: 'TOURIST', color: 'text-moderate', activeClass: 'border-moderate/50 text-moderate bg-moderate/10' },
}

const USER_MEMORY = {
  lastVisit: '2 hours ago',
  changes: ['Bushwick went from quiet to active', 'Times Square stopped uploading', 'Flushing market is still open'],
}

const BOROUGH_NAMES = ['Brooklyn', 'Manhattan', 'Queens', 'Bronx', 'Staten Island']

function detectEmphasizedBorough(text: string): string | undefined {
  for (const b of BOROUGH_NAMES) {
    if (text.includes(b)) return b
  }
  return undefined
}

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
  const [mode, setMode] = useState<Mode>('ambient')
  const [lens, setLens] = useState<Lens>('desk')
  const [briefing, setBriefing] = useState('')
  const [panelText, setPanelText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [activeCluster, setActiveCluster] = useState<StoryCluster | null>(null)
  const [activeBorough, setActiveBorough] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string | null>(null)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>()
  const [selectedBorough, setSelectedBorough] = useState<string | undefined>()
  const [emphasisedBorough, setEmphasisedBorough] = useState<string | undefined>()
  const [showMemory, setShowMemory] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)

  // Live simulation state
  const [liveBoroughs, setLiveBoroughs] = useState<BoroughData[]>(BOROUGH_DATA)
  const [liveViews, setLiveViews] = useState<Record<string, number>>(parsePulseViews)

  const streamAbort = useRef<AbortController | null>(null)
  const time = useTimeString()

  // ── Live simulation: tick every 6s ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      // Tick pulse view counts
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

      // Drift borough percentages ±1-2%
      setLiveBoroughs(prev => prev.map(b => {
        const drift = (Math.random() - 0.4) * 2 // slight upward bias for hot boroughs
        const clamped = Math.min(99, Math.max(1, b.percentage + drift))
        return { ...b, percentage: Math.round(clamped) }
      }))
    }, 6000)
    return () => clearInterval(id)
  }, [])

  // ── Streaming helper ─────────────────────────────────────────────────────
  const streamText = useCallback(
    async (url: string, body: object, setter: (fn: (prev: string) => string) => void, onComplete?: (text: string) => void) => {
      if (streamAbort.current) streamAbort.current.abort()
      streamAbort.current = new AbortController()

      setIsStreaming(true)
      setStreamError(null)
      setter(() => '')

      let accumulated = ''

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: streamAbort.current.signal,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setStreamError((data as { error?: string }).error ?? `Error ${res.status}`)
          return
        }

        if (!res.body) return
        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setter(prev => prev + chunk)
        }

        onComplete?.(accumulated)
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Stream error:', err)
          setStreamError('Connection error — is the dev server running?')
        }
      } finally {
        setIsStreaming(false)
      }
    },
    []
  )

  // ── Run structural analysis after briefing ───────────────────────────────
  const runAnalysis = useCallback(async () => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: MOCK_EVENTS }),
      })
      if (res.ok) {
        const data: AnalysisResult = await res.json()
        setAnalysis(data)
        setAlertDismissed(false)
      }
    } catch (err) {
      console.error('Analysis error:', err)
    }
  }, [])

  // ── Generate briefing ────────────────────────────────────────────────────
  const generateBriefing = useCallback(async (currentLens: Lens = lens) => {
    setIsSpinning(true)
    setTimeout(() => setIsSpinning(false), 800)
    setMode('ambient')
    setActiveCluster(null)
    setActiveBorough(null)
    setActiveLocation(null)
    setLastQuestion(null)

    await streamText(
      '/api/briefing',
      { events: MOCK_EVENTS, lens: currentLens },
      prev => {
        setBriefing(prev)
        setPanelText(prev)
        return prev
      },
      (fullText) => {
        setEmphasisedBorough(detectEmphasizedBorough(fullText))
        // Run structural analysis in parallel after briefing is done
        runAnalysis()
      }
    )
    setLastRefresh(new Date())
    setRefreshCount(c => c + 1)
    if (refreshCount === 0) setTimeout(() => setShowMemory(true), 3000)
  }, [streamText, refreshCount, lens, runAnalysis])

  // Generate on mount + auto-refresh every 90s
  useEffect(() => {
    generateBriefing('desk')
    const id = setInterval(() => generateBriefing(), 90000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Switch lens → regenerate immediately
  const handleLensChange = (newLens: Lens) => {
    if (newLens === lens || isStreaming) return
    setLens(newLens)
    generateBriefing(newLens)
  }

  // Sort clusters by Claude's ranked order (or fallback)
  const sortedClusters = analysis?.rankedClusterIds
    ? [...STORY_CLUSTERS].sort((a, b) => {
        const ai = analysis.rankedClusterIds.indexOf(a.id)
        const bi = analysis.rankedClusterIds.indexOf(b.id)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })
    : STORY_CLUSTERS

  const connectedIds = new Set(analysis?.connections.flat() ?? [])

  // Story card click → drilldown
  const handleCardClick = async (cluster: StoryCluster) => {
    setActiveCluster(cluster)
    setActiveBorough(null)
    setActiveLocation(null)
    setLastQuestion(null)
    setMode('drilldown')
    await streamText('/api/drilldown', { cluster }, prev => {
      setPanelText(prev)
      return prev
    })
  }

  // Borough bar click → borough briefing
  const handleBoroughClick = async (boroughName: string) => {
    setSelectedBorough(boroughName)
    setActiveBorough(boroughName)
    setActiveCluster(null)
    setActiveLocation(null)
    setLastQuestion(null)
    setMode('borough')
    const boroughEvents = MOCK_EVENTS.filter(e => e.borough === boroughName)
    await streamText('/api/briefing', { events: boroughEvents, lens }, prev => {
      setPanelText(prev)
      return prev
    })
  }

  // Pulse ticker click → quick look
  const handlePulseItemClick = async (item: PulseItem) => {
    setSelectedLocation(item.location)
    setActiveLocation(item.location)
    setActiveCluster(null)
    setActiveBorough(null)
    setLastQuestion(null)
    setMode('event')

    const matched = MOCK_EVENTS.filter(e =>
      e.location.toLowerCase().includes(item.location.toLowerCase()) ||
      item.location.toLowerCase().includes(e.neighborhood.toLowerCase())
    )

    const syntheticCluster: StoryCluster = {
      id: `pulse-${item.location}`,
      label: item.location.toUpperCase(),
      headline: item.isLive ? 'Live Now' : 'Recent Activity',
      borough: matched[0]?.borough ?? 'Manhattan',
      location: item.location,
      intensity: item.intensity,
      stats: `${item.views}`,
      subtext: matched[0]?.description ?? item.location,
      events: matched.length > 0 ? matched : [{
        id: 'pulse-synthetic',
        location: item.location,
        neighborhood: item.location,
        borough: 'Manhattan',
        type: 'street',
        title: item.location,
        description: `${item.views} — ${item.isLive ? 'Live right now' : 'Recent activity'}`,
        uploads: 1,
        views: 0,
        isLive: item.isLive,
        intensity: item.intensity,
        minutesAgo: 5,
        gradient: 'from-gray-900 to-gray-800',
      }],
    }

    await streamText('/api/drilldown', { cluster: syntheticCluster }, prev => {
      setPanelText(prev)
      return prev
    })
  }

  // Ask the city
  const handleAsk = async (question: string) => {
    setLastQuestion(question)
    setActiveCluster(null)
    setActiveBorough(null)
    setActiveLocation(null)
    setMode('ask')
    await streamText('/api/ask', { question, events: MOCK_EVENTS }, prev => {
      setPanelText(prev)
      return prev
    })
  }

  const handleBack = () => {
    setMode('ambient')
    setActiveCluster(null)
    setActiveBorough(null)
    setActiveLocation(null)
    setLastQuestion(null)
    setPanelText(briefing)
    setStreamError(null)
  }

  const timeSinceRefresh = lastRefresh
    ? (() => {
        const s = Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
        if (s < 60) return `${s}s ago`
        return `${Math.floor(s / 60)}m ago`
      })()
    : 'loading...'

  const showAlert = analysis && analysis.alertLevel !== 'normal' && !alertDismissed

  return (
    <main className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hot opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-hot" />
          </span>
          <h1 className="text-xl font-black tracking-tight text-white">CITY RIGHT NOW</h1>
        </div>

        <div className="flex items-center gap-3 text-white/30 text-xs">
          <span className="font-mono">{time} · {timeSinceRefresh}</span>
          <button
            onClick={() => generateBriefing()}
            disabled={isStreaming}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Refresh briefing"
          >
            <RefreshCw size={13} className={`text-white/60 ${isSpinning ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* ── Claude Alert Banner ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className={`mx-6 mb-2 flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
              analysis?.alertLevel === 'breaking'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-moderate/10 border-moderate/30'
            }`}>
              <span className={`relative flex h-2 w-2 flex-shrink-0`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${analysis?.alertLevel === 'breaking' ? 'bg-red-400' : 'bg-moderate'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${analysis?.alertLevel === 'breaking' ? 'bg-red-400' : 'bg-moderate'}`} />
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-widest flex-shrink-0 ${analysis?.alertLevel === 'breaking' ? 'text-red-400' : 'text-moderate'}`}>
                {analysis?.alertLevel}
              </span>
              <span className="text-[12px] text-white/70 flex-1 font-mono">{analysis?.alertReason}</span>
              <button onClick={() => setAlertDismissed(true)} className="text-white/20 hover:text-white/50 flex-shrink-0">×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Borough Activity ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 mb-2">
        <BoroughActivity
          boroughs={liveBoroughs}
          onBoroughClick={handleBoroughClick}
          selectedBorough={selectedBorough}
          emphasisedBorough={emphasisedBorough}
        />
      </div>

      {/* ── NYC Pulse Ticker ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 mb-3">
        <NYCPulse
          items={PULSE_ITEMS}
          onItemClick={handlePulseItemClick}
          selectedLocation={selectedLocation}
          liveViews={liveViews}
        />
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 mx-6 mb-2 border-t border-white/[0.06]" />

      {/* ── Lens Switcher ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-6 mb-3">
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mr-1">Perspective</span>
        {(Object.entries(LENS_CONFIG) as [Lens, typeof LENS_CONFIG[Lens]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => handleLensChange(key)}
            disabled={isStreaming}
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all duration-200 disabled:opacity-40 ${
              lens === key ? cfg.activeClass : 'border-white/10 text-white/30 hover:text-white/50'
            }`}
          >
            {cfg.label}
          </button>
        ))}
        {analysis?.topStoryReason && (
          <span className="text-[9px] text-white/20 font-mono ml-auto truncate max-w-[160px]" title={analysis.topStoryReason}>
            ↑ {analysis.topStoryReason}
          </span>
        )}
      </div>

      {/* ── Briefing / Drilldown Panel ──────────────────────────────────── */}
      <BriefingPanel
        text={panelText}
        isStreaming={isStreaming}
        mode={mode}
        activeCluster={activeCluster}
        activeBorough={activeBorough}
        activeLocation={activeLocation}
        lastQuestion={lastQuestion}
        onBack={handleBack}
        onAsk={handleAsk}
        error={streamError}
      />

      {/* ── Story Cards ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <div className="flex-shrink-0 mx-6 mb-2 border-t border-white/[0.06]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2 px-6">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
              Story Clusters
            </p>
            {analysis && (
              <span className="text-[9px] text-white/20 font-mono">· ranked by claude</span>
            )}
          </div>
          <div className="absolute right-0 top-4 bottom-0 w-12 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
          <LayoutGroup>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-6 pb-4" style={{ scrollbarWidth: 'none' }}>
              {sortedClusters.map((cluster, i) => (
                <StoryCard
                  key={cluster.id}
                  cluster={cluster}
                  onClick={handleCardClick}
                  isActive={activeCluster?.id === cluster.id}
                  index={i}
                  isFeatured={i === 0 && !!analysis}
                  isConnected={connectedIds.has(cluster.id)}
                  rank={i}
                />
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* ── Memory Banner ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-4 left-4 right-4 z-20"
          >
            <div className="flex items-start gap-3 bg-surface border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
              <div className="w-5 h-5 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[8px] text-brand-purple font-bold">★</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/50 mb-0.5 font-medium">
                  You were here {USER_MEMORY.lastVisit}. Things changed.
                </p>
                <p className="text-[12px] text-white/80 font-semibold leading-snug">
                  {USER_MEMORY.changes[0]}, {USER_MEMORY.changes[1].toLowerCase()}.
                </p>
              </div>
              <button onClick={() => setShowMemory(false)} className="text-white/20 hover:text-white/50 text-sm flex-shrink-0">×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
