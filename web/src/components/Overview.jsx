import { motion } from 'framer-motion'
import { Star, Building2, ThumbsUp, Wallet, ShoppingBag, CalendarCheck } from 'lucide-react'

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const kpis = (overview) => [
  {
    label: 'Total Restaurants',
    value: fmt(overview.totalRestaurants),
    icon: Building2,
    color: 'from-brand-400 to-brand-600',
    sub: 'Cleaned & deduped',
  },
  {
    label: 'Average Rating',
    value: `${overview.avgRating}`,
    sub: 'out of 5.0',
    icon: Star,
    color: 'from-amber-400 to-orange-500',
  },
  {
    label: 'Total Votes',
    value: fmt(overview.totalVotes),
    sub: 'cumulative engagement',
    icon: ThumbsUp,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    label: 'Avg Cost (Two)',
    value: `₹${fmt(overview.avgCost)}`,
    sub: 'approx spend per couple',
    icon: Wallet,
    color: 'from-cyan-400 to-blue-500',
  },
  {
    label: 'Online Ordering',
    value: `${overview.onlineOrderPct}%`,
    sub: 'of all restaurants',
    icon: ShoppingBag,
    color: 'from-accent-400 to-accent-600',
  },
  {
    label: 'Table Booking',
    value: `${overview.tableBookingPct}%`,
    sub: 'accept reservations',
    icon: CalendarCheck,
    color: 'from-fuchsia-400 to-pink-500',
  },
]

export default function Overview({ overview }) {
  const items = kpis(overview)
  return (
    <section id="overview" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="01 · Dataset Overview"
          title="Snapshot of the Zomato Universe"
          subtitle="Six headline metrics describe the cleaned dataset — the foundation for every downstream query, chart and insight."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card card-hover p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-60">
                    {k.label}
                  </div>
                  <div className="mt-2 text-3xl font-extrabold tracking-tight">{k.value}</div>
                  <div className="mt-1 text-xs opacity-60">{k.sub}</div>
                </div>
                <div
                  className={`h-10 w-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center shadow-glow`}
                >
                  <k.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl">
      <div className="section-eyebrow">{eyebrow}</div>
      <h2 className="mt-2 section-title">{title}</h2>
      {subtitle && <p className="mt-3 opacity-75">{subtitle}</p>}
    </div>
  )
}
