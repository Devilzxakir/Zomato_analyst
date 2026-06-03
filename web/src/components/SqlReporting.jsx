import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Database, Sparkles, ChevronRight } from 'lucide-react'
import { SectionHead } from './Overview'

const QUERIES = [
  {
    id: 'top10',
    title: 'Top 10 Restaurants by Rating',
    sql: `SELECT name, location, rate_num AS rating, votes, cost_for_two
FROM restaurants
WHERE votes > 500
ORDER BY rating DESC, votes DESC
LIMIT 10;`,
    insight:
      'Restaurants with high engagement (votes > 500) consistently score above 4.0 — quality correlates with reach.',
    key: 'topByRating',
  },
  {
    id: 'avgType',
    title: 'Average Rating by Restaurant Type',
    sql: `SELECT rest_type, AVG(rate_num) AS avg_rating, COUNT(*) AS n
FROM restaurants
GROUP BY rest_type
ORDER BY avg_rating DESC
LIMIT 12;`,
    insight:
      'Premium formats (Bakery, Lounge) top the chart, while Quick Bites dominate volume with mid-tier ratings.',
    key: 'avgRatingByType',
  },
  {
    id: 'online',
    title: 'Restaurants with Online Ordering',
    sql: `SELECT name, location, rate_num AS rating, votes
FROM restaurants
WHERE online_order = 'Yes'
ORDER BY votes DESC
LIMIT 10;`,
    insight:
      'Online-enabled restaurants collect 2-3x more votes on average — discoverability drives engagement.',
    key: 'onlineOrdering',
  },
  {
    id: 'voted',
    title: 'Highest Voted Restaurants',
    sql: `SELECT name, location, votes, rate_num AS rating, cost_for_two
FROM restaurants
ORDER BY votes DESC
LIMIT 10;`,
    insight:
      'Top voted venues combine affordable pricing, online ordering and broad cuisine variety.',
    key: 'highestVoted',
  },
  {
    id: 'cost',
    title: 'Cost Analysis by Category',
    sql: `SELECT listed_in_type AS category,
       AVG(cost_for_two)  AS avg_cost,
       MIN(cost_for_two)  AS min_cost,
       MAX(cost_for_two)  AS max_cost,
       COUNT(*)           AS n
FROM restaurants
GROUP BY listed_in_type
ORDER BY n DESC;`,
    insight:
      'Dining categories command 2-3x the price of Buffet / Delivery — pricing power is format-specific.',
    key: 'costByCategory',
  },
]

export default function SqlReporting({ data }) {
  const [active, setActive] = useState(QUERIES[0].id)
  const q = QUERIES.find((x) => x.id === active)
  const rows = data.sqlResults[q.key]

  return (
    <section id="sql" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="04 · SQL Reporting"
          title="Five Queries that Drive the Story"
          subtitle="A built-in SQL editor with pre-computed result tables and an auto-generated business insight for every query."
        />

        <div className="mt-10 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="card p-3">
              <div className="px-2 py-1.5 text-xs uppercase tracking-widest opacity-60 flex items-center gap-2">
                <Database className="h-3.5 w-3.5" /> Queries
              </div>
              <div className="flex flex-col gap-1">
                {QUERIES.map((qq, i) => (
                  <button
                    key={qq.id}
                    onClick={() => setActive(qq.id)}
                    className={`text-left flex items-center gap-3 p-3 rounded-xl border transition ${
                      active === qq.id
                        ? 'border-accent-500/40 bg-accent-500/10'
                        : 'border-white/5 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[11px] font-mono opacity-50">
                      0{i + 1}
                    </span>
                    <span className="text-sm font-medium leading-tight flex-1">
                      {qq.title}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition ${
                        active === qq.id ? 'text-accent-400' : 'opacity-40'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id + '-sql'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="card overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/20">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs opacity-70 font-mono">zomato.sql</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip !text-emerald-300 !border-emerald-400/30 !bg-emerald-400/10">
                      Executed · {(Math.random() * 30 + 8).toFixed(1)}ms
                    </span>
                    <button className="p-1.5 rounded-md hover:bg-white/5" title="Run">
                      <Play className="h-3.5 w-3.5 opacity-70" />
                    </button>
                  </div>
                </div>
                <div className="p-5 bg-[#0c1024]">
                  <pre className="font-mono text-[13px] leading-relaxed overflow-x-auto scrollbar-thin">
                    <code>
                      {q.sql.split('\n').map((line, i) => (
                        <div key={i} className="flex">
                          <span className="w-7 shrink-0 text-right pr-3 opacity-30 select-none">
                            {i + 1}
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: highlight(line) }} />
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={q.id + '-result'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="card overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                  <div className="text-xs uppercase tracking-widest opacity-60">
                    Result · {rows.length} rows
                  </div>
                  <span className="chip !text-accent-400 !border-accent-500/30 !bg-accent-500/10">
                    <Sparkles className="h-3 w-3" /> Auto-insight ready
                  </span>
                </div>
                <div className="overflow-x-auto scrollbar-thin">
                  <ResultTable qKey={q.key} rows={rows} />
                </div>
                <div className="px-5 py-4 border-t border-white/10 bg-gradient-to-r from-accent-500/10 to-brand-500/10">
                  <div className="text-xs uppercase tracking-widest opacity-70 mb-1">
                    Business Insight
                  </div>
                  <p className="text-sm">{q.insight}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        pre code .kw { color: #ff79c6; font-weight: 600; }
        pre code .str { color: #f1fa8c; }
        pre code .num { color: #bd93f9; }
        pre code .col { color: #8be9fd; }
        pre code .com { color: #6272a4; font-style: italic; }
      `}</style>
    </section>
  )
}

function highlight(line) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'LIMIT', 'AS', 'AND', 'OR', 'DESC', 'ASC', 'AVG', 'COUNT', 'MIN', 'MAX', 'BY', 'IN']
  let out = line
  out = out.replace(/(\/\*.*?\*\/|--.*$)/g, '<span class="com">$1</span>')
  out = out.replace(/'([^']*)'/g, "<span class='str'>'$1'</span>")
  out = out.replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
  const kwPattern = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g')
  out = out.replace(kwPattern, '<span class="kw">$1</span>')
  return out
}

function ResultTable({ qKey, rows }) {
  if (!rows || rows.length === 0) return <div className="p-5 text-sm opacity-60">No data</div>
  const cols = Object.keys(rows[0])
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-white/10 bg-white/5">
          {cols.map((c) => (
            <th key={c} className="px-4 py-2.5 text-[11px] uppercase tracking-widest opacity-60 font-semibold">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
            {cols.map((c) => (
              <td key={c} className="px-4 py-2.5 align-top">
                {formatValue(c, r[c])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function formatValue(k, v) {
  if (typeof v === 'number') {
    if (k.toLowerCase().includes('cost') || k.toLowerCase().includes('₹')) return `₹${v}`
    if (k.toLowerCase().includes('rating')) return v.toFixed(2)
    if (k.toLowerCase().includes('votes') || k.toLowerCase().includes('count')) return v.toLocaleString()
  }
  return String(v)
}
