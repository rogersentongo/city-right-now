# City Right Now

> **AI Tinkerers Hackathon — Interfaces × Claude**
>
> Proactive ambient intelligence for New York City. The interface speaks first.

## The Idea

Every AI interface today is reactive — you ask, it answers. City Right Now inverts that.

A dashboard that watches the city for you and **briefs you without being asked**. Claude synthesizes live activity signals into an editorial city narrative — like a sharp city desk editor who never sleeps. You can drill into any story cluster, but you don't have to. The city tells you what's interesting.

**Three modes:**
- **Ambient** — Claude generates the briefing on load, auto-refreshes every 90s
- **Drill-down** — tap any story card, Claude goes deeper on that cluster
- **Memory** — "You were here 2 hours ago. Bushwick changed." (simulated, shows the concept)

## Setup

### 1. Install dependencies

```bash
cd city-right-now
npm install
```

### 2. Add your Anthropic API key

```bash
cp .env.local.example .env.local
# Edit .env.local and add your key
```

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run

```bash
npm run dev
# open http://localhost:3000
```

## How It Works

```
src/
├── app/
│   ├── page.tsx              # Main dashboard — state machine, all 3 modes
│   ├── layout.tsx
│   └── api/
│       ├── briefing/route.ts # Claude: generates city narrative (streaming)
│       └── drilldown/route.ts # Claude: deep-dives a specific cluster (streaming)
├── components/
│   ├── BriefingPanel.tsx     # The main text area — streams Claude output
│   ├── NYCPulse.tsx          # Horizontal ticker with auto-scroll
│   ├── BoroughActivity.tsx   # Borough bars with animated fill
│   └── StoryCard.tsx         # Tappable story cluster cards
└── data/
    └── events.ts             # 20 mock events + derived clusters
```

**The core trick:** Two streaming API routes, both backed by `claude-sonnet-4-6`. The briefing prompt tells Claude to write like a city editor — 3 paragraphs, specific, present tense, no bullets. The drilldown prompt goes deeper on one cluster.

## Stack

- **Next.js 15** + React 19 + TypeScript
- **Anthropic SDK** — `claude-sonnet-4-6` with streaming
- **Tailwind CSS v3**
- **Framer Motion** — card animations, briefing fade
- **Lucide React** — icons

No database. No auth. No backend required beyond the API key.

## Demo Notes

The mock events are curated to produce a good narrative every time:
- Brooklyn is hot (Prospect Park DJ set + post-Nets game crowd)
- Times Square has a 47-minute gap (anomaly)
- Bronx block party is the "hidden story" (2 uploads but running 3 hours)
- Flushing night market is still running past close

Refresh to get a new narrative from the same data — Claude will vary the angle each time.
