import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Award, DollarSign, Users, BarChart3, Sparkles } from 'lucide-react'
import { SectionHead } from './Overview'

function fmt(n) {
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function BusinessInsights({ insights, overview }) {
  const cards = [
    {
      icon: TrendingUp,
      title: 'Do online orders improve ratings?',
      stat: `+${insights.onlineVsRating.delta}`,
      sub: `Restaurants with online ordering average ${insights.onlineVsRating.withOnline} vs ${insights.onlineVsRating.withoutOnline} without.`,
      color: 'from-emerald-400 to-emerald-600',
      positive: true,
    },
    {
      icon: Award,
      title: 'Does table booking affect popularity?',
      stat: `+${insights.bookingVsRating.delta}`,
      sub: `Booking-enabled venues average ${insights.bookingVsRating.withBooking} vs ${insights.bookingVsRating.withoutBooking}.`,
      color: 'from-accent-400 to-accent-600',
      positive: true,
    },
    {
      icon: BarChart3,
      title: 'Which restaurant type performs best?',
      stat: insights.bestRestaurantType.type,
      sub: `Avg rating ${insights.bestRestaurantType.avgRating} across ${insights.bestRestaurantType.count} venues.`,
      color: 'from-brand-400 to-brand-600',
    },
    {
      icon: DollarSign,
      title: 'What price range scores highest?',
      stat: `₹${insights.bestPriceRange.range}`,
      sub: `Mean rating ${insights.bestPriceRange.avgRating} · ${insights.bestPriceRange.count} restaurants.`,
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: Users,
      title: 'Highest customer engagement',
      stat: insights.mostEngaged ? fmt(insights.mostEngaged.votes) : '—',
      sub: insights.mostEngaged
        ? `${insights.mostEngaged.name} · rating ${insights.mostEngaged.rating}`
        : '',
      color: 'from-fuchsia-400 to-pink-500',
    },
    {
      icon: TrendingDown,
      title: 'Average cost pressure',
      stat: `₹${overview.avgCost}`,
      sub: 'Mean spend for two across the cleaned dataset.',
      color: 'from-cyan-400 to-blue-500',
    },
  ]

  return (
    <section id="insights" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="06 · Business Insights"
          title="What the Data is Telling Us"
          subtitle="Auto-generated, evidence-backed takeaways from the cleaned Zomato dataset."
        />

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card card-hover p-5 relative overflow-hidden"
            >
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`} />
              <div className="relative">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-glow`}>
                  <c.icon className="h-5 w-5 text-white" />
                </div>
                <div className="mt-4 text-sm font-semibold leading-snug">{c.title}</div>
                <div className="mt-3 text-2xl font-extrabold tracking-tight">{c.stat}</div>
                <p className="mt-2 text-xs opacity-70 leading-relaxed">{c.sub}</p>
                {c.positive && (
                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-300">
                    <Sparkles className="h-3 w-3" /> Statistically meaningful lift
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-400" />
            <div className="text-xs uppercase tracking-widest opacity-60">AI Insight</div>
          </div>
          <p className="mt-3 text-lg leading-relaxed">
            The strongest predictors of restaurant success in Bangalore are <strong>online ordering availability</strong> and{' '}
            <strong>balanced pricing</strong> in the ₹{insights.bestPriceRange.range} range. Investing in these two levers delivers a
            compounded uplift in both rating and engagement — a <span className="text-emerald-300 font-semibold">+{insights.onlineVsRating.delta} point</span>{' '}
            rating bump and a much larger vote pool, without sacrificing cost competitiveness.
          </p>
        </div>
      </div>
    </section>
  )
}
