'use client'

import { useState, useRef, useEffect } from 'react'

interface CityInputProps {
  onAsk: (question: string) => void
  isStreaming: boolean
  disabled?: boolean
}

const EXAMPLE_QUERIES = [
  'where should I go right now?',
  'what\'s the most unusual thing happening?',
  'what\'s happening in Brooklyn?',
  'where\'s the best energy tonight?',
]

export function CityInput({ onAsk, isStreaming, disabled }: CityInputProps) {
  const [value, setValue] = useState('')
  const [placeholder, setPlaceholder] = useState(EXAMPLE_QUERIES[0])
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholderIdx = useRef(0)

  // Cycle placeholder examples
  useEffect(() => {
    const id = setInterval(() => {
      placeholderIdx.current = (placeholderIdx.current + 1) % EXAMPLE_QUERIES.length
      setPlaceholder(EXAMPLE_QUERIES[placeholderIdx.current])
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const handleSubmit = () => {
    const q = value.trim()
    if (!q || isStreaming || disabled) return
    onAsk(q)
    setValue('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2.5 focus-within:border-white/20 transition-colors">
        <span className="text-white/20 text-[11px] font-bold uppercase tracking-widest flex-shrink-0">›</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          disabled={isStreaming || disabled}
          className="flex-1 bg-transparent text-white/70 text-[13px] font-mono placeholder:text-white/20 outline-none disabled:opacity-40"
        />
        {value.trim() && (
          <button
            onClick={handleSubmit}
            disabled={isStreaming || disabled}
            className="flex-shrink-0 text-[11px] text-white/40 hover:text-white/70 transition-colors font-mono disabled:opacity-30"
          >
            ask ↵
          </button>
        )}
      </div>
    </div>
  )
}
