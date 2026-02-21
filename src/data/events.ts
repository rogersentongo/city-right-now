export interface CityEvent {
  id: string
  location: string
  neighborhood: string
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island'
  type: 'music' | 'food' | 'protest' | 'sports' | 'street' | 'transit' | 'culture' | 'alert' | 'nightlife'
  title: string
  description: string
  uploads: number
  views: number
  isLive: boolean
  intensity: 'hot' | 'moderate' | 'normal' | 'silent'
  minutesAgo: number
  gradient: string
}

export interface StoryCluster {
  id: string
  label: string
  headline: string
  borough: string
  location: string
  intensity: 'hot' | 'moderate' | 'normal' | 'silent'
  stats: string
  subtext: string
  events: CityEvent[]
}

export interface BoroughData {
  name: string
  percentage: number
  intensity: 'high' | 'moderate' | 'low'
  delta: string
}

export interface PulseItem {
  location: string
  views: string
  isLive: boolean
  intensity: 'hot' | 'moderate' | 'normal'
}

// ─── 20 Mock Events ──────────────────────────────────────────────────────────

export const MOCK_EVENTS: CityEvent[] = [
  // Brooklyn — hottest borough right now
  {
    id: 'bk-1',
    location: 'Prospect Park Bandshell',
    neighborhood: 'Park Slope',
    borough: 'Brooklyn',
    type: 'music',
    title: 'Unannounced DJ Set — Crowd Growing Fast',
    description: 'No flyer, no announcement. Someone just set up and started playing. Four people filmed it separately in the last 25 minutes. Crowd keeps growing.',
    uploads: 4,
    views: 1240,
    isLive: true,
    intensity: 'hot',
    minutesAgo: 25,
    gradient: 'from-purple-900 to-pink-900',
  },
  {
    id: 'bk-2',
    location: 'Barclays Center',
    neighborhood: 'Prospect Heights',
    borough: 'Brooklyn',
    type: 'sports',
    title: 'Post-Game Crowd Flooding Atlantic Ave',
    description: 'Nets game just ended. Thousands spilling out onto the street. Energy is high.',
    uploads: 7,
    views: 3400,
    isLive: false,
    intensity: 'hot',
    minutesAgo: 18,
    gradient: 'from-blue-900 to-gray-900',
  },
  {
    id: 'bk-3',
    location: 'Bushwick Ave',
    neighborhood: 'Bushwick',
    borough: 'Brooklyn',
    type: 'culture',
    title: 'Gallery Crawl Turning Into a Party',
    description: 'What started as a gallery opening has spilled onto the sidewalk. Music visible through windows.',
    uploads: 3,
    views: 890,
    isLive: false,
    intensity: 'moderate',
    minutesAgo: 40,
    gradient: 'from-orange-900 to-red-900',
  },
  {
    id: 'bk-4',
    location: 'DUMBO Waterfront',
    neighborhood: 'DUMBO',
    borough: 'Brooklyn',
    type: 'street',
    title: 'Photo Shoot Blocking the Bridge View',
    description: 'Large production crew taking over the classic Manhattan Bridge shot. Tourists annoyed.',
    uploads: 2,
    views: 456,
    isLive: false,
    intensity: 'normal',
    minutesAgo: 55,
    gradient: 'from-cyan-900 to-blue-900',
  },
  {
    id: 'bk-5',
    location: 'Bedford Ave',
    neighborhood: 'Williamsburg',
    borough: 'Brooklyn',
    type: 'food',
    title: 'New Ramen Spot Has a 2-Hour Line',
    description: 'Grand opening today. Line wraps around the block. Nobody expected this.',
    uploads: 2,
    views: 678,
    isLive: false,
    intensity: 'moderate',
    minutesAgo: 72,
    gradient: 'from-yellow-900 to-orange-900',
  },
  {
    id: 'bk-6',
    location: 'Bay Ridge',
    neighborhood: 'Bay Ridge',
    borough: 'Brooklyn',
    type: 'street',
    title: 'Quiet Tonight',
    description: 'Unusually still for a Friday. One upload. Local diner.',
    uploads: 1,
    views: 89,
    isLive: false,
    intensity: 'normal',
    minutesAgo: 90,
    gradient: 'from-gray-900 to-gray-800',
  },

  // Manhattan — the anomaly borough
  {
    id: 'mn-1',
    location: 'Times Square',
    neighborhood: 'Midtown',
    borough: 'Manhattan',
    type: 'street',
    title: 'COVERAGE GAP — Nothing in 47 Minutes',
    description: 'Zero uploads from Times Square in 47 minutes. On a Friday night. This is statistically anomalous. Something either just ended or is about to start.',
    uploads: 0,
    views: 0,
    isLive: false,
    intensity: 'silent',
    minutesAgo: 47,
    gradient: 'from-gray-900 to-black',
  },
  {
    id: 'mn-2',
    location: 'SoHo',
    neighborhood: 'SoHo',
    borough: 'Manhattan',
    type: 'culture',
    title: 'Celebrity Spotted at Mercer Kitchen',
    description: 'Unconfirmed but three uploads all pointing at the same table inside. Paparazzi circling outside.',
    uploads: 3,
    views: 2100,
    isLive: false,
    intensity: 'hot',
    minutesAgo: 32,
    gradient: 'from-pink-900 to-rose-900',
  },
  {
    id: 'mn-3',
    location: 'East Village',
    neighborhood: 'East Village',
    borough: 'Manhattan',
    type: 'nightlife',
    title: 'Bar Crawl Group of ~200 Moving North on Ave A',
    description: 'Massive bar crawl. Loud. Moving in a pack. Already hit 4 bars.',
    uploads: 5,
    views: 1560,
    isLive: true,
    intensity: 'hot',
    minutesAgo: 12,
    gradient: 'from-red-900 to-orange-900',
  },
  {
    id: 'mn-4',
    location: 'Central Park, South Entrance',
    neighborhood: 'Midtown South',
    borough: 'Manhattan',
    type: 'street',
    title: 'Impromptu Violin Performance Drawing Crowd',
    description: 'One upload, 400 views in 10 minutes. Musician set up without permit.',
    uploads: 1,
    views: 412,
    isLive: false,
    intensity: 'normal',
    minutesAgo: 22,
    gradient: 'from-green-900 to-emerald-900',
  },

  // Queens — night market story
  {
    id: 'qn-1',
    location: 'Flushing Main Street',
    neighborhood: 'Flushing',
    borough: 'Queens',
    type: 'food',
    title: 'Night Market Running Late — Still Packed at Midnight',
    description: 'Should have closed at 10. Three vendors packing up but the crowd isn\'t leaving. Six uploads in the last hour.',
    uploads: 6,
    views: 2890,
    isLive: true,
    intensity: 'hot',
    minutesAgo: 8,
    gradient: 'from-amber-900 to-yellow-900',
  },
  {
    id: 'qn-2',
    location: 'Astoria Park',
    neighborhood: 'Astoria',
    borough: 'Queens',
    type: 'music',
    title: 'Live Band in the Park — Permit Expired an Hour Ago',
    description: 'They\'re still playing. NYPD drove by once and kept going.',
    uploads: 2,
    views: 567,
    isLive: true,
    intensity: 'moderate',
    minutesAgo: 35,
    gradient: 'from-violet-900 to-purple-900',
  },
  {
    id: 'qn-3',
    location: 'Long Island City',
    neighborhood: 'LIC',
    borough: 'Queens',
    type: 'culture',
    title: 'Pop-Up Art Show in an Abandoned Warehouse',
    description: 'Word-of-mouth only. No social media announcement. Three uploads from inside.',
    uploads: 3,
    views: 780,
    isLive: false,
    intensity: 'moderate',
    minutesAgo: 60,
    gradient: 'from-indigo-900 to-blue-900',
  },
  {
    id: 'qn-4',
    location: 'Jackson Heights',
    neighborhood: 'Jackson Heights',
    borough: 'Queens',
    type: 'food',
    title: 'Sidewalk Food Festival — Totally Unannounced',
    description: 'Ten carts, no permits visible, extremely busy. One upload.',
    uploads: 1,
    views: 234,
    isLive: false,
    intensity: 'normal',
    minutesAgo: 85,
    gradient: 'from-teal-900 to-cyan-900',
  },

  // Bronx — the hidden story
  {
    id: 'bx-1',
    location: 'Burnside Ave',
    neighborhood: 'Tremont',
    borough: 'Bronx',
    type: 'music',
    title: 'Block Party — 3 Hours In, Still Going',
    description: 'No coverage outside the neighborhood. Started at 9pm. Full block shut down. DJ, food, at least 300 people. Zero mainstream uploads. This is the most undercovered event in the city right now.',
    uploads: 2,
    views: 340,
    isLive: true,
    intensity: 'moderate',
    minutesAgo: 15,
    gradient: 'from-lime-900 to-green-900',
  },
  {
    id: 'bx-2',
    location: 'Yankee Stadium Area',
    neighborhood: 'Concourse',
    borough: 'Bronx',
    type: 'sports',
    title: 'Post-Game Streets — Quieter Than Expected',
    description: 'Game ended 2 hours ago. Area has cleared out faster than usual. Loss.',
    uploads: 1,
    views: 178,
    isLive: false,
    intensity: 'normal',
    minutesAgo: 120,
    gradient: 'from-blue-900 to-navy-900',
  },
  {
    id: 'bx-3',
    location: 'Fordham Road',
    neighborhood: 'Fordham',
    borough: 'Bronx',
    type: 'food',
    title: 'New Dominican Restaurant Grand Opening',
    description: 'Local neighborhood buzz. Lines out the door earlier, calming now.',
    uploads: 1,
    views: 156,
    isLive: false,
    intensity: 'normal',
    minutesAgo: 95,
    gradient: 'from-orange-900 to-amber-900',
  },
  {
    id: 'bx-4',
    location: 'Mott Haven',
    neighborhood: 'South Bronx',
    borough: 'Bronx',
    type: 'culture',
    title: 'Rooftop Art Show — Invite Only',
    description: 'Two uploads from the roof. Looks spectacular. No public info.',
    uploads: 2,
    views: 420,
    isLive: false,
    intensity: 'moderate',
    minutesAgo: 50,
    gradient: 'from-fuchsia-900 to-purple-900',
  },

  // Staten Island — very quiet
  {
    id: 'si-1',
    location: 'St. George Ferry Terminal',
    neighborhood: 'St. George',
    borough: 'Staten Island',
    type: 'transit',
    title: 'Late Night Ferry Crowd',
    description: 'Standard Friday late ferry. Nothing unusual.',
    uploads: 1,
    views: 98,
    isLive: false,
    intensity: 'normal',
    minutesAgo: 30,
    gradient: 'from-slate-900 to-gray-900',
  },
  {
    id: 'si-2',
    location: 'Staten Island',
    neighborhood: 'Various',
    borough: 'Staten Island',
    type: 'street',
    title: 'Quiet Across the Borough',
    description: 'No significant activity detected. Normal Friday night.',
    uploads: 0,
    views: 0,
    isLive: false,
    intensity: 'silent',
    minutesAgo: 60,
    gradient: 'from-gray-900 to-gray-800',
  },
]

// ─── Derived Story Clusters ───────────────────────────────────────────────────

export const STORY_CLUSTERS: StoryCluster[] = [
  {
    id: 'cluster-brooklyn-hot',
    label: 'BROOKLYN',
    headline: 'Getting Loud',
    borough: 'Brooklyn',
    location: 'Prospect Park + Barclays',
    intensity: 'hot',
    stats: '11 uploads · last 25 min',
    subtext: 'Unannounced DJ set + post-game crowd',
    events: MOCK_EVENTS.filter(e => e.borough === 'Brooklyn' && e.intensity !== 'normal'),
  },
  {
    id: 'cluster-midtown-dark',
    label: 'MIDTOWN',
    headline: 'Gone Dark',
    borough: 'Manhattan',
    location: 'Times Square',
    intensity: 'silent',
    stats: '0 uploads · 47 min gap',
    subtext: 'Anomalous silence on a Friday night',
    events: MOCK_EVENTS.filter(e => e.id === 'mn-1'),
  },
  {
    id: 'cluster-bronx-hidden',
    label: 'THE BRONX',
    headline: 'Hidden Story',
    borough: 'Bronx',
    location: 'Burnside Ave, Tremont',
    intensity: 'moderate',
    stats: '2 uploads · 3hrs running',
    subtext: 'Block party with zero outside coverage',
    events: MOCK_EVENTS.filter(e => e.id === 'bx-1'),
  },
  {
    id: 'cluster-queens-market',
    label: 'QUEENS',
    headline: 'Still Popping',
    borough: 'Queens',
    location: 'Flushing Main St',
    intensity: 'hot',
    stats: '6 uploads · running past close',
    subtext: 'Night market that refused to end',
    events: MOCK_EVENTS.filter(e => e.borough === 'Queens' && e.intensity === 'hot'),
  },
  {
    id: 'cluster-east-village',
    label: 'EAST VILLAGE',
    headline: 'Moving North',
    borough: 'Manhattan',
    location: 'Avenue A',
    intensity: 'hot',
    stats: '5 uploads · live now',
    subtext: '200-person bar crawl moving in a pack',
    events: MOCK_EVENTS.filter(e => e.id === 'mn-3'),
  },
]

