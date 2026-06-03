import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Database, Sparkles, LineChart } from 'lucide-react'

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export default function Hero({ overview }) {
  return (
    <section id="top" className="relative pt-36 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 chip"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              <span>Premium Data Analyst Portfolio</span>
              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]"
            >
              Zomato{' '}
              <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-accent-500 bg-clip-text text-transparent">
                Restaurant
              </span>{' '}
              <br className="hidden sm:block" />
              Analytics
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-lg max-w-2xl opacity-80"
            >
              Data Cleaning, SQL Reporting, Business Intelligence &amp; Visualization — a
              full-stack analytics case study turning <strong>{fmtNum(overview.totalRestaurants)}</strong>{' '}
              restaurants into actionable insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a href="#dashboard" className="btn-primary">
                View Dashboard <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#python" className="btn-ghost">
                <LineChart className="h-4 w-4" /> Explore Analysis
              </a>
              <a
                href={`${import.meta.env.BASE_URL}data/analytics.json`}
                download
                className="btn-ghost"
              >
                <Database className="h-4 w-4" /> Download Report
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-2"
            >
              {['Pandas', 'NumPy', 'SQL', 'Plotly', 'Recharts', 'FastAPI', 'Tailwind', 'Framer Motion'].map(
                (t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ),
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <HeroPanel overview={overview} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function HeroPanel({ overview }) {
  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="chip">
            <BarChart3 className="h-3 w-3" /> Live Preview
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniKpi label="Restaurants" value={fmtNum(overview.totalRestaurants)} />
          <MiniKpi label="Avg Rating" value={overview.avgRating} suffix="/5" />
          <MiniKpi label="Total Votes" value={fmtNum(overview.totalVotes)} />
          <MiniKpi label="Avg Cost" value={overview.avgCost} prefix="₹" />
        </div>

        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <div className="text-xs uppercase tracking-widest opacity-60 mb-2">
            Engagement Profile
          </div>
          <div className="space-y-3">
            <Bar label="Online Order" value={overview.onlineOrderPct} color="from-brand-400 to-brand-600" />
            <Bar label="Table Booking" value={overview.tableBookingPct} color="from-accent-400 to-accent-600" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-xs opacity-70">
          <span className="chip !text-emerald-300 !border-emerald-400/30 !bg-emerald-400/10">
            ● Updated in real-time
          </span>
          <span>Powered by Recharts + FastAPI</span>
        </div>
      </div>
    </div>
  )
}

function MiniKpi({ label, value, suffix = '', prefix = '' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight">
        {prefix}
        {value}
        {suffix}
      </div>
    </div>
  )
}

function Bar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="opacity-80">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}
