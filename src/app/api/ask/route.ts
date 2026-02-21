import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { CityEvent } from '@/data/events'

const client = new Anthropic()

function buildAskPrompt(question: string, events: CityEvent[]): string {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const eventSummary = events
    .map(e => {
      const status = e.isLive ? '[LIVE]' : `[${e.minutesAgo}min ago]`
      return `${status} ${e.borough} / ${e.location}: "${e.title}" — ${e.uploads} uploads, ${e.views} views`
    })
    .join('\n')

  return `You are the intelligence layer for "City Right Now" — a real-time ambient awareness system for New York City. It is ${timeStr} on a Friday night.

Live NYC activity right now:
${eventSummary}

A user just asked: "${question}"

Answer directly and specifically using this live data. Be editorial, sharp, and present tense. Reference actual locations, upload counts, and times when relevant. If it's a "where should I go" question, give a real recommendation with reasoning from the data. If it's a factual question about what's happening, answer it precisely.

Max 120 words. No headers. No bullets. Pure prose. Sound like a city insider who has been watching all night.`
}

export async function POST(req: NextRequest) {
  try {
    const { question, events } = await req.json() as { question: string; events: CityEvent[] }

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 250,
      messages: [{ role: 'user', content: buildAskPrompt(question, events) }],
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
    console.error('Ask API error:', err)
    return NextResponse.json({ error: 'Claude unavailable — check ANTHROPIC_API_KEY' }, { status: 500 })
  }
}
