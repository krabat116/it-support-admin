import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Trash2, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Category, Guide } from '@/types'

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadCategory, setUploadCategory] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    const [guideRes, catRes] = await Promise.all([
      supabase.from('guides').select('*').order('uploaded_at', { ascending: false }),
      supabase.from('categories').select('*').order('order'),
    ])
    if (guideRes.data) setGuides(guideRes.data as Guide[])
    if (catRes.data) {
      setCategories(catRes.data as Category[])
      if (!uploadCategory && catRes.data.length > 0) {
        setUploadCategory((catRes.data[0] as Category).id)
      }
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadCategory) return

    if (file.type !== 'application/pdf') {
      setError('Only PDF files can be uploaded.')
      return
    }

    setUploading(true)
    setError('')

    const fileName = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('guides')
      .upload(fileName, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('guides').getPublicUrl(fileName)

    const { error: dbError } = await supabase.from('guides').insert({
      category_id: uploadCategory,
      filename: file.name,
      storage_url: urlData.publicUrl,
    })

    if (dbError) {
      setError(dbError.message)
    } else {
      await fetchData()
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (guide: Guide) => {
    if (!confirm(`Are you sure you want to delete "${guide.filename}"?`)) return

    const fileName = guide.storage_url.split('/').pop() ?? ''
    await supabase.storage.from('guides').remove([fileName])
    await supabase.from('guides').delete().eq('id', guide.id)
    await fetchData()
  }

  const filtered =
    selectedCategory === 'all'
      ? guides
      : guides.filter((g) => g.category_id === selectedCategory)

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.title ?? '-'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Guide Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage PDF guides by category</p>
        </div>

        {/* 업로드 영역 */}
        <div className="flex items-center gap-3">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.title}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Upload size={15} />
            {uploading ? 'Uploading...' : 'Upload PDF'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => void handleUpload(e)}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'border hover:bg-accent'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              selectedCategory === c.id
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-accent'
            }`}
          >
            {c.icon} {c.title}
          </button>
        ))}
      </div>

      {/* 가이드 테이블 */}
      <div className="rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Filename</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Uploaded At</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No guides uploaded
                </td>
              </tr>
            ) : (
              filtered.map((guide) => (
                <tr key={guide.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{guide.filename}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getCategoryName(guide.category_id)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(guide.uploaded_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={guide.storage_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                      >
                        <ExternalLink size={13} />
                        Open
                      </a>
                      <button
                        onClick={() => void handleDelete(guide)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
