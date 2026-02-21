'use client'

import { useState, useEffect, useCallback } from 'react'
import { BannerCanvas } from '@/components/BannerCanvas'
import type { BannerSpec } from '@/lib/banner'

type Mood = 'DRAMATIC' | 'MINIMAL' | 'CHAOTIC' | 'CORPORATE'

const MOODS: { id: Mood; label: string; color: string }[] = [
  { id: 'DRAMATIC', label: 'DRAMATIC', color: 'border-[#FFD700] text-[#FFD700]' },
  { id: 'MINIMAL',  label: 'MINIMAL',  color: 'border-[#F5F1E5] text-[#F5F1E5]' },
  { id: 'CHAOTIC',  label: 'CHAOTIC',  color: 'border-[#8B3A3A] text-[#8B3A3A]' },
  { id: 'CORPORATE',label: 'CORPORATE',color: 'border-[#2A688C] text-[#2A688C]' },
]

export default function BannerPage() {
  const [spec, setSpec] = useState<BannerSpec | null>(null)
  const [specKey, setSpecKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [mood, setMood] = useState<Mood>('DRAMATIC')

  const generate = useCallback(async (selectedMood: Mood) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood }),
      })
      const data: BannerSpec = await res.json()
      setSpec(data)
      setSpecKey(k => k + 1)
    } catch {
      // silently use whatever spec we have
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    generate('DRAMATIC')
  }, [generate])

  function handleMood(m: Mood) {
    setMood(m)
    generate(m)
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-6 gap-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div>
          <h1 className="text-white font-mono text-sm uppercase tracking-widest opacity-60">
            Generative Banner
          </h1>
          <p className="text-white/30 font-mono text-xs mt-0.5">
            Claude designs the layout every time
          </p>
        </div>
        <a
          href="/dashboard"
          className="text-[11px] font-mono text-white/30 border border-white/10 rounded-lg px-3 py-1.5 hover:text-white/60 hover:border-white/20 transition-colors"
        >
          City Dashboard →
        </a>
      </div>

      {/* Canvas */}
      <div className="w-full max-w-4xl">
        {spec ? (
          <BannerCanvas spec={spec} specKey={specKey} />
        ) : (
          <div
            className="w-full rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center"
            style={{ aspectRatio: '16/9' }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              <p className="text-white/30 font-mono text-xs">Claude is designing the layout…</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {/* Mood pills */}
        <div className="flex items-center gap-2">
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => handleMood(m.id)}
              disabled={isLoading}
              className={`font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1.5 transition-all duration-200 disabled:opacity-40 ${
                mood === m.id
                  ? `${m.color} bg-white/[0.06]`
                  : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Regenerate button */}
        <button
          onClick={() => generate(mood)}
          disabled={isLoading}
          className="flex items-center gap-2.5 bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] hover:border-white/20 text-white font-mono text-sm uppercase tracking-widest rounded-xl px-6 py-3 transition-all duration-200 disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
              <span>Generating…</span>
            </>
          ) : (
            <>
              <span className="text-base leading-none">↺</span>
              <span>Regenerate</span>
            </>
          )}
        </button>

        <p className="text-white/20 font-mono text-[10px] text-center max-w-xs">
          Each click sends the mood to Claude, which returns a JSON layout spec — positions, colors, shapes — that renders this banner
        </p>
      </div>
    </div>
  )
}
