'use client';
import { useEffect, useState } from 'react';
import { useClientData } from '@/context/ClientDataContext';

interface MonthProgressData {
  progress: number | null;   // rounded %
  monthName: string | null;  // e.g. "May"
  isLoading: boolean;
  error: string | null;
}

export default function useMonthProgress(): MonthProgressData {
  const [data, setData] = useState<MonthProgressData>({
    progress: null,
    monthName: null,
    isLoading: true,
    error: null
  });

  const { clientId, isLoading: isClientLoading } = useClientData();

  useEffect(() => {
    // Set loading state while client data is loading
    if (isClientLoading) {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      return;
    }

    // Handle missing clientId
    if (!clientId) {
      console.log('No clientId available in useMonthProgress');
      setData({
        progress: null,
        monthName: null,
        isLoading: false,
        error: 'No client selected'
      });
      return;
    }

    // Set loading state when fetching begins
    setData(prev => ({ ...prev, isLoading: true, error: null }));

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

        setData({ 
          progress: num, 
          monthName,
          isLoading: false,
          error: null
        });
      })
      .catch(err => {
        console.error('Error fetching month progress:', err);
        setData({
          progress: null,
          monthName: null,
          isLoading: false,
          error: 'Failed to load month progress'
        });
      });
  }, [clientId, isClientLoading]);

  return data;
} 