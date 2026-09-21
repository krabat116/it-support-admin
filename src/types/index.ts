export interface Category {
  id: string
  title: string
  icon: string
  order: number
  created_at: string
}

export interface QuickFix {
  id: string
  category_id: string
  label: string
  command: string
  requires_admin: boolean
  order: number
}

export interface SettingsShortcut {
  id: string
  category_id: string
  label: string
  uri: string
  order: number
}

export interface Guide {
  id: string
  category_id: string
  filename: string
  storage_url: string
  uploaded_at: string
}
