'use client'

import { motion } from 'framer-motion'
import type { BoroughData } from '@/data/events'

interface BoroughActivityProps {
  boroughs: BoroughData[]
  onBoroughClick?: (name: string) => void
  selectedBorough?: string
  emphasisedBorough?: string
}

const BAR_COLORS = {
  high: 'bg-gradient-to-r from-cool to-emerald-400',
  moderate: 'bg-gradient-to-r from-moderate to-amber-400',
  low: 'bg-gradient-to-r from-white/20 to-white/30',
}

export function BoroughActivity({ boroughs, onBoroughClick, selectedBorough, emphasisedBorough }: BoroughActivityProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2 px-6">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
          Borough Activity
        </p>
        {emphasisedBorough && (
          <span className="text-[9px] text-cool/60 font-mono">
            · claude sees {emphasisedBorough.toLowerCase()}
          </span>
        )}
      </div>
      <div className="absolute right-0 top-5 bottom-0 w-12 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-6 pb-1" style={{ scrollbarWidth: 'none' }}>
        {boroughs.map((b, i) => {
          const isActive = selectedBorough === b.name
          const isEmphasised = emphasisedBorough === b.name
          return (
            <button
              key={i}
              onClick={() => onBoroughClick?.(b.name)}
              className={`flex-shrink-0 rounded-xl px-3 py-2 min-w-[90px] border text-left transition-all duration-300 ${
                isActive
                  ? 'bg-brand-purple/15 border-brand-purple/30'
                  : isEmphasised
                  ? 'bg-cool/10 border-cool/30'
                  : 'bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-1 mb-1.5">
                <p className="text-[11px] font-bold text-white leading-none">{b.name}</p>
                {isEmphasised && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cool opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cool" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${BAR_COLORS[b.intensity]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-[10px] text-white/50 font-medium tabular-nums">{b.percentage}%</span>
              </div>
              <p className={`text-[9px] mt-1 font-medium ${
                b.delta.startsWith('+') ? 'text-cool' : 'text-white/30'
              }`}>{b.delta}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
