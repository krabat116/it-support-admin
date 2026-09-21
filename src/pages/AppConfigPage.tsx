import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Category, QuickFix, SettingsShortcut } from '@/types'

type Tab = 'categories' | 'quickfixes' | 'shortcuts'

/* ───────── Categories ───────── */
function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('📁')
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('categories').select('*').order('order')
    if (data) setCategories(data as Category[])
  }

  useEffect(() => { void fetch() }, [])

  const handleAdd = async () => {
    if (!title.trim()) return
    setSaving(true)
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.order), 0)
    await supabase.from('categories').insert({ title: title.trim(), icon, order: maxOrder + 1 })
    setTitle('')
    setIcon('📁')
    await fetch()
    setSaving(false)
  }

  const handleDelete = async (id: string, catTitle: string) => {
    if (!confirm(`Are you sure you want to delete the "${catTitle}" category?\nAll sub-items will also be deleted.`)) return
    await supabase.from('categories').delete().eq('id', id)
    await fetch()
  }

  return (
    <div className="space-y-4">
      {/* 추가 폼 */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={2}
          placeholder="📁"
          className="w-14 rounded-md border border-input bg-background px-3 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Category name (e.g. Network Issues)"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd() }}
        />
        <button
          onClick={() => void handleAdd()}
          disabled={saving || !title.trim()}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {/* 목록 */}
      <div className="rounded-lg border bg-card shadow-sm">
        {categories.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No categories</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
              <span className="text-xl">{c.icon}</span>
              <span className="flex-1 text-sm font-medium">{c.title}</span>
              <span className="text-xs text-muted-foreground">Order {c.order}</span>
              <button
                onClick={() => void handleDelete(c.id, c.title)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ───────── Quick Fixes ───────── */
function QuickFixesTab() {
  const [quickFixes, setQuickFixes] = useState<QuickFix[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ category_id: '', label: '', command: '', requires_admin: false })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    const [qfRes, catRes] = await Promise.all([
      supabase.from('quick_fixes').select('*').order('order'),
      supabase.from('categories').select('*').order('order'),
    ])
    if (qfRes.data) setQuickFixes(qfRes.data as QuickFix[])
    if (catRes.data) {
      setCategories(catRes.data as Category[])
      if (!form.category_id && catRes.data.length > 0) {
        setForm((f) => ({ ...f, category_id: (catRes.data[0] as Category).id }))
      }
    }
  }

  useEffect(() => { void fetchAll() }, [])

  const handleAdd = async () => {
    if (!form.label.trim() || !form.command.trim() || !form.category_id) return
    setSaving(true)
    const inCategory = quickFixes.filter((q) => q.category_id === form.category_id)
    const maxOrder = inCategory.reduce((m, q) => Math.max(m, q.order), 0)
    await supabase.from('quick_fixes').insert({
      category_id: form.category_id,
      label: form.label.trim(),
      command: form.command.trim(),
      requires_admin: form.requires_admin,
      order: maxOrder + 1,
    })
    setForm((f) => ({ ...f, label: '', command: '', requires_admin: false }))
    await fetchAll()
    setSaving(false)
  }

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}"?`)) return
    await supabase.from('quick_fixes').delete().eq('id', id)
    await fetchAll()
  }

  const grouped = categories.map((c) => ({
    category: c,
    items: quickFixes.filter((q) => q.category_id === c.id),
  }))

  return (
    <div className="space-y-4">
      {/* 추가 폼 */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-3 text-sm font-medium">Add New Quick Fix</p>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
            ))}
          </select>
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Button label (e.g. Flush DNS)"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={form.command}
            onChange={(e) => setForm((f) => ({ ...f, command: e.target.value }))}
            placeholder="Command (e.g. ipconfig /flushdns)"
            className="col-span-2 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.requires_admin}
              onChange={(e) => setForm((f) => ({ ...f, requires_admin: e.target.checked }))}
              className="h-4 w-4"
            />
            Requires admin privileges (UAC)
          </label>
          <div className="flex justify-end">
            <button
              onClick={() => void handleAdd()}
              disabled={saving || !form.label.trim() || !form.command.trim()}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus size={15} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* 카테고리별 목록 */}
      {grouped.map(({ category, items }) => (
        <div key={category.id} className="rounded-lg border bg-card shadow-sm">
          <div className="border-b bg-muted/30 px-4 py-2">
            <span className="text-sm font-medium">
              {category.icon} {category.title}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">({items.length})</span>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground">No items</p>
          ) : (
            items.map((qf) => (
              <div key={qf.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{qf.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">{qf.command}</p>
                </div>
                {qf.requires_admin && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                    UAC
                  </span>
                )}
                <button
                  onClick={() => void handleDelete(qf.id, qf.label)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      ))}

      {grouped.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Please add a category first
        </p>
      )}
    </div>
  )
}

/* ───────── Settings Shortcuts ───────── */
function ShortcutsTab() {
  const [shortcuts, setShortcuts] = useState<SettingsShortcut[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ category_id: '', label: '', uri: '' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    const [scRes, catRes] = await Promise.all([
      supabase.from('settings_shortcuts').select('*').order('order'),
      supabase.from('categories').select('*').order('order'),
    ])
    if (scRes.data) setShortcuts(scRes.data as SettingsShortcut[])
    if (catRes.data) {
      setCategories(catRes.data as Category[])
      if (!form.category_id && catRes.data.length > 0) {
        setForm((f) => ({ ...f, category_id: (catRes.data[0] as Category).id }))
      }
    }
  }

  useEffect(() => { void fetchAll() }, [])

  const handleAdd = async () => {
    if (!form.label.trim() || !form.uri.trim() || !form.category_id) return
    setSaving(true)
    const inCat = shortcuts.filter((s) => s.category_id === form.category_id)
    const maxOrder = inCat.reduce((m, s) => Math.max(m, s.order), 0)
    await supabase.from('settings_shortcuts').insert({
      category_id: form.category_id,
      label: form.label.trim(),
      uri: form.uri.trim(),
      order: maxOrder + 1,
    })
    setForm((f) => ({ ...f, label: '', uri: '' }))
    await fetchAll()
    setSaving(false)
  }

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}"?`)) return
    await supabase.from('settings_shortcuts').delete().eq('id', id)
    await fetchAll()
  }

  const grouped = categories.map((c) => ({
    category: c,
    items: shortcuts.filter((s) => s.category_id === c.id),
  }))

  return (
    <div className="space-y-4">
      {/* 추가 폼 */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-3 text-sm font-medium">Add New Settings Shortcut</p>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
            ))}
          </select>
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Label (e.g. Network Settings)"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={form.uri}
            onChange={(e) => setForm((f) => ({ ...f, uri: e.target.value }))}
            placeholder="URI (예: ms-settings:network)"
            className="col-span-2 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div />
          <div className="flex justify-end">
            <button
              onClick={() => void handleAdd()}
              disabled={saving || !form.label.trim() || !form.uri.trim()}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus size={15} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* 카테고리별 목록 */}
      {grouped.map(({ category, items }) => (
        <div key={category.id} className="rounded-lg border bg-card shadow-sm">
          <div className="border-b bg-muted/30 px-4 py-2">
            <span className="text-sm font-medium">{category.icon} {category.title}</span>
            <span className="ml-2 text-xs text-muted-foreground">({items.length})</span>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground">No items</p>
          ) : (
            items.map((sc) => (
              <div key={sc.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{sc.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">{sc.uri}</p>
                </div>
                <button
                  onClick={() => void handleDelete(sc.id, sc.label)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  )
}

/* ───────── Main Page ───────── */
const TABS: { id: Tab; label: string }[] = [
  { id: 'categories', label: 'Categories' },
  { id: 'quickfixes', label: 'Quick Fix' },
  { id: 'shortcuts', label: 'Settings Shortcuts' },
]

export function AppConfigPage() {
  const [activeTab, setActiveTab] = useState<Tab>('categories')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">App Configuration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage categories and button items for the tray app
        </p>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-1 border-b">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'quickfixes' && <QuickFixesTab />}
      {activeTab === 'shortcuts' && <ShortcutsTab />}
    </div>
  )
}