// ─── Borough Activity Data ────────────────────────────────────────────────────

export const BOROUGH_DATA: BoroughData[] = [
  { name: 'Manhattan', percentage: 72, intensity: 'high', delta: '+8%' },
  { name: 'Brooklyn', percentage: 88, intensity: 'high', delta: '+31%' },
  { name: 'Queens', percentage: 61, intensity: 'moderate', delta: '+12%' },
  { name: 'Bronx', percentage: 34, intensity: 'moderate', delta: '+5%' },
  { name: 'Staten Island', percentage: 9, intensity: 'low', delta: '-2%' },
]

// ─── NYC Pulse Ticker Items ───────────────────────────────────────────────────

export const PULSE_ITEMS: PulseItem[] = [
  { location: 'Prospect Park', views: 'Live · 1.2K', isLive: true, intensity: 'hot' },
  { location: 'Barclays Center', views: 'Live · 3.4K', isLive: true, intensity: 'hot' },
  { location: 'East Village', views: 'Live · 1.5K', isLive: true, intensity: 'hot' },
  { location: 'Flushing', views: 'Live · 2.8K', isLive: true, intensity: 'hot' },
  { location: 'SoHo', views: '2.1K views', isLive: false, intensity: 'moderate' },
  { location: 'Williamsburg', views: '678 views', isLive: false, intensity: 'moderate' },
  { location: 'Burnside Ave', views: '340 views', isLive: true, intensity: 'moderate' },
  { location: 'Times Square', views: 'No uploads · 47m', isLive: false, intensity: 'normal' },
  { location: 'Astoria', views: 'Live · 567', isLive: true, intensity: 'moderate' },
  { location: 'DUMBO', views: '456 views', isLive: false, intensity: 'normal' },
]
