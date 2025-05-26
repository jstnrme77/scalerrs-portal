'use client';
import { useEffect, useState } from 'react';
import { useClientData } from '@/context/ClientDataContext';

interface MonthProgressData {
  progress: number | null;   // rounded %
  monthName: string | null;  // e.g. "May"
}

export default function useMonthProgress(): MonthProgressData {
  const [data, setData] = useState<MonthProgressData>({
    progress: null,
    monthName: null
  });

  const { clientId } = useClientData();

  useEffect(() => {
    if (!clientId) return;

    fetch(`/api/month-progress?clientId=${clientId}`)
      .then(r => r.json())
      .then(({ monthProgress, monthStart }) => {
        const raw = Number(monthProgress);
        let num: number | null = null;

        if (Number.isFinite(raw)) {
          num = raw;
          if (num > 0 && num <= 1) num *= 100;
          num = Math.round(num);
        }

        const monthName = monthStart
          ? new Date(monthStart).toLocaleString('default', { month: 'long' })
          : null;

        setData({ progress: num, monthName });
      })
      .catch(() => setData({ progress: null, monthName: null }));
  }, [clientId]);

  return data;
} 