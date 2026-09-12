import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_PERIODS } from '../data/mockData';

const BIPeriodContext = createContext(null);
const STORAGE_KEY_ACTIVE = 'dora_bi_active_period';
const STORAGE_KEY_CUSTOM_PERIODS = 'dora_custom_periods_v1';

export function BIPeriodProvider({ children }) {
  // Load custom periods initialized by user
  const [customPeriods, setCustomPeriods] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_PERIODS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Default to August 2026 (The verified, fully documented month with 15 authentic proof documents)
  const [periodId, setPeriodId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE) || 'p-2026-08';
  });

  const handleSetPeriod = useCallback((newPeriodId) => {
    setPeriodId(newPeriodId);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, newPeriodId);
    } catch (e) {}
  }, []);

  // Combine initial mock periods with any newly initialized custom periods
  const periods = React.useMemo(() => {
    const basePeriods = MOCK_PERIODS.map(p => ({
      ...p,
      labelAr: p.id === 'p-2026-08' ? 'أغسطس 2026 (المعتمد بالفواتير)' : p.label,
      isAudited: p.id === 'p-2026-08',
      isLiveApi: p.id === 'p-2026-09',
      status: p.id === 'p-2026-08' ? 'audited' : (p.id === 'p-2026-09' ? 'in_progress' : 'closed'),
      target: p.id === 'p-2026-08' ? 800000 : (p.id === 'p-2026-09' ? 850000 : 750000),
      opex: {
        salaries: 60000,
        facilities: 20000,
        contingency: 10000,
        total: 90000
      }
    }));

    const customMapped = (customPeriods || []).map(cp => {
      const savedTarget = localStorage.getItem(`dora_period_target_${cp.id}`);
      const savedOpex = localStorage.getItem(`dora_period_opex_${cp.id}`);
      return {
        ...cp,
        labelAr: cp.labelAr || cp.label,
        isAudited: cp.isAudited || false,
        isLiveApi: true,
        status: cp.status || 'in_progress',
        target: savedTarget ? Number(savedTarget) : (cp.target || 850000),
        opex: savedOpex ? JSON.parse(savedOpex) : (cp.opex || {
          salaries: 60000,
          facilities: 20000,
          contingency: 10000,
          total: 90000
        })
      };
    });

    // Merge without duplicates
    const all = [...basePeriods];
    customMapped.forEach(cp => {
      const idx = all.findIndex(p => p.id === cp.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...cp };
      } else {
        all.unshift(cp);
      }
    });

    return all;
  }, [customPeriods]);

  const activePeriodObj = React.useMemo(() => {
    return periods.find(p => p.id === periodId) || periods.find(p => p.id === 'p-2026-08') || periods[0];
  }, [periods, periodId]);

  // Method to initialize and launch a new operating month
  const initializeNewPeriod = useCallback(({ year, month, label, labelEn, target = 850000, opex = { salaries: 60000, facilities: 20000, contingency: 10000 } }) => {
    const y = Number(year) || new Date().getFullYear();
    const m = Number(month) || (new Date().getMonth() + 1);
    const mPadded = String(m).padStart(2, '0');
    const newId = `p-${y}-${mPadded}`;
    const periodKey = `${y}-${mPadded}`;

    const monthNamesAr = [
      '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthNamesEn = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const finalLabelAr = label || `${monthNamesAr[m]} ${y} (قيد التشغيل والربط اللحظي)`;
    const finalLabelEn = labelEn || `${monthNamesEn[m]} ${y} (Live Operations)`;

    const daysInMonth = new Date(y, m, 0).getDate();
    const startDate = `${y}-${mPadded}-01`;
    const endDate = `${y}-${mPadded}-${daysInMonth}`;

    const opexTotal = (Number(opex.salaries) || 60000) + (Number(opex.facilities) || 20000) + (Number(opex.contingency) || 10000);
    const fullOpex = {
      salaries: Number(opex.salaries) || 60000,
      facilities: Number(opex.facilities) || 20000,
      contingency: Number(opex.contingency) || 10000,
      total: opexTotal
    };

    const newPeriod = {
      id: newId,
      periodKey,
      year: y,
      month: m,
      quarter: Math.ceil(m / 3),
      label: finalLabelAr,
      labelAr: finalLabelAr,
      labelEn: finalLabelEn,
      startDate,
      endDate,
      isCurrent: true,
      isClosed: false,
      isAudited: false,
      isLiveApi: true,
      status: 'in_progress',
      target: Number(target) || 850000,
      opex: fullOpex,
      createdAt: new Date().toISOString()
    };

    // Save target & opex
    localStorage.setItem(`dora_period_target_${newId}`, String(newPeriod.target));
    localStorage.setItem(`dora_period_opex_${newId}`, JSON.stringify(fullOpex));

    // Save custom periods list
    const updatedCustom = [newPeriod, ...customPeriods.filter(p => p.id !== newId)];
    setCustomPeriods(updatedCustom);
    localStorage.setItem(STORAGE_KEY_CUSTOM_PERIODS, JSON.stringify(updatedCustom));

    // Switch to new period
    handleSetPeriod(newId);

    return newPeriod;
  }, [customPeriods, handleSetPeriod]);

  return (
    <BIPeriodContext.Provider
      value={{
        periodId,
        setPeriodId: handleSetPeriod,
        periods,
        activePeriodObj,
        initializeNewPeriod,
      }}
    >
      {children}
    </BIPeriodContext.Provider>
  );
}

export function useCurrentPeriod() {
  const context = useContext(BIPeriodContext);
  if (!context) {
    return {
      periodId: 'p-2026-08',
      setPeriodId: () => {},
      periods: MOCK_PERIODS,
      activePeriodObj: MOCK_PERIODS.find(p => p.id === 'p-2026-08'),
      initializeNewPeriod: () => {},
    };
  }
  return context;
}
