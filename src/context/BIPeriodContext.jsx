import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PERIODS } from '../data/mockData';

const BIPeriodContext = createContext(null);

export function BIPeriodProvider({ children }) {
  // Default to August 2026 (The verified, fully documented month with 15 authentic proof documents)
  const [periodId, setPeriodId] = useState(() => {
    return localStorage.getItem('dora_bi_active_period') || 'p-2026-08';
  });

  const handleSetPeriod = (newPeriodId) => {
    setPeriodId(newPeriodId);
    try {
      localStorage.setItem('dora_bi_active_period', newPeriodId);
    } catch (e) {}
  };

  const periods = MOCK_PERIODS.map(p => ({
    ...p,
    labelAr: p.id === 'p-2026-08' ? 'أغسطس 2026 (المعتمد)' : p.label,
    isAudited: p.id === 'p-2026-08',
  }));

  const activePeriodObj = periods.find(p => p.id === periodId) || periods.find(p => p.id === 'p-2026-08') || periods[0];

  return (
    <BIPeriodContext.Provider
      value={{
        periodId,
        setPeriodId: handleSetPeriod,
        periods,
        activePeriodObj,
      }}
    >
      {children}
    </BIPeriodContext.Provider>
  );
}

export function useCurrentPeriod() {
  const context = useContext(BIPeriodContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      periodId: 'p-2026-08',
      setPeriodId: () => {},
      periods: MOCK_PERIODS,
      activePeriodObj: MOCK_PERIODS.find(p => p.id === 'p-2026-08'),
    };
  }
  return context;
}
