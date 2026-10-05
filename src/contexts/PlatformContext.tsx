import { createContext, useContext, useState } from 'react'

export type Platform = 'windows' | 'mac'

interface PlatformContextValue {
  platform: Platform
  setPlatform: (p: Platform) => void
}

const PlatformContext = createContext<PlatformContextValue | null>(null)

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<Platform>('windows')

  return (
    <PlatformContext.Provider value={{ platform, setPlatform }}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  const ctx = useContext(PlatformContext)
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider')
  return ctx
}
