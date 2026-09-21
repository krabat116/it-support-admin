import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 환경변수를 .env 파일에 설정해주세요.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
