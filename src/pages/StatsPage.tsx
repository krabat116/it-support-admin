import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UsageLog {
  id: string
  timestamp: string
  category_id: string
  action_id: string
  success: boolean
  hostname: string | null
  app_version: string | null
  created_at: string
}

interface QuickFix {
  id: string
  label: string
  category_id: string
}

interface Category {
  id: string
  title: string
}

export function StatsPage() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [quickFixes, setQuickFixes] = useState<Map<string, string>>(new Map())
  const [categories, setCategories] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [clearingAll, setClearingAll] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const [logsRes, qfRes, catRes] = await Promise.all([
        supabase
          .from('usage_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('quick_fixes').select('id, label, category_id'),
        supabase.from('categories').select('id, title'),
      ])

      if (logsRes.data) setLogs(logsRes.data as UsageLog[])
      if (qfRes.data) {
        setQuickFixes(new Map((qfRes.data as QuickFix[]).map(q => [q.id, q.label])))
      }
      if (catRes.data) {
        setCategories(new Map((catRes.data as Category[]).map(c => [c.id, c.title])))
      }

      setLoading(false)
    }
    void fetchAll()
  }, [])

  const deleteRow = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('usage_logs').delete().eq('id', id)
    if (!error) {
      setLogs(prev => prev.filter(l => l.id !== id))
    }
    setDeletingId(null)
  }

  const clearAll = async () => {
    if (!window.confirm('모든 사용 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setClearingAll(true)
    const { error } = await supabase.from('usage_logs').delete().neq('id', '')
    if (!error) {
      setLogs([])
    }
    setClearingAll(false)
  }

  const totalEvents = logs.length
  const successCount = logs.filter(l => l.success).length
  const successRate = totalEvents > 0 ? Math.round((successCount / totalEvents) * 100) : 0
  const uniqueDevices = new Set(logs.map(l => l.hostname).filter(Boolean)).size

  const actionCounts = new Map<string, number>()
  logs.forEach(l => actionCounts.set(l.action_id, (actionCounts.get(l.action_id) ?? 0) + 1))
  const topActions = [...actionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Usage Statistics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick Fix execution history from all devices
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={() => void clearAll()}
            disabled={clearingAll}
            className="flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 size={14} />
            {clearingAll ? 'Clearing...' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {[
          { label: 'Total Executions', value: totalEvents },
          { label: 'Success Rate', value: `${successRate}%` },
          { label: 'Successful', value: successCount },
          { label: 'Devices', value: uniqueDevices },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6">
        {/* Top actions */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-3 font-medium">Most Used Quick Fixes</h3>
          {topActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {topActions.map(([actionId, count]) => (
                <li key={actionId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {quickFixes.get(actionId) ?? actionId}
                  </span>
                  <span className="font-semibold">{count}x</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* By category */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-3 font-medium">Executions by Category</h3>
          {categories.size === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {[...categories.entries()].map(([catId, catTitle]) => {
                const count = logs.filter(l => l.category_id === catId).length
                return (
                  <li key={catId} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{catTitle}</span>
                    <span className="font-semibold">{count}x</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent events table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-5 py-3">
          <h3 className="font-medium">Recent Events</h3>
        </div>
        {logs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No events recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Result</th>
                  <th className="px-5 py-3 font-medium">Device</th>
                  <th className="px-5 py-3 font-medium">Version</th>
                  <th className="px-5 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">{categories.get(log.category_id) ?? log.category_id}</td>
                    <td className="px-5 py-3">{quickFixes.get(log.action_id) ?? log.action_id}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          log.success
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{log.hostname ?? '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground">{log.app_version ?? '—'}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => void deleteRow(log.id)}
                        disabled={deletingId === log.id}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
