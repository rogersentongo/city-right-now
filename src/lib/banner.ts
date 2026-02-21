import { z } from 'zod'

// ── Schema ──────────────────────────────────────────────────────────────────

const ShapeSchema = z.object({
  type: z.enum(['circle', 'rectangle', 'line']),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  size: z.number().min(1).max(60),
  color: z.enum(['#FFD700', '#F5F1E5', '#2A688C', '#8B3A3A']),
  opacity: z.number().min(0.02).max(0.35),
  rotation: z.number().min(-180).max(180).optional(),
})

export const BannerSpecSchema = z.object({
  background: z.object({
    gradientAngle: z.number().min(0).max(360),
    gradientStops: z.array(z.object({
      color: z.string(),
      position: z.number().min(0).max(100),
    })).min(2).max(4),
    shapes: z.array(ShapeSchema).min(3).max(7),
  }),
  headline: z.object({
    lines: z.array(z.string()).min(1).max(3),
    sizeVw: z.number().min(5).max(18),
    color: z.enum(['#FFD700', '#F5F1E5']),
    xPct: z.number().min(3).max(70),
    yPct: z.number().min(10).max(85),
    align: z.enum(['left', 'center', 'right']),
  }),
  subhead: z.object({
    content: z.string(),
    sizeVw: z.number().min(1.5).max(5),
    color: z.enum(['#FFD700', '#F5F1E5', '#2A688C']),
    xPct: z.number().min(3).max(80),
    yPct: z.number().min(20).max(92),
  }),
  details: z.object({
    content: z.string(),
    sizeVw: z.number().min(1).max(3.5),
    color: z.enum(['#FFD700', '#F5F1E5', '#2A688C']),
    xPct: z.number().min(3).max(80),
    yPct: z.number().min(30).max(94),
  }),
  sponsors: z.object({
    items: z.array(z.string()).min(4).max(10),
    xPct: z.number().min(3).max(20),
    yPct: z.number().min(70).max(97),
    color: z.enum(['#F5F1E5', '#FFD700']),
    sizeVw: z.number().min(1).max(2.5),
    layout: z.enum(['row', 'grid']),
  }),
})

export type BannerSpec = z.infer<typeof BannerSpecSchema>

// ── Default fallback ─────────────────────────────────────────────────────────

export const DEFAULT_BANNER: BannerSpec = {
  background: {
    gradientAngle: 135,
    gradientStops: [
      { color: '#0d0d1a', position: 0 },
      { color: '#0a0a12', position: 60 },
      { color: '#12080f', position: 100 },
    ],
    shapes: [
      { type: 'circle', x: 82, y: 18, size: 28, color: '#FFD700', opacity: 0.07, rotation: 0 },
      { type: 'circle', x: 12, y: 75, size: 18, color: '#2A688C', opacity: 0.14 },
      { type: 'rectangle', x: 55, y: 45, size: 38, color: '#8B3A3A', opacity: 0.05, rotation: 42 },
      { type: 'circle', x: 95, y: 85, size: 12, color: '#F5F1E5', opacity: 0.04 },
      { type: 'line', x: 30, y: 10, size: 25, color: '#FFD700', opacity: 0.06, rotation: -20 },
    ],
  },
  headline: {
    lines: ['interfaces', 'hackathon'],
    sizeVw: 12,
    color: '#FFD700',
    xPct: 7,
    yPct: 52,
    align: 'left',
  },
  subhead: {
    content: 'with * Claude',
    sizeVw: 3.2,
    color: '#F5F1E5',
    xPct: 7,
    yPct: 70,
  },
  details: {
    content: 'feb 21st · 9am–9pm · AI TINKERERS',
    sizeVw: 1.9,
    color: '#F5F1E5',
    xPct: 7,
    yPct: 78,
  },
  sponsors: {
    items: ['TAVUS', 'COPILOTKIT', 'ANTHROP\\C', 'REDIS', 'BETAWORKS'],
    xPct: 7,
    yPct: 90,
    color: '#F5F1E5',
    sizeVw: 1.4,
    layout: 'row',
  },
}
