'use client';
import { useEffect, useState, useCallback } from 'react';
import { useClientData } from '@/context/ClientDataContext';

interface KpiProgressData {
  currentQuarterPercent: number | null;
  annualPercent: number | null;
  quarterLabel: string;
  year: number;
  trafficGrowth: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: KpiProgressData = {
  currentQuarterPercent: null,
  annualPercent: null,
  quarterLabel: '',
  year: new Date().getFullYear(),
  trafficGrowth: null,
  isLoading: false,
  error: null
};

export default function useKpiProgress(skipCache: boolean = false): KpiProgressData & { refresh: () => Promise<void> } {
  const { clientId } = useClientData();
  const [data, setData] = useState<KpiProgressData>(initialState);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    if (!clientId) {
      console.log('useKpiProgress: No clientId available, skipping fetch');
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'No client selected. Please select a client to view KPI progress.'
      }));
      return;
    }
    
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      const now = Date.now();
      
      // Only fetch if cache is expired or forceRefresh is true
      if (forceRefresh || skipCache || now - lastFetchTime > CACHE_TTL) {
        console.log(`Fetching fresh KPI progress data for client: ${clientId}`);
        const url = `/api/kpi-progress?clientId=${clientId}${forceRefresh ? '&skipCache=true' : ''}`;
        
        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch KPI progress: ${response.status}`);
        }
        
        const res = await response.json();
        
        if (!res) {
          throw new Error('Empty response from KPI progress API');
        }
        
        console.log('KPI progress data received:', res);
        
        setData({
          currentQuarterPercent: res.currentQuarterPercent,
          annualPercent: res.annualPercent,
          quarterLabel: res.quarterLabel,
          year: res.year,
          trafficGrowth: res.trafficGrowth ?? null,
          isLoading: false,
          error: null
        });
        
        setLastFetchTime(now);
      } else {
        console.log(`Using cached KPI progress data for client: ${clientId}`);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error fetching KPI progress:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch KPI progress'
      }));
    }
  }, [clientId, lastFetchTime, skipCache]);

  // Initial fetch
  useEffect(() => {
    if (clientId) {
      console.log(`useKpiProgress: Initial fetch for client: ${clientId}`);
      fetchData();
    } else {
      console.log('useKpiProgress: No clientId available for initial fetch');
      setData({
        ...initialState,
        error: 'No client selected. Please select a client to view KPI progress.'
      });
    }
  }, [clientId, fetchData]);

  // Function to manually refresh data
  const refresh = useCallback(async () => {
    if (!clientId) {
      console.log('useKpiProgress: Cannot refresh - no clientId available');
      return;
    }
    console.log(`useKpiProgress: Manual refresh for client: ${clientId}`);
    await fetchData(true);
  }, [fetchData, clientId]);

  return { ...data, refresh };
} 