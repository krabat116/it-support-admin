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
  platform: 'windows' | 'mac'
}

export interface SettingsShortcut {
  id: string
  category_id: string
  label: string
  uri: string
  order: number
  platform: 'windows' | 'mac'
}

export interface Guide {
  id: string
  category_id: string
  filename: string
  storage_url: string
  uploaded_at: string
}
