import { motion } from 'framer-motion'
import { Lightbulb, Wrench, Trophy, ArrowRight } from 'lucide-react'
import { SectionHead } from './Overview'

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const STEPS = [
  {
    icon: Lightbulb,
    title: 'Problem',
    points: [
      'Restaurant owners lack visibility into the drivers of customer satisfaction.',
      'Pricing, service options and cuisine are decisions made on gut feel.',
      'No unified view of how ratings, votes and cost interact.',
    ],
    color: 'from-brand-400 to-brand-600',
  },
  {
    icon: Wrench,
    title: 'Solution',
    points: [
      `Engineer a clean analytics-ready dataset of ${fmt(12400)}+ restaurants.`,
      'Model rating impact from online order, booking, cost and restaurant type.',
      'Ship a BI dashboard with interactive filters, KPIs and AI insights.',
    ],
    color: 'from-accent-400 to-accent-600',
  },
  {
    icon: Trophy,
    title: 'Outcome',
    points: [
      'Identified +0.5 rating lift from online ordering and table booking.',
      'Pinpointed ₹600–1,000 as the highest-rated price band.',
      'Delivered a reusable analytics platform for restaurant operators.',
    ],
    color: 'from-emerald-400 to-emerald-600',
  },
]

export default function ProjectStory({ overview }) {
  return (
    <section id="story" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="07 · Project Story"
          title="From Raw CSV to Strategic Insight"
          subtitle="The narrative arc of the Zomato Restaurant Analytics project — what we set out to learn, how we built it, and what we uncovered."
        />

        <div className="mt-12 relative">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500/50 via-accent-500/50 to-emerald-500/50" />
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card card-hover p-6 relative"
              >
                <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-gradient-to-br from-white to-ink-200 border-2 border-accent-500 items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-glow`}
                >
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <ul className="mt-4 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="text-sm opacity-85 leading-relaxed flex items-start gap-2">
                      <ArrowRight className="h-3.5 w-3.5 mt-1 text-accent-400 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest opacity-60">Final Word</div>
            <h3 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
              A portfolio piece that doubles as a usable analytics product.
            </h3>
            <p className="mt-3 opacity-80 max-w-2xl">
              Every chart, KPI and filter is wired to real data — the same dataset, the same cleaning pipeline,
              the same SQL queries you would run in production. Explore, filter, export and tell your own
              data story.
            </p>
          </div>
          <a href="#dashboard" className="btn-primary">
            Launch the Dashboard <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
