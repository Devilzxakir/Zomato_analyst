import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, CheckCircle2, Star, ShoppingBag, CalendarCheck, Wallet, Trophy } from 'lucide-react'
import { SectionHead } from './Overview'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ScatterChart, Scatter, ZAxis, Cell, Legend,
} from 'recharts'

const ANALYSES = [
  {
    id: 'avg',
    title: 'Average Restaurant Rating',
    icon: Star,
    code: `avg_rating = df["rating"].mean()
print(f"Average rating: {avg_rating:.2f} / 5")`,
    result: 'Average rating across all cleaned restaurants',
    valueKey: 'avgRating',
  },
  {
    id: 'top',
    title: 'Top Rated Restaurants',
    icon: Trophy,
    code: `top = (df[df["votes"] > 200]
        .sort_values(["rating","votes"], ascending=[False, False])
        .head(10))`,
    result: 'Top 10 by rating (with at least 200 votes)',
    valueKey: 'topRated',
  },
  {
    id: 'online',
    title: 'Online Order Impact',
    icon: ShoppingBag,
    code: `impact = df.groupby("online_order")["rating"].agg(["mean","count"])
print(impact)`,
    result: 'How online ordering correlates with average rating',
    valueKey: 'onlineVsRating',
  },
  {
    id: 'booking',
    title: 'Booking vs Rating',
    icon: CalendarCheck,
    code: `booking = df.groupby("book_table")["rating"].agg(["mean","count"])
print(booking)`,
    result: 'How table booking correlates with average rating',
    valueKey: 'bookingVsRating',
  },
  {
    id: 'cost',
    title: 'Cost vs Rating Relationship',
    icon: Wallet,
    code: `corr = df["cost_for_two"].corr(df["rating"])
print(f"Pearson correlation: {corr:.3f}")`,
    result: 'Scatter of cost-for-two against rating (sample)',
    valueKey: 'costVsRating',
  },
]

export default function PythonAnalysis({ data }) {
  const [active, setActive] = useState(ANALYSES[0].id)
  const a = ANALYSES.find((x) => x.id === active)

  return (
    <section id="python" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="03 · Python Analysis"
          title="Exploratory Data Analysis with Pandas"
          subtitle="Five Jupyter-style analyses that surface the patterns hiding in 12,000+ restaurants."
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {ANALYSES.map((x) => {
            const Icon = x.icon
            return (
              <button
                key={x.id}
                onClick={() => setActive(x.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  active === x.id
                    ? 'border-accent-500/50 bg-accent-500/10 text-accent-400'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <Icon className="h-4 w-4" /> {x.title}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid lg:grid-cols-12 gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-7 card overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs opacity-70 font-mono">analysis_{a.id}.ipynb</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip !text-emerald-300 !border-emerald-400/30 !bg-emerald-400/10">
                    <CheckCircle2 className="h-3 w-3" /> In [7]
                  </span>
                  <button className="p-1.5 rounded-md hover:bg-white/5" title="Run">
                    <Play className="h-3.5 w-3.5 opacity-70" />
                  </button>
                </div>
              </div>
              <div className="p-5 bg-[#0c1024]">
                <pre className="font-mono text-[13px] leading-relaxed overflow-x-auto scrollbar-thin">
                  <code>{a.code}</code>
                </pre>
              </div>
              <div className="px-5 py-3 border-t border-white/10 bg-emerald-500/5 text-sm font-mono">
                <span className="text-emerald-400">Out:</span>{' '}
                <span className="opacity-90">{a.result}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="lg:col-span-5 card p-5 min-h-[360px]">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest opacity-60">Result Visualization</div>
              <span className="chip">Recharts</span>
            </div>
            <div className="mt-4 h-[320px]">
              <ResultChart a={a} data={data} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultChart({ a, data }) {
  if (a.id === 'avg') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="text-7xl font-extrabold bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
          {data.overview.avgRating}
        </div>
        <div className="mt-2 text-sm opacity-70">/ 5.0 average rating</div>
        <div className="mt-6 grid grid-cols-3 gap-3 w-full">
          <Stat label="Total" value={data.overview.totalRestaurants} />
          <Stat label="Votes" value={data.overview.totalVotes} />
          <Stat label="Avg ₹" value={data.overview.avgCost} />
        </div>
      </div>
    )
  }
  if (a.id === 'top') {
    const items = data.topRated.map((r) => ({ name: r.name.split(' ')[0], rating: r.rating }))
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} />
          <YAxis domain={[3, 5]} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} />
          <Tooltip
            contentStyle={{ background: '#0c1024', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="rating" radius={[6, 6, 0, 0]} fill="url(#topbar)" />
          <defs>
            <linearGradient id="topbar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffb84d" />
              <stop offset="100%" stopColor="#ff624a" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (a.id === 'online' || a.id === 'booking') {
    const arr = a.id === 'online' ? data.onlineVsRating : data.bookingVsRating
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={arr} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="category" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }} />
          <YAxis domain={[3, 5]} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} />
          <Tooltip
            contentStyle={{ background: '#0c1024', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="avgRating" radius={[8, 8, 0, 0]}>
            {arr.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#7c5cff' : '#ff624a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (a.id === 'cost') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            dataKey="cost"
            name="Cost"
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
            label={{ value: 'Cost ₹', position: 'insideBottom', offset: -5, fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
          />
          <YAxis
            type="number"
            dataKey="rating"
            name="Rating"
            domain={[2, 5]}
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
          />
          <ZAxis range={[40, 40]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: '#0c1024', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          />
          <Scatter data={data.costVsRating} fill="#7c5cff" />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }
  return null
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left">
      <div className="text-[10px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="text-sm font-bold">{value.toLocaleString()}</div>
    </div>
  )
}
