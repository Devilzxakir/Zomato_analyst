import { BarChart3 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="px-4 sm:px-6 py-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Zomato Restaurant Analytics</div>
            <div className="text-xs opacity-60">Data Analyst Portfolio</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs opacity-60">
          <a href="#overview" className="hover:opacity-100 transition">Overview</a>
          <a href="#dashboard" className="hover:opacity-100 transition">Dashboard</a>
          <a href="#insights" className="hover:opacity-100 transition">Insights</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4 text-xs opacity-40 text-center">
        Built with React, Tailwind, Recharts &amp; Framer Motion
      </div>
    </footer>
  )
}
