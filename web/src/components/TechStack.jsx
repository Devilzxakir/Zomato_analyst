import { motion } from 'framer-motion'
import {
  Code2, Database, LineChart, Layout, BarChart3,
} from 'lucide-react'
import { SectionHead } from './Overview'

const GROUPS = [
  {
    title: 'Frontend',
    icon: Layout,
    color: 'from-brand-400 to-brand-600',
    items: [
      { name: 'React.js', desc: 'Component architecture' },
      { name: 'Tailwind CSS', desc: 'Design system & theming' },
      { name: 'Framer Motion', desc: 'Micro-animations' },
    ],
  },
  {
    title: 'Analytics',
    icon: LineChart,
    color: 'from-emerald-400 to-emerald-600',
    items: [
      { name: 'Python', desc: 'Pandas / NumPy pipeline' },
      { name: 'SQL', desc: 'MySQL / PostgreSQL queries' },
      { name: 'Excel', desc: 'Data validation & QA' },
    ],
  },
  {
    title: 'Database',
    icon: Database,
    color: 'from-amber-400 to-orange-500',
    items: [
      { name: 'MySQL / PostgreSQL', desc: 'Reporting warehouse' },
      { name: 'SQLAlchemy', desc: 'ORM & query layer' },
    ],
  },
  {
    title: 'Visualization',
    icon: BarChart3,
    color: 'from-cyan-400 to-blue-500',
    items: [
      { name: 'Recharts', desc: 'Interactive charts' },
      { name: 'Plotly', desc: 'Analytical charts' },
    ],
  },
  {
    title: 'Tooling',
    icon: Code2,
    color: 'from-fuchsia-400 to-pink-500',
    items: [
      { name: 'Vite', desc: 'Lightning dev server' },
      { name: 'Git', desc: 'Version control' },
    ],
  },
]

export default function TechStack() {
  return (
    <section id="stack" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="08 · Tech Stack"
          title="The Stack Behind the Scenes"
          subtitle="A modern, end-to-end toolkit — from ingestion and cleaning through API, dashboard and storytelling."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GROUPS.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card card-hover p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center shadow-glow`}
                >
                  <g.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">{g.title}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {g.items.map((it) => (
                  <li
                    key={it.name}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                  >
                    <span className="text-sm font-semibold">{it.name}</span>
                    <span className="text-[11px] opacity-60">{it.desc}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
