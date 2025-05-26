'use client';
import { useEffect, useState } from 'react';
import { useClientData } from '@/context/ClientDataContext';

interface KpiProgressData {
  currentQuarterPercent: number | null;
  annualPercent: number | null;
  quarterLabel: string;
  year: number;
  trafficGrowth: number | null;
}

export default function useKpiProgress(): KpiProgressData {
  const { clientId } = useClientData();
  const [data, setData] = useState<KpiProgressData>({
    currentQuarterPercent: null,
    annualPercent: null,
    quarterLabel: '',
    year: new Date().getFullYear(),
    trafficGrowth: null,
  });

  useEffect(() => {
    if (!clientId) return;
    fetch(`/api/kpi-progress?clientId=${clientId}`)
      .then(r => r.json())
      .then(res => {
        setData({
          currentQuarterPercent: res.currentQuarterPercent,
          annualPercent: res.annualPercent,
          quarterLabel: res.quarterLabel,
          year: res.year,
          trafficGrowth: res.trafficGrowth ?? null,
        });
      });
  }, [clientId]);

  return data;
} 