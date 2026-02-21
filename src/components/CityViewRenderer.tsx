'use client'

import { motion } from 'framer-motion'
import { BoroughActivity } from '@/components/BoroughActivity'
import { NYCPulse } from '@/components/NYCPulse'
import type { CityWidget, CityView } from '@/lib/cityview'
import type { BoroughData, PulseItem } from '@/data/events'

interface RendererProps {
  view: CityView
  boroughs: BoroughData[]
  pulseItems: PulseItem[]
  liveViews: Record<string, number>
}

export function CityViewRenderer({ view, boroughs, pulseItems, liveViews }: RendererProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {view.map((widget, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: 'easeOut' }}
        >
          <WidgetSwitch
            widget={widget}
            boroughs={boroughs}
            pulseItems={pulseItems}
            liveViews={liveViews}
          />
        </motion.div>
      ))}
    </div>
  )
}

interface WidgetProps {
  widget: CityWidget
  boroughs: BoroughData[]
  pulseItems: PulseItem[]
  liveViews: Record<string, number>
}

function WidgetSwitch({ widget, boroughs, pulseItems, liveViews }: WidgetProps) {
  switch (widget.type) {
    case 'page_header':
      return (
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{widget.title}</h2>
          <p className="text-[12px] text-white/40 font-mono mt-1">{widget.subtitle}</p>
        </div>
      )

    case 'alert':
      return (
        <div className="mx-6">
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            widget.level === 'breaking'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-moderate/10 border-moderate/30'
          }`}>
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                widget.level === 'breaking' ? 'bg-red-400' : 'bg-moderate'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                widget.level === 'breaking' ? 'bg-red-400' : 'bg-moderate'
              }`} />
            </span>
            <span className={`text-[11px] font-bold uppercase tracking-widest flex-shrink-0 ${
              widget.level === 'breaking' ? 'text-red-400' : 'text-moderate'
            }`}>
              {widget.level}
            </span>
            <span className="text-[12px] text-white/80 font-mono">{widget.message}</span>
          </div>
        </div>
      )

    case 'briefing':
      return (
        <div className="px-6">
          {widget.label && (
            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2">{widget.label}</p>
          )}
          <p className="text-[14px] text-white/80 leading-relaxed font-light">{widget.content}</p>
        </div>
      )

    case 'story_grid':
      return (
        <div className="px-6">
          <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2">Stories</p>
          <div className="grid grid-cols-1 gap-2">
            {widget.stories.map((story, i) => (
              <StoryWidget key={i} story={story} />
            ))}
          </div>
        </div>
      )

    case 'borough_chart':
      return (
        <div>
          {widget.note && (
            <p className="text-[10px] text-white/30 font-mono px-6 mb-1">{widget.note}</p>
          )}
          <BoroughActivity
            boroughs={boroughs}
            emphasisedBorough={widget.highlight}
          />
        </div>
      )

    case 'pulse_feed':
      return (
        <div>
          {widget.note && (
            <p className="text-[10px] text-white/30 font-mono px-6 mb-1">{widget.note}</p>
          )}
          <NYCPulse items={pulseItems} liveViews={liveViews} />
        </div>
      )

    case 'stat_row':
      return (
        <div className="px-6">
          <div className="flex flex-wrap gap-3">
            {widget.stats.map((stat, i) => (
              <div key={i} className="flex-1 min-w-[100px] bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-0.5">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[18px] font-black text-white leading-none">{stat.value}</span>
                  {stat.trend && (
                    <span className={`text-[10px] font-bold ${
                      stat.trend === 'up' ? 'text-cool' : stat.trend === 'down' ? 'text-hot' : 'text-white/30'
                    }`}>
                      {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'divider':
      return (
        <div className="px-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          {widget.label && (
            <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">{widget.label}</span>
          )}
          {widget.label && <div className="flex-1 h-px bg-white/[0.06]" />}
        </div>
      )
  }
}

const INTENSITY_STYLES = {
  hot:      { dot: 'bg-hot animate-pulse-fast', border: 'border-hot/20', badge: 'bg-hot/10 text-hot border-hot/20' },
  moderate: { dot: 'bg-moderate animate-pulse-slow', border: 'border-moderate/20', badge: 'bg-moderate/10 text-moderate border-moderate/20' },
  normal:   { dot: 'bg-cool', border: 'border-white/10', badge: 'bg-white/5 text-white/40 border-white/10' },
  silent:   { dot: 'bg-white/20', border: 'border-white/10', badge: 'bg-white/5 text-white/30 border-white/10' },
}

function StoryWidget({ story }: { story: { headline: string; location: string; intensity: 'hot' | 'moderate' | 'normal' | 'silent'; stats: string; subtext: string } }) {
  const styles = INTENSITY_STYLES[story.intensity]
  return (
    <div className={`rounded-xl border bg-white/[0.04] px-4 py-3 ${styles.border}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
        <span className={`text-[9px] font-bold uppercase tracking-widest border rounded px-1.5 py-0.5 ${styles.badge}`}>
          {story.stats}
        </span>
      </div>
      <p className="text-[14px] font-bold text-white leading-tight mb-0.5">{story.headline}</p>
      <p className="text-[11px] text-white/40 mb-1">{story.location}</p>
      <p className="text-[11px] text-white/35 leading-snug">{story.subtext}</p>
    </div>
  )
}
