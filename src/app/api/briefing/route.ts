import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { CityEvent } from '@/data/events'

const client = new Anthropic()

type Lens = 'desk' | 'local' | 'tourist'

function buildPrompt(events: CityEvent[], lens: Lens): string {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const eventSummary = events
    .map(e => {
      const status = e.isLive ? '[LIVE]' : `[${e.minutesAgo}min ago]`
      const gap = e.intensity === 'silent' ? ` — NO UPLOADS IN ${e.minutesAgo}min` : ''
      return `${status} ${e.borough} / ${e.location}: "${e.title}" — ${e.uploads} uploads, ${e.views} views${gap}`
    })
    .join('\n')

  const voiceInstructions: Record<Lens, string> = {
    desk: `Write a city briefing in the voice of a sharp city desk editor. Exactly 3 short paragraphs:

1. Where the city is loudest right now — the cluster, the energy, what's surprising about it
2. The anomaly — what's suspiciously quiet, what data gap is itself a signal
3. The hidden story — low-upload but high-signal, the thing nobody outside the neighborhood knows yet

Rules:
- Be hyper-specific. Use upload counts, time gaps, location names.
- Write in present tense. The city is happening RIGHT NOW.
- Never use bullets, headers, or lists. Pure prose.
- Max 220 words total. Dense, punchy, editorial.
- Do NOT start with "I" or "The city". Start with the action.
- Sound like a human who has been watching this city all night.`,

    local: `Write about tonight like you're texting your friend who just moved to NYC from Ohio. You've lived here 25 years. You know these streets. Exactly 3 short paragraphs:

1. What's actually popping right now and why it matters if you know the neighborhood
2. Something weird or off that a tourist would never notice but a local clocks immediately
3. The thing happening that nobody's talking about but should be — the real local knowledge

Rules:
- Casual but specific. First name streets, mention subway stops, say "the L" not "the L train".
- Drop local references. "Classic Barclays crowd" type energy.
- Present tense. Personal. Max 200 words.
- Sound like you're genuinely excited to tell someone about your city tonight.
- Never use bullets or headers. Just text like a message.`,

    tourist: `Write about tonight's NYC as if you're an excited tourist experiencing it for the first time this weekend. You've seen it on TikTok, you've dreamed about it, and now you're HERE. Exactly 3 short paragraphs:

1. The big energy you're picking up on — what feels electric and unmissable right now
2. Something that surprised you — different from what you expected
3. The unexpected gem — the thing that wasn't on your itinerary but you're so glad you found

Rules:
- Enthusiastic but not cringe. Genuine wonder, not fake excitement.
- Use recognizable landmarks but also discover the unexpected.
- Max 200 words. Present tense. Conversational.
- Make someone reading this want to put their phone down and go outside.
- Never use bullets or headers.`,
  }

  return `You are the intelligence layer for "City Right Now" — a real-time ambient briefing system for New York City.

Current time: ${timeStr} on a Friday night.

Live NYC activity signals:
${eventSummary}

${voiceInstructions[lens]}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { events: CityEvent[]; lens?: Lens }
    const { events, lens = 'desk' } = body

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(events, lens) }],
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
          // client disconnected or aborted — swallow
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
    console.error('Briefing API error:', err)
    return NextResponse.json({ error: 'Claude unavailable — check ANTHROPIC_API_KEY' }, { status: 500 })
  }
}
