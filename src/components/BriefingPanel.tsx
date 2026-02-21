'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { StoryCluster } from '@/data/events'
import { CityInput } from './CityInput'

type PanelMode = 'ambient' | 'drilldown' | 'borough' | 'event' | 'ask'

interface BriefingPanelProps {
  text: string
  isStreaming: boolean
  mode: PanelMode
  activeCluster?: StoryCluster | null
  activeBorough?: string | null
  activeLocation?: string | null
  lastQuestion?: string | null
  onBack?: () => void
  onAsk?: (question: string) => void
  error?: string | null
}

const MODE_LABELS: Record<PanelMode, string> = {
  ambient: 'The Briefing',
  drilldown: 'Drilling into',
  borough: 'Borough focus',
  event: 'Quick look',
  ask: 'City responds',
}

function getModeLabel(mode: PanelMode, opts: { activeCluster?: StoryCluster | null; activeBorough?: string | null; activeLocation?: string | null; lastQuestion?: string | null }) {
  switch (mode) {
    case 'drilldown': return `Drilling into: ${opts.activeCluster?.label ?? ''}`
    case 'borough': return `Borough focus: ${opts.activeBorough ?? ''}`
    case 'event': return `Quick look: ${opts.activeLocation ?? ''}`
    case 'ask': return `City responds: "${opts.lastQuestion ?? ''}"`
    default: return MODE_LABELS[mode]
  }
}

export function BriefingPanel({
  text,
  isStreaming,
  mode,
  activeCluster,
  activeBorough,
  activeLocation,
  lastQuestion,
  onBack,
  onAsk,
  error,
}: BriefingPanelProps) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  const isNonAmbient = mode !== 'ambient'
  const label = getModeLabel(mode, { activeCluster, activeBorough, activeLocation, lastQuestion })

  return (
    <div className="flex-1 min-h-0 px-6 py-4 overflow-y-auto flex flex-col">
      {/* Mode header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          {isNonAmbient && (
            <button
              onClick={onBack}
              className="text-[11px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 mr-2"
            >
              ← back
            </button>
          )}
          <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
            {label}
          </span>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse-fast" />
            <span className="text-[10px] text-brand-purple/70 font-medium">generating</span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && !isStreaming && (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
          <span className="text-[11px] text-red-400/80 font-mono">{error}</span>
        </div>
      )}

      {/* Empty / loading state */}
      {!text && !error && isStreaming && (
        <div className="space-y-3">
          {[100, 85, 92, 75, 88, 60].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded bg-white/[0.05] animate-pulse"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      )}

      {/* Briefing text */}
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={mode + (activeCluster?.id ?? '') + (activeBorough ?? '') + (activeLocation ?? '')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 flex-1"
          >
            {paragraphs.length > 0
              ? paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="font-mono text-[15px] leading-relaxed text-white/80 tracking-tight"
                  >
                    {para}
                    {/* Blinking cursor on last paragraph while streaming */}
                    {isStreaming && i === paragraphs.length - 1 && (
                      <span className="inline-block w-[2px] h-[1em] bg-brand-purple align-middle ml-0.5 animate-blink" />
                    )}
                  </p>
                ))
              : (
                <p className="font-mono text-[15px] leading-relaxed text-white/80 tracking-tight">
                  {text}
                  {isStreaming && (
                    <span className="inline-block w-[2px] h-[1em] bg-brand-purple align-middle ml-0.5 animate-blink" />
                  )}
                </p>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ask the City input — always visible */}
      {onAsk && (
        <div className="flex-shrink-0 mt-auto pt-2">
          <CityInput onAsk={onAsk} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  )
}
