import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { BannerSpecSchema, DEFAULT_BANNER } from '@/lib/banner'

const client = new Anthropic()

// ── Prompt ───────────────────────────────────────────────────────────────────

function getMoodInstructions(mood: string): string {
  const map: Record<string, string> = {
    DRAMATIC: 'Make the headline massive (sizeVw 14-18), use extreme contrast, place shapes boldly at corners, deep dark background gradient',
    MINIMAL: 'Smaller headline (sizeVw 7-10), lots of breathing room, fewer shapes (3-4), subtle opacity values (0.03-0.08), elegant positioning',
    CHAOTIC: 'Overlapping shapes (5-7), varied rotations, headline positioned off-center, high energy layout, mix of shape types',
    CORPORATE: 'Clean grid layout, headline left-aligned at bottom third, sponsors in a tidy row, shapes are subtle circles only, professional feel',
  }
  return map[mood] ?? map.DRAMATIC
}

function buildPrompt(mood: string): string {
  return `You are a layout engine for a generative banner designer. Output ONLY valid JSON, no markdown, no prose.

Generate a promotional banner spec for the "Interfaces Hackathon with Claude" event. Mood: ${mood}.

REQUIRED TEXT (use exactly):
- Headline: "interfaces hackathon" (split across 1-2 lines however you like)
- Subhead: "with * Claude"
- Details: "feb 21st · 9am–9pm · AI TINKERERS"
- Sponsors list must include: "TAVUS", "COPILOTKIT", "ANTHROP\\C", "REDIS", "BETAWORKS"

REQUIRED COLORS (use only these hex values):
- #FFD700 (gold) — use for headline and key accents
- #F5F1E5 (cream) — use for body text
- #2A688C (teal) — use as accent
- #8B3A3A (deep red) — use as accent
- Background gradient: use very dark versions of these colors (add "0d", "0a", "12" prefix darkness)

REQUIRED STYLE:
- Large bold serif headline (sizeVw 9-16 depending on mood)
- Technical/abstract background with geometric shapes
- Modern, promotional, bold typography feel

Output this exact JSON structure (all positions are percentages 0-100 of canvas):
{
  "background": {
    "gradientAngle": <0-360>,
    "gradientStops": [{"color": "<hex>", "position": <0-100>}, ...],
    "shapes": [
      {"type": "circle"|"rectangle"|"line", "x": <0-100>, "y": <0-100>, "size": <1-60>, "color": "<palette-hex>", "opacity": <0.02-0.35>, "rotation": <optional -180 to 180>},
      ... 3-7 shapes total
    ]
  },
  "headline": {"lines": ["..."], "sizeVw": <5-18>, "color": "#FFD700"|"#F5F1E5", "xPct": <3-70>, "yPct": <10-85>, "align": "left"|"center"|"right"},
  "subhead": {"content": "with * Claude", "sizeVw": <1.5-5>, "color": "<palette-hex>", "xPct": <3-80>, "yPct": <20-92>},
  "details": {"content": "feb 21st · 9am–9pm · AI TINKERERS", "sizeVw": <1-3.5>, "color": "<palette-hex>", "xPct": <3-80>, "yPct": <30-94>},
  "sponsors": {"items": ["TAVUS","COPILOTKIT","ANTHROP\\\\C","REDIS","BETAWORKS"], "xPct": <3-20>, "yPct": <70-97>, "color": "#F5F1E5"|"#FFD700", "sizeVw": <1-2.5>, "layout": "row"|"grid"}
}

For mood "${mood}": ${getMoodInstructions(mood)}

Output ONLY the JSON object. Nothing else.`
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { mood = 'DRAMATIC' } = await req.json() as { mood?: string }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: buildPrompt(mood) }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const parsed = JSON.parse(cleaned)
    const validated = BannerSpecSchema.parse(parsed)

    return NextResponse.json(validated)
  } catch (err) {
    console.error('Banner API error — using fallback:', err)
    return NextResponse.json(DEFAULT_BANNER)
  }
}
