import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Star, ThumbsUp, Wallet, Filter, Download, Sparkles, RefreshCcw,
} from 'lucide-react'
import { SectionHead } from './Overview'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  ScatterChart, Scatter, ZAxis, PieChart, Pie, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const COLORS = ['#ff624a', '#7c5cff', '#22d3ee', '#34d399', '#f59e0b', '#ec4899', '#a78bfa', '#facc15', '#10b981', '#f97316']

export default function Dashboard({ data }) {
  const [filters, setFilters] = useState({
    restType: 'All',
    online: 'All',
    booking: 'All',
    ratingMin: 0,
    ratingMax: 5,
  })
  // Track active drill-downs from chart clicks
  const [drill, setDrill] = useState({ source: null, value: null })

  const handleDrill = (source, value) => {
    if (drill.source === source && drill.value === value) {
      setDrill({ source: null, value: null })
      setFilters((f) => ({ ...f, [source]: 'All' }))
      return
    }
    setDrill({ source, value })
    setFilters((f) => ({ ...f, [source]: value }))
  }

  const clearDrill = () => {
    setFilters((f) => ({ ...f, restType: 'All', online: 'All', booking: 'All', ratingMin: 0, ratingMax: 5 }))
    setDrill({ source: null, value: null })
  }

  const resetAll = () => {
    setFilters({ restType: 'All', online: 'All', booking: 'All', ratingMin: 0, ratingMax: 5 })
    setDrill({ source: null, value: null })
  }

  const filtered = useMemo(() => {
    return data.cleanSample.filter((r) => {
      if (filters.restType !== 'All' && !(r.rest_type || '').includes(filters.restType)) return false
      if (filters.online !== 'All' && r.online_order !== filters.online) return false
      if (filters.booking !== 'All' && r.book_table !== filters.booking) return false
      if (r.rating < filters.ratingMin || r.rating > filters.ratingMax) return false
      return true
    })
  }, [filters, data.cleanSample])

  const kpis = useMemo(() => {
    const total = filtered.length
    const avg = total ? +(filtered.reduce((a, b) => a + (b.rating || 0), 0) / total).toFixed(2) : 0
    const votes = filtered.reduce((a, b) => a + (b.votes || 0), 0)
    const cost = total ? Math.round(filtered.reduce((a, b) => a + (b.cost || 0), 0) / total) : 0
    return [
      { label: 'Filtered Restaurants', value: total, icon: Building2, tone: 'from-brand-400 to-brand-600' },
      { label: 'Average Rating', value: avg, suffix: '/5', icon: Star, tone: 'from-amber-400 to-orange-500' },
      { label: 'Total Votes', value: fmt(votes), icon: ThumbsUp, tone: 'from-emerald-400 to-emerald-600' },
      { label: 'Average Cost', value: cost, prefix: '₹', icon: Wallet, tone: 'from-cyan-400 to-blue-500' },
    ]
  }, [filtered])

  const ratingDist = useMemo(() => {
    const buckets = ['<1.5', '1.5-2.0', '2.0-2.5', '2.5-3.0', '3.0-3.5', '3.5-4.0', '4.0-4.5', '4.5+']
    const bins = [0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.01]
    const counts = new Array(buckets.length).fill(0)
    for (const r of filtered) {
      for (let i = 0; i < bins.length - 1; i++) {
        if (r.rating >= bins[i] && r.rating < bins[i + 1]) {
          counts[i]++
          break
        }
      }
    }
    return buckets.map((b, i) => ({ bucket: b, count: counts[i] }))
  }, [filtered])

  const restTypeDist = useMemo(() => {
    const map = new Map()
    for (const r of filtered) {
      const types = (r.rest_type || 'Unknown').split(', ').map((s) => s.trim())
      for (const t of types) {
        if (!t) continue
        map.set(t, (map.get(t) || 0) + 1)
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }))
  }, [filtered])

  const onlineVsRating = useMemo(() => {
    const map = { Yes: [], No: [] }
    for (const r of filtered) {
      if (map[r.online_order]) map[r.online_order].push(r.rating)
    }
    return Object.entries(map).map(([k, v]) => ({
      category: k,
      avgRating: v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : 0,
      count: v.length,
    }))
  }, [filtered])

  const bookingVsRating = useMemo(() => {
    const map = { Yes: [], No: [] }
    for (const r of filtered) {
      if (map[r.book_table]) map[r.book_table].push(r.rating)
    }
    return Object.entries(map).map(([k, v]) => ({
      category: k,
      avgRating: v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : 0,
      count: v.length,
    }))
  }, [filtered])

  const costVsRating = useMemo(() => {
    return filtered
      .filter((r) => r.rating > 0 && r.cost > 0)
      .slice(0, 400)
      .map((r) => ({ rating: +r.rating.toFixed(2), cost: r.cost }))
  }, [filtered])

  const topByVotes = useMemo(() => {
    return [...filtered]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 10)
      .map((r) => ({
        name: (r.name || '').slice(0, 18),
        fullName: r.name || '',
        votes: r.votes,
        rating: r.rating,
        restType: ((r.rest_type || '').split(', ')[0] || '').trim(),
      }))
  }, [filtered])

  const topRated = useMemo(() => {
    return [...filtered]
      .filter((r) => r.rating > 0)
      .sort((a, b) => b.rating - a.rating || (b.votes || 0) - (a.votes || 0))
      .slice(0, 10)
      .map((r) => ({
        name: (r.name || '').slice(0, 18),
        rating: r.rating,
        votes: r.votes,
      }))
  }, [filtered])

  const avgCostByType = useMemo(() => {
    const map = new Map()
    for (const r of filtered) {
      const types = (r.rest_type || 'Unknown').split(', ').map((s) => s.trim())
      for (const t of types) {
        if (!t) continue
        const cur = map.get(t) || { total: 0, n: 0 }
        cur.total += r.cost || 0
        cur.n++
        map.set(t, cur)
      }
    }
    return Array.from(map.entries())
      .map(([type, v]) => ({ type, avgCost: Math.round(v.total / v.n), count: v.n }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filtered])

  const cuisineDist = useMemo(() => {
    const map = new Map()
    for (const r of filtered) {
      const cuisines = (r.cuisines || 'Unknown').split(', ').map((s) => s.trim())
      for (const c of cuisines) {
        if (!c || c === 'Unknown') continue
        map.set(c, (map.get(c) || 0) + 1)
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cuisine, count]) => ({ cuisine, count }))
  }, [filtered])

  const cityDist = useMemo(() => {
    const map = new Map()
    for (const r of filtered) {
      const city = (r.city || 'Unknown').trim()
      if (!city) continue
      map.set(city, (map.get(city) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }))
  }, [filtered])

  const priceRangeRating = useMemo(() => {
    const bins = [0, 300, 600, 1000, 1500, 3000, 1e6]
    const labels = ['<300', '300-600', '600-1K', '1K-1.5K', '1.5K-3K', '3K+']
    const data = labels.map((l) => ({ range: l, avgRating: 0, count: 0 }))
    for (const r of filtered) {
      for (let i = 0; i < bins.length - 1; i++) {
        if (r.cost >= bins[i] && r.cost < bins[i + 1]) {
          data[i].count++
          data[i].avgRating += r.rating
          break
        }
      }
    }
    for (const d of data) {
      d.avgRating = d.count ? +(d.avgRating / d.count).toFixed(2) : 0
    }
    return data
  }, [filtered])

  const votesDist = useMemo(() => {
    const buckets = ['0-100', '100-500', '500-1K', '1K-5K', '5K+']
    const bins = [0, 100, 500, 1000, 5000, 1e9]
    const data = buckets.map((b) => ({ bucket: b, count: 0 }))
    for (const r of filtered) {
      for (let i = 0; i < bins.length - 1; i++) {
        if ((r.votes || 0) >= bins[i] && (r.votes || 0) < bins[i + 1]) {
          data[i].count++
          break
        }
      }
    }
    return data
  }, [filtered])

  const engagementScore = useMemo(() => {
    return filtered
      .filter((r) => r.rating > 0 && r.votes > 0)
      .slice(0, 500)
      .map((r) => ({ name: (r.name || '').slice(0, 14), rating: r.rating, votes: r.votes }))
  }, [filtered])

  const cuisineVsRating = useMemo(() => {
    const map = new Map()
    for (const r of filtered) {
      const cuisines = (r.cuisines || 'Unknown').split(', ').map((s) => s.trim())
      for (const c of cuisines) {
        if (!c || c === 'Unknown') continue
        const cur = map.get(c) || { totalRating: 0, n: 0 }
        cur.totalRating += r.rating
        cur.n++
        map.set(c, cur)
      }
    }
    return Array.from(map.entries())
      .map(([cuisine, v]) => ({ cuisine, avgRating: +(v.totalRating / v.n).toFixed(2), count: v.n }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filtered])

  const exportCSV = () => {
    const cols = ['name', 'location', 'rest_type', 'cuisines', 'rating', 'votes', 'cost', 'online_order', 'book_table', 'city']
    const header = cols.join(',')
    const rows = filtered.map((r) =>
      cols
        .map((c) => {
          const v = r[c] ?? ''
          const s = String(v).replace(/"/g, '""')
          return /[",\n]/.test(s) ? `"${s}"` : s
        })
        .join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zomato_filtered_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section id="dashboard" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="05 · Interactive Dashboard"
          title="BI-grade Filters, KPIs & Charts"
          subtitle="Every filter, KPI and chart updates in real time against the cleaned sample dataset."
        />

        <div className="mt-10 card p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-accent-400 shrink-0" />
                <span className="text-xs uppercase tracking-widest opacity-70">Filters</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Select
                  label="Type"
                  value={filters.restType}
                  onChange={(v) => setFilters((f) => ({ ...f, restType: v }))}
                  options={['All', ...data.filterOptions.restTypes]}
                />
                <Select
                  label="Online"
                  value={filters.online}
                  onChange={(v) => setFilters((f) => ({ ...f, online: v }))}
                  options={['All', ...data.filterOptions.onlineOptions]}
                />
                <Select
                  label="Booking"
                  value={filters.booking}
                  onChange={(v) => setFilters((f) => ({ ...f, booking: v }))}
                  options={['All', ...data.filterOptions.bookingOptions]}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <RangeInput
                  label="Rating"
                  value={filters.ratingMin}
                  min={0}
                  max={filters.ratingMax}
                  step={0.1}
                  onChange={(v) => setFilters((f) => ({ ...f, ratingMin: v }))}
                  label2={filters.ratingMax.toFixed(1)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button onClick={exportCSV} className="btn-ghost !py-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <button onClick={resetAll} className="btn-ghost !py-2 text-xs">
                  <RefreshCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          {drill.source && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <span className="text-[11px] uppercase tracking-widest opacity-60">Drill:</span>
              <button
                onClick={clearDrill}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-accent-500/40 bg-accent-500/10 text-xs font-medium text-accent-400 hover:bg-accent-500/20 transition"
              >
                {drill.source === 'restType' ? 'Type: ' : drill.source === 'online' ? 'Online: ' : drill.source === 'booking' ? 'Booking: ' : drill.source}
                {drill.value}
                <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button onClick={resetAll} className="text-[11px] underline opacity-50 hover:opacity-100 transition">
                Clear all
              </button>
            </motion.div>
          )}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-60">{k.label}</div>
                  <div className="mt-2 text-3xl font-extrabold tracking-tight">
                    {k.prefix || ''}
                    {k.value}
                    {k.suffix || ''}
                  </div>
                </div>
                <div
                  className={`h-10 w-10 rounded-xl bg-gradient-to-br ${k.tone} flex items-center justify-center shadow-glow`}
                >
                  <k.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid lg:grid-cols-12 gap-4">
          <Card title="Rating Distribution" subtitle="Bucketed across 8 rating bands" className="lg:col-span-8">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={ratingDist} margin={{ left: -10, right: 10, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#7c5cff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => v.toLocaleString()} />} />
                <Area type="monotone" dataKey="count" stroke="#7c5cff" fill="url(#gradRating)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Restaurant Type" subtitle="Top 10 by frequency" className="lg:col-span-4">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={restTypeDist}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  style={{ cursor: 'pointer' }}
                >
                  {restTypeDist.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      onClick={() => handleDrill('restType', entry.type)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip label="Restaurant Type" />} />
              </PieChart>
            </ResponsiveContainer>
            <LegendList
              items={restTypeDist}
              activeLabel={drill.source === 'restType' ? drill.value : null}
              onItemClick={(type) => handleDrill('restType', type)}
            />
          </Card>

          <Card title="Online Order vs Rating" subtitle="Mean rating by online order">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={onlineVsRating}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip label="Online Order" formatter={(v) => `${v.toFixed(2)} / 5`} />} />
                <Bar dataKey="avgRating" radius={[8, 8, 0, 0]} style={{ cursor: 'pointer' }}>
                  {onlineVsRating.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#7c5cff' : '#ff624a'}
                      onClick={() => handleDrill('online', entry.category)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Table Booking vs Rating" subtitle="Mean rating by booking availability">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bookingVsRating}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip label="Table Booking" formatter={(v) => `${v.toFixed(2)} / 5`} />} />
                <Bar dataKey="avgRating" radius={[8, 8, 0, 0]} style={{ cursor: 'pointer' }}>
                  {bookingVsRating.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#22d3ee' : '#f59e0b'}
                      onClick={() => handleDrill('booking', entry.category)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Cost vs Rating" subtitle="Sample scatter (₹ cost for two)">
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  dataKey="cost"
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
                  name="Cost"
                />
                <YAxis
                  type="number"
                  dataKey="rating"
                  domain={[2, 5]}
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
                  name="Rating"
                />
                <ZAxis range={[30, 30]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={<ChartTooltip label="Restaurant" formatter={(v, entry) => entry?.dataKey === 'cost' ? `₹${v}` : `${v} / 5`} />}
                />
                <Scatter data={costVsRating} fill="#ec4899" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top 10 by Votes" subtitle="Most engaged customers" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topByVotes} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.85, fontWeight: 600 }}
                />
                <Tooltip
                  content={<ChartTooltip label="Top Restaurant" formatter={(v, entry) => entry?.dataKey === 'votes' ? v.toLocaleString() : v} />}
                />
                <Bar dataKey="votes" radius={[0, 6, 6, 0]} style={{ cursor: 'pointer' }}>
                  {topByVotes.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      onClick={() => handleDrill('restType', entry.restType)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top Rated Restaurants" subtitle="Highest mean rating" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={topRated}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.6 }}
                  angle={-20}
                  height={50}
                  textAnchor="end"
                />
                <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v.toFixed(2)} / 5`} />} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Average Cost by Type" subtitle="Mean cost for two (₹)" className="lg:col-span-12">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={avgCostByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
                  angle={-15}
                  height={50}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `₹${v.toLocaleString()}`} />} />
                <Bar dataKey="avgCost" radius={[8, 8, 0, 0]} style={{ cursor: 'pointer' }}>
                  {avgCostByType.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[(i + 3) % COLORS.length]}
                      onClick={() => handleDrill('restType', entry.type)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top Cuisines" subtitle="Most frequently offered cuisines" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cuisineDist} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <YAxis type="category" dataKey="cuisine" width={100} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.8, fontWeight: 600 }} />
                <Tooltip content={<ChartTooltip label="Cuisine" formatter={(v) => v.toLocaleString()} />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {cuisineDist.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Price Range vs Rating" subtitle="Average rating by cost bracket" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priceRangeRating}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip label="Price Range" formatter={(v, e) => e?.dataKey === 'avgRating' ? `${v} / 5` : v} />} />
                <Bar dataKey="avgRating" radius={[8, 8, 0, 0]}>
                  {priceRangeRating.map((_, i) => (
                    <Cell key={i} fill={i >= 4 ? '#22d3ee' : i >= 2 ? '#f59e0b' : '#ff624a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Engagement Score" subtitle="Rating vs Votes scatter" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" dataKey="votes" name="Votes" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }} />
                <YAxis type="number" dataKey="rating" name="Rating" domain={[2, 5]} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }} />
                <ZAxis range={[30, 30]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={<ChartTooltip label="Restaurant" formatter={(v, e) => e?.dataKey === 'votes' ? v.toLocaleString() : `${v} / 5`} />}
                />
                <Scatter data={engagementScore} fill="#a78bfa" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Votes Distribution" subtitle="How votes are spread across restaurants" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={votesDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip label="Votes" formatter={(v) => v.toLocaleString()} />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {votesDist.map((_, i) => <Cell key={i} fill={COLORS[(i + 5) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Cities Distribution" subtitle="Top cities by restaurant count" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cityDist} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.8, fontWeight: 600 }} />
                <Tooltip content={<ChartTooltip label="City" formatter={(v) => v.toLocaleString()} />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {cityDist.map((_, i) => <Cell key={i} fill={COLORS[(i + 7) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Cuisine Performance" subtitle="Most popular cuisines by avg rating" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cuisineVsRating}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="cuisine" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} angle={-15} height={50} textAnchor="end" />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.75, fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip label="Cuisine" formatter={(v, e) => e?.dataKey === 'avgRating' ? `${v} / 5` : v} />} />
                <Bar dataKey="avgRating" radius={[8, 8, 0, 0]}>
                  {cuisineVsRating.map((_, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </section>
  )
}

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0c1024] border border-white/15 rounded-xl px-4 py-3 shadow-soft max-w-[240px]">
      <p className="text-[11px] font-semibold tracking-wider uppercase opacity-50 mb-1.5">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2.5 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ background: entry.color || entry.stroke || '#7c5cff' }}
          />
          <span className="font-medium">{entry.name || entry.dataKey}:</span>
          <span className="font-bold ml-auto">
            {typeof formatter === 'function' ? formatter(entry.value, entry) : entry.value}
          </span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] opacity-40">
        Click to filter
      </div>
    </div>
  )
}

function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-xs opacity-60 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] uppercase tracking-widest opacity-60 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent-500"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-900 text-white">
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function RangeInput({ label, value, min, max, step, onChange, label2 }) {
  return (
    <div className="flex flex-col min-w-[180px]">
      <label className="text-[10px] uppercase tracking-widest opacity-60 mb-1 flex justify-between">
        <span>{label}</span>
        <span className="font-mono opacity-80">{value.toFixed(1)}{label2 ? ` - ${label2}` : ''}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="accent-accent-500 w-full"
      />
    </div>
  )
}

function LegendList({ items, activeLabel, onItemClick }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.slice(0, 6).map((it, i) => {
        const isActive = activeLabel && activeLabel === it.type
        return (
          <button
            key={it.type}
            onClick={() => onItemClick?.(it.type)}
            className={`chip transition-all ${
              isActive
                ? '!border-accent-500/60 !bg-accent-500/15 ring-1 ring-accent-500/30'
                : 'hover:opacity-80'
            }`}
            title={`Filter by ${it.type}`}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="max-w-[80px] truncate">{it.type}</span>
            <span className="opacity-60">· {it.count}</span>
          </button>
        )
      })}
      {onItemClick && (
        <span className="text-[10px] self-center opacity-40 italic pointer-events-none">
          Click to drill
        </span>
      )}
    </div>
  )
}
