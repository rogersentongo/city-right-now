'use client'

import { motion } from 'framer-motion'
import type { StoryCluster } from '@/data/events'

interface StoryCardProps {
  cluster: StoryCluster
  onClick: (cluster: StoryCluster) => void
  isActive: boolean
  index: number
  isFeatured?: boolean
  isConnected?: boolean
  rank?: number
}

const INTENSITY_CONFIG = {
  hot: {
    dot: 'bg-hot animate-pulse-fast',
    border: 'border-hot/20',
    accent: 'text-hot',
    label: 'bg-hot/10 text-hot border-hot/20',
    glow: 'shadow-hot/5',
  },
  moderate: {
    dot: 'bg-moderate animate-pulse-slow',
    border: 'border-moderate/20',
    accent: 'text-moderate',
    label: 'bg-moderate/10 text-moderate border-moderate/20',
    glow: 'shadow-moderate/5',
  },
  normal: {
    dot: 'bg-cool',
    border: 'border-white/10',
    accent: 'text-cool',
    label: 'bg-white/5 text-white/50 border-white/10',
    glow: '',
  },
  silent: {
    dot: 'bg-white/20',
    border: 'border-white/10',
    accent: 'text-white/40',
    label: 'bg-white/5 text-white/40 border-white/10',
    glow: '',
  },
}

export function StoryCard({ cluster, onClick, isActive, index, isFeatured, isConnected, rank }: StoryCardProps) {
  const cfg = INTENSITY_CONFIG[cluster.intensity]

  return (
    <motion.button
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, layout: { duration: 0.45, type: 'spring', stiffness: 220, damping: 28 } }}
      onClick={() => onClick(cluster)}
      className={`flex-shrink-0 rounded-2xl border bg-white/[0.04] p-4 text-left transition-all duration-200 hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98] shadow-lg ${cfg.border} ${cfg.glow} ${
        isFeatured ? 'w-64 bg-white/[0.07] border-hot/30 ring-1 ring-hot/20' : 'w-52'
      } ${isActive ? 'ring-1 ring-brand-purple/40 bg-brand-purple/5' : ''}`}
    >
      {/* Featured / rank badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.accent}`}>
            {cluster.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isConnected && (
            <span className="text-[9px] text-white/30 font-mono border border-white/10 rounded px-1 py-0.5">~linked</span>
          )}
          {isFeatured && (
            <span className="text-[9px] font-bold text-hot uppercase tracking-widest bg-hot/10 border border-hot/20 rounded px-1.5 py-0.5">
              TOP STORY
            </span>
          )}
          {!isFeatured && rank !== undefined && rank > 0 && (
            <span className="text-[9px] text-white/20 font-mono">#{rank + 1}</span>
          )}
        </div>
      </div>

      {/* Headline */}
      <p className={`font-bold text-white leading-tight mb-1 ${isFeatured ? 'text-lg' : 'text-base'}`}>
        {cluster.headline}
      </p>
      <p className="text-[11px] text-white/50 mb-3 leading-snug">{cluster.location}</p>

      {/* Stats */}
      <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-semibold mb-2 ${cfg.label}`}>
        {cluster.stats}
      </div>

      <p className="text-[11px] text-white/40 leading-snug">{cluster.subtext}</p>

      {/* CTA */}
      <div className="mt-3 flex items-center gap-1 text-[11px] text-brand-purple font-semibold">
        <span>Brief me</span>
        <span>→</span>
      </div>
    </motion.button>
  )
}
