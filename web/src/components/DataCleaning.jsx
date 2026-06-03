import { motion } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle2, Play, RotateCcw, Database, Brush, Hash, Sparkles, Filter } from 'lucide-react'
import { SectionHead } from './Overview'

const STEPS = [
  {
    n: 1,
    title: 'Load dataset using Pandas',
    code: `import pandas as pd

df = pd.read_csv("zomato.csv", low_memory=False)
print("Shape:", df.shape)
print("Columns:", df.columns.tolist())`,
    icon: Database,
    note: '74,743 raw rows ingested with 17 columns spanning restaurants, ratings, votes, cost and services.',
  },
  {
    n: 2,
    title: 'Handle missing values',
    code: `critical = ["name", "location", "rate", "approx_cost(for two people)"]
df = df.dropna(subset=critical)
df["rate"] = df["rate"].fillna(df["rate"].median())
df["approx_cost(for two people)"] = df["approx_cost(for two people)"].fillna(
    df["approx_cost(for two people)"].median()
)`,
    icon: Brush,
    note: 'Drop empty critical rows, then impute numeric gaps with column medians to preserve distribution.',
  },
  {
    n: 3,
    title: 'Convert ratings to numeric',
    code: `import re
def parse_rate(v):
    if pd.isna(v) or v in {"NEW", "-"}: return None
    m = re.search(r"\\d+(\\.\\d+)?", str(v).replace("/5",""))
    return float(m.group(1)) if m else None

df["rating"] = df["rate"].apply(parse_rate)`,
    icon: Hash,
    note: 'Parse values like "4.1/5", "NEW" and "-" into a clean float column suitable for aggregation.',
  },
  {
    n: 4,
    title: 'Remove duplicates',
    code: `df = df.drop_duplicates(
    subset=["name", "location", "address"],
    keep="first"
)
df = df[df["name"].str.strip() != ""]`,
    icon: Filter,
    note: 'Eliminate chain-level duplicates so each unique restaurant appears exactly once.',
  },
  {
    n: 5,
    title: 'Clean cost column',
    code: `df["cost_for_two"] = (
    df["approx_cost(for two people)"]
      .str.replace(",", "", regex=False)
      .astype(float)
)
df["online_order"] = df["online_order"].str.strip().str.title()
df["book_table"]   = df["book_table"].str.strip().str.title()`,
    icon: Sparkles,
    note: 'Strip thousands separators, cast to float, and normalize Yes/No flags to a consistent title-case.',
  },
]

function fmt(n) {
  return n.toLocaleString()
}

export default function DataCleaning({ cleaning }) {
  const [active, setActive] = useState(1)
  const step = STEPS.find((s) => s.n === active)

  return (
    <section id="cleaning" className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="02 · Data Cleaning"
          title="From Messy CSV to Analytics-Ready DataFrame"
          subtitle="A five-step pipeline executed in Python with Pandas — every transformation is traceable and reproducible."
        />

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Rows Before" value={fmt(cleaning.rowsBefore)} delta="Raw ingestion" />
          <Metric label="Rows After" value={fmt(cleaning.rowsAfter)} delta="Ready for analysis" positive />
          <Metric label="Missing Fixed" value={fmt(cleaning.missingFixed)} delta="Cells imputed / removed" positive />
          <Metric label="Data Quality" value={`${cleaning.qualityScore}%`} delta="Completeness score" positive />
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 card p-3">
            <div className="px-2 py-1.5 text-xs uppercase tracking-widest opacity-60">Pipeline</div>
            <div className="flex flex-col gap-1">
              {STEPS.map((s) => {
                const Icon = s.icon
                const isActive = s.n === active
                return (
                  <button
                    key={s.n}
                    onClick={() => setActive(s.n)}
                    className={`text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-accent-500/40 bg-accent-500/10'
                        : 'border-white/5 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white'
                          : 'bg-white/5'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs opacity-60">Step {s.n}</div>
                      <div className="text-sm font-semibold leading-tight">{s.title}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-8 card overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs opacity-70 font-mono">
                  step_{String(step.n).padStart(2, '0')}_cleaning.py
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip !text-emerald-300 !border-emerald-400/30 !bg-emerald-400/10">
                  <CheckCircle2 className="h-3 w-3" /> Validated
                </span>
                <button
                  onClick={() => setActive(1)}
                  className="p-1.5 rounded-md hover:bg-white/5"
                  title="Restart"
                >
                  <RotateCcw className="h-3.5 w-3.5 opacity-70" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-white/5" title="Run">
                  <Play className="h-3.5 w-3.5 opacity-70" />
                </button>
              </div>
            </div>

            <div className="p-5 bg-[#0c1024] dark:bg-[#0c1024]">
              <pre className="font-mono text-[13px] leading-relaxed overflow-x-auto scrollbar-thin">
                <code>
                  <span className="opacity-50"># Step {step.n} · {step.title}</span>{'\n'}
                  {step.code}
                </code>
              </pre>
            </div>

            <div className="px-5 py-4 border-t border-white/10 bg-white/5">
              <div className="text-xs uppercase tracking-widest opacity-60 mb-1">Outcome</div>
              <p className="text-sm opacity-85">{step.note}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value, delta, positive }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-widest opacity-60">{label}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
      <div
        className={`mt-1 text-xs ${
          positive ? 'text-emerald-400' : 'opacity-60'
        }`}
      >
        {delta}
      </div>
    </div>
  )
}
