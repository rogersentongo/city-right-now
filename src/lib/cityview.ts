import { z } from 'zod'

export const WidgetSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('page_header'),
    title: z.string(),
    subtitle: z.string(),
  }),
  z.object({
    type: z.literal('alert'),
    level: z.enum(['breaking', 'elevated']),
    message: z.string(),
  }),
  z.object({
    type: z.literal('briefing'),
    label: z.string().optional(),
    content: z.string(),
  }),
  z.object({
    type: z.literal('story_grid'),
    stories: z.array(z.object({
      headline: z.string(),
      location: z.string(),
      intensity: z.enum(['hot', 'moderate', 'normal', 'silent']),
      stats: z.string(),
      subtext: z.string(),
    })).min(1).max(5),
  }),
  z.object({
    type: z.literal('borough_chart'),
    highlight: z.string().optional(),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal('pulse_feed'),
    focus: z.string().optional(),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal('stat_row'),
    stats: z.array(z.object({
      label: z.string(),
      value: z.string(),
      trend: z.enum(['up', 'down', 'flat']).optional(),
    })).min(2).max(5),
  }),
  z.object({
    type: z.literal('divider'),
    label: z.string().optional(),
  }),
])

export type CityWidget = z.infer<typeof WidgetSchema>
export const CityViewSchema = z.array(WidgetSchema).min(2).max(8)
export type CityView = z.infer<typeof CityViewSchema>
