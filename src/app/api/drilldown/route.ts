import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { StoryCluster } from '@/data/events'

const client = new Anthropic()

function buildDrilldownPrompt(cluster: StoryCluster): string {
  const eventDetails = cluster.events
    .map(e => `- ${e.title}: ${e.description} (${e.uploads} uploads, ${e.views} views, ${e.minutesAgo}min ago)`)
    .join('\n')

  return `You are the intelligence layer for "City Right Now." A user tapped into the "${cluster.headline}" story cluster in ${cluster.borough}.

Cluster: ${cluster.label} — ${cluster.headline}
Location: ${cluster.location}
Stats: ${cluster.stats}

Underlying events:
${eventDetails}

Go deeper. Write 2-3 tight paragraphs that a curious New Yorker would want to read at midnight. Cover:
- What's actually happening on the ground right now
- What the upload pattern tells you (timing, frequency, who's filming)
- What might happen next — or what question the data can't answer yet

Rules:
- Specific. Vivid. Present tense.
- No bullets. No headers. Pure prose.
- Max 180 words.
- Sound like you've been watching this cluster specifically for the last hour.`
}

export async function POST(req: NextRequest) {
  try {
    const { cluster } = await req.json() as { cluster: StoryCluster }

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 350,
      messages: [{ role: 'user', content: buildDrilldownPrompt(cluster) }],
    }, { signal: req.signal })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (req.signal.aborted) { controller.close(); return }
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
        } catch {
          // client disconnected
        }
        controller.close()
      },
      cancel() { stream.controller.abort() },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Drilldown API error:', err)
    return NextResponse.json({ error: 'Claude unavailable — check ANTHROPIC_API_KEY' }, { status: 500 })
  }
}
