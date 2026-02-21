import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { CityViewSchema, type CityView } from '@/lib/cityview'
import type { CityEvent } from '@/data/events'

const client = new Anthropic()

function buildPrompt(query: string, events: CityEvent[]): string {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const eventSummary = events
    .map(e => {
      const status = e.isLive ? '[LIVE]' : `[${e.minutesAgo}min ago]`
      const gap = e.intensity === 'silent' ? ` — NO UPLOADS IN ${e.minutesAgo}min` : ''
      return `${status} ${e.borough} / ${e.location}: "${e.title}" — ${e.uploads} uploads, ${e.views} views${gap}`
    })
    .join('\n')

  return `You are the layout engine for "City Right Now" — a real-time NYC intelligence dashboard. Time: ${timeStr} on a Friday night.

Live NYC signals:
${eventSummary}

User query: "${query}"

Your job: return a JSON array of widgets that directly answers this query. The widget array IS the interface — different queries produce radically different layouts.

WIDGET TYPES (use only these):

1. page_header — ALWAYS first: { "type": "page_header", "title": "bold 3-5 word answer to the query", "subtitle": "1-line context, stats, timestamp" }

2. alert — ONLY if genuinely breaking/anomalous: { "type": "alert", "level": "breaking"|"elevated", "message": "specific detail, not generic" }

3. briefing — prose response to the query: { "type": "briefing", "label": "optional label e.g. THE TAKE / LOCAL INTEL / ANOMALY", "content": "2-4 sentences, present tense, hyper-specific, use upload counts and locations" }

4. story_grid — 1-5 relevant events: { "type": "story_grid", "stories": [{ "headline": "...", "location": "...", "intensity": "hot"|"moderate"|"normal"|"silent", "stats": "X uploads · Y views", "subtext": "one sentence detail" }] }

5. borough_chart — show borough activity bars: { "type": "borough_chart", "highlight": "borough to emphasize or omit", "note": "claude's annotation e.g. Queens is the outlier tonight" }

6. pulse_feed — show live location ticker: { "type": "pulse_feed", "focus": "optional borough/area to focus on", "note": "optional context" }

7. stat_row — key numbers: { "type": "stat_row", "stats": [{ "label": "...", "value": "...", "trend": "up"|"down"|"flat" }] }

8. divider — visual break: { "type": "divider", "label": "optional section label" }

RULES:
- Always start with page_header
- Always include at least one briefing widget
- Only include alert if the data genuinely supports it (Times Square gap, something breaking)
- Choose widgets that SERVE THE QUERY. "Brooklyn?" → story_grid + borough_chart. "What's quiet?" → stat_row + borough_chart + pulse_feed. "What's breaking?" → alert + briefing + story_grid.
- 3-6 widgets total is ideal. Never more than 8.
- Write all prose in present tense, editorial voice, specific details from the data
- Output ONLY the JSON array. Nothing else. No markdown.`
}

const FALLBACK: CityView = [
  { type: 'page_header', title: 'NYC Right Now', subtitle: 'City intelligence loading…' },
  { type: 'briefing', label: 'STATUS', content: 'Reading the city. The data is live — try asking about a specific borough, what\'s breaking, or where the energy is.' },
]

export async function POST(req: NextRequest) {
  try {
    const { query, events } = await req.json() as { query: string; events: CityEvent[] }

    if (!query?.trim()) {
      return NextResponse.json(FALLBACK)
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: buildPrompt(query, events ?? []) }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const parsed = JSON.parse(cleaned)
    const validated = CityViewSchema.parse(parsed)

    return NextResponse.json(validated)
  } catch (err) {
    console.error('CityView API error:', err)
    return NextResponse.json(FALLBACK)
  }
}
