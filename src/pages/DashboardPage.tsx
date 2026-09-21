import { useEffect, useState } from 'react'
import { BookOpen, Cpu, FolderOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Stats {
  categories: number
  guides: number
  quickFixes: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ categories: 0, guides: 0, quickFixes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const [catRes, guideRes, qfRes] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('guides').select('id', { count: 'exact', head: true }),
        supabase.from('quick_fixes').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        categories: catRes.count ?? 0,
        guides: guideRes.count ?? 0,
        quickFixes: qfRes.count ?? 0,
      })
      setLoading(false)
    }
    void fetchStats()
  }, [])

  const cards = [
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: 'text-blue-600' },
    { label: 'PDF Guides', value: stats.guides, icon: BookOpen, color: 'text-green-600' },
    { label: 'Quick Fix Items', value: stats.quickFixes, icon: Cpu, color: 'text-purple-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">IT Support Tray App Overview</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <Icon size={20} className={color} />
              </div>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-medium">Quick Start</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>1. Upload PDF files by category in <strong>Guide Management</strong>.</li>
          <li>2. Configure categories and Quick Fix items in <strong>App Configuration</strong>.</li>
          <li>3. Changes will be applied automatically on the next tray app launch.</li>
        </ul>
      </div>
    </div>
  )
}
