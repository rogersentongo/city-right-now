import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { CityEvent } from '@/data/events'

const client = new Anthropic()

export interface AnalysisResult {
  rankedClusterIds: string[]
  alertLevel: 'breaking' | 'elevated' | 'normal'
  alertReason: string | null
  connections: Array<[string, string]>
  topStoryReason: string
}

export async function POST(req: NextRequest) {
  try {
    const { events } = await req.json() as { events: CityEvent[] }

    const clusterSummary = `
cluster-brooklyn-hot: Brooklyn / Prospect Park + Barclays — 11 uploads, DJ set + post-game crowd, intensity: HOT
cluster-midtown-dark: Manhattan / Times Square — 0 uploads in 47 minutes, intensity: SILENT (anomaly)
cluster-bronx-hidden: Bronx / Burnside Ave — 2 uploads, 300-person block party, 3hrs running, zero outside coverage
cluster-queens-market: Queens / Flushing — 6 uploads, night market running past close
cluster-east-village: Manhattan / Avenue A — 5 uploads, 200-person bar crawl moving north, LIVE`

    const eventSummary = events
      .map(e => {
        const status = e.isLive ? '[LIVE]' : `[${e.minutesAgo}min ago]`
        const gap = e.intensity === 'silent' ? ` — NO UPLOADS IN ${e.minutesAgo}min` : ''
        return `${status} ${e.borough} / ${e.location}: ${e.uploads} uploads, ${e.views} views${gap}`
      })
      .join('\n')

    const prompt = `You are analyzing live NYC activity signals for a real-time city intelligence dashboard.

Story clusters available:
${clusterSummary}

Raw signals:
${eventSummary}

Return ONLY a valid JSON object with exactly this structure — no prose, no markdown, no explanation:
{
  "rankedClusterIds": ["cluster-id-1", "cluster-id-2", "cluster-id-3", "cluster-id-4", "cluster-id-5"],
  "alertLevel": "breaking" | "elevated" | "normal",
  "alertReason": "one sentence explaining the alert, or null if normal",
  "connections": [["cluster-id-a", "cluster-id-b"]],
  "topStoryReason": "one sentence: why is the #1 story the top story right now"
}

Rules:
- rankedClusterIds must contain all 5 cluster IDs, ordered from most to least newsworthy
- alertLevel is "breaking" if something is genuinely anomalous (like Times Square going dark on a Friday), "elevated" if something is building fast, "normal" otherwise
- connections lists pairs of clusters that are narratively linked (e.g. two events feeding the same crowd)
- Return ONLY the JSON. Nothing else.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    // Strip any markdown code fences if Claude wraps it
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result: AnalysisResult = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Analyze API error:', err)
    // Return safe default — don't break the UI
    return NextResponse.json({
      rankedClusterIds: [
        'cluster-brooklyn-hot',
        'cluster-east-village',
        'cluster-queens-market',
        'cluster-bronx-hidden',
        'cluster-midtown-dark',
      ],
      alertLevel: 'normal',
      alertReason: null,
      connections: [],
      topStoryReason: 'Brooklyn is the most active borough right now.',
    } satisfies AnalysisResult)
  }
}
