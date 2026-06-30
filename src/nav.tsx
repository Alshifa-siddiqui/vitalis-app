import { createContext, useContext, useState, type ReactNode } from 'react'

type Nav = { detailId: string | null; openDetail: (id: string) => void; closeDetail: () => void }

const NavContext = createContext<Nav>({ detailId: null, openDetail: () => {}, closeDetail: () => {} })

export function NavProvider({ children }: { children: (nav: Nav) => ReactNode }) {
  const [detailId, setDetailId] = useState<string | null>(null)
  const value: Nav = {
    detailId,
    openDetail: (id) => setDetailId(id),
    closeDetail: () => setDetailId(null),
  }
  return <NavContext.Provider value={value}>{children(value)}</NavContext.Provider>
}

export const useNav = () => useContext(NavContext)
