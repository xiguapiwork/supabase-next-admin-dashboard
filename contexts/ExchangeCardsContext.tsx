'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ExchangeCardsContextType {
  refreshTrigger: number
  triggerRefresh: () => void
}

const ExchangeCardsContext = createContext<ExchangeCardsContextType | undefined>(undefined)

export function ExchangeCardsProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <ExchangeCardsContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ExchangeCardsContext.Provider>
  )
}

export function useExchangeCardsRefresh() {
  const context = useContext(ExchangeCardsContext)
  if (context === undefined) {
    throw new Error('useExchangeCardsRefresh must be used within an ExchangeCardsProvider')
  }
  return context
}