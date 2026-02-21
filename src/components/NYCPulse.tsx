'use client'

import { useRef, useEffect } from 'react'
import type { PulseItem } from '@/data/events'

interface NYCPulseProps {
  items: PulseItem[]
  onItemClick?: (item: PulseItem) => void
  selectedLocation?: string
  liveViews?: Record<string, number>
}

const DOT_COLORS = {
  hot: 'bg-hot',
  moderate: 'bg-moderate',
  normal: 'bg-cool',
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return `${n}`
}

export function NYCPulse({ items, onItemClick, selectedLocation, liveViews }: NYCPulseProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollX = useRef(0)
  const direction = useRef(1)
  const isUserScrolling = useRef(false)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const tick = () => {
      if (!isUserScrolling.current) {
        scrollX.current += direction.current * 0.4
        const max = container.scrollWidth - container.clientWidth
        if (scrollX.current >= max) direction.current = -1
        if (scrollX.current <= 0) direction.current = 1
        container.scrollLeft = scrollX.current
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    const pause = () => {
      isUserScrolling.current = true
    }
    const resume = () => {
      setTimeout(() => { isUserScrolling.current = false }, 1500)
    }

    container.addEventListener('mouseenter', pause)
    container.addEventListener('mouseleave', resume)
    container.addEventListener('touchstart', pause, { passive: true })
    container.addEventListener('touchend', resume)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      container.removeEventListener('mouseenter', pause)
      container.removeEventListener('mouseleave', resume)
      container.removeEventListener('touchstart', pause)
      container.removeEventListener('touchend', resume)
    }
  }, [])

  return (
    <div className="relative">
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-6">
        NYC Pulse
      </p>
      {/* fade-right edge */}
      <div className="absolute right-0 top-5 bottom-0 w-12 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-scroll scrollbar-hide px-6 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => {
          const isActive = selectedLocation === item.location
          return (
            <button
              key={i}
              onClick={() => onItemClick?.(item)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-brand-purple/20 border-brand-purple/40 text-white'
                  : 'bg-white/[0.06] border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLORS[item.intensity]} ${
                  item.intensity === 'hot' ? 'animate-pulse-fast' : 'animate-pulse-slow'
                }`}
              />
              <span>{item.location}</span>
              <span className="text-[10px] text-white/40 font-normal">
                {liveViews?.[item.location] != null
                  ? item.isLive
                    ? `Live · ${formatCount(liveViews[item.location])}`
                    : `${formatCount(liveViews[item.location])} views`
                  : item.views}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
