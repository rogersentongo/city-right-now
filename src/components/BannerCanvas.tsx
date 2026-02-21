'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { BannerSpec } from '@/lib/banner'

interface BannerCanvasProps {
  spec: BannerSpec
  specKey: number // increment to trigger fade transition
}

export function BannerCanvas({ spec, specKey }: BannerCanvasProps) {
  const { background, headline, subhead, details, sponsors } = spec

  const bgGradient = `linear-gradient(${background.gradientAngle}deg, ${
    background.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')
  })`

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={specKey}
        initial={{ opacity: 0, filter: 'blur(12px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(8px)' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
        style={{ aspectRatio: '16/9', background: bgGradient }}
      >
        {/* Abstract background shapes */}
        {background.shapes.map((shape, i) => {
          const base = {
            position: 'absolute' as const,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            opacity: shape.opacity,
            transform: `translate(-50%, -50%) rotate(${shape.rotation ?? 0}deg)`,
          }

          if (shape.type === 'circle') {
            return (
              <div
                key={i}
                style={{
                  ...base,
                  width: `${shape.size}%`,
                  paddingBottom: `${shape.size}%`,
                  borderRadius: '50%',
                  background: shape.color,
                }}
              />
            )
          }

          if (shape.type === 'rectangle') {
            return (
              <div
                key={i}
                style={{
                  ...base,
                  width: `${shape.size}%`,
                  height: `${shape.size * 0.6}%`,
                  background: shape.color,
                }}
              />
            )
          }

          // line
          return (
            <div
              key={i}
              style={{
                ...base,
                width: `${shape.size}%`,
                height: '1px',
                background: shape.color,
              }}
            />
          )
        })}

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Headline */}
        <div
          className="absolute"
          style={{
            left: `${headline.xPct}%`,
            top: `${headline.yPct}%`,
            textAlign: headline.align,
            transform: 'translateY(-50%)',
          }}
        >
          {headline.lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: `${headline.sizeVw}vw`,
                fontWeight: 700,
                color: headline.color,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Subhead */}
        <div
          className="absolute"
          style={{
            left: `${subhead.xPct}%`,
            top: `${subhead.yPct}%`,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: `${subhead.sizeVw}vw`,
            color: subhead.color,
            fontWeight: 500,
            letterSpacing: '0.01em',
            transform: 'translateY(-50%)',
          }}
        >
          {subhead.content}
        </div>

        {/* Details */}
        <div
          className="absolute"
          style={{
            left: `${details.xPct}%`,
            top: `${details.yPct}%`,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: `${details.sizeVw}vw`,
            color: details.color,
            opacity: 0.7,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transform: 'translateY(-50%)',
          }}
        >
          {details.content}
        </div>

        {/* Sponsors */}
        <div
          className="absolute"
          style={{
            left: `${sponsors.xPct}%`,
            top: `${sponsors.yPct}%`,
            transform: 'translateY(-50%)',
            display: sponsors.layout === 'row' ? 'flex' : 'grid',
            gridTemplateColumns: sponsors.layout === 'grid' ? 'repeat(3, auto)' : undefined,
            gap: `${sponsors.sizeVw * 0.6}vw`,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {sponsors.items.map((s, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: `${sponsors.sizeVw}vw`,
                color: sponsors.color,
                opacity: 0.6,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
