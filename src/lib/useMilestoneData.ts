import { useState, useEffect } from 'react';
import { useClientData } from '@/context/ClientDataContext';

export interface MilestoneData {
  monthProgress: number | null;
  monthName: string | null;
  progressSections: Record<string, number>;
  isAllClientsSelected?: boolean;
}

export default function useMilestoneData(): MilestoneData {
  const [data, setData] = useState<MilestoneData>({
    monthProgress: null,
    monthName: null,
    progressSections: {},
    isAllClientsSelected: false
  });

  const { clientId } = useClientData();

  useEffect(() => {
    if (!clientId) {
      setData({
        monthProgress: null,
        monthName: null,
        progressSections: {},
        isAllClientsSelected: false
      });
      return;
    }

    if (clientId === 'all') {
      setData({
        monthProgress: null,
        monthName: null,
        progressSections: {},
        isAllClientsSelected: true
      });
      return;
    }

    fetch(`/api/milestone-data?clientId=${clientId}`)
      .then(r => r.json())
      .then(({ monthProgress, monthStart, progressSections }) => {
        const rawProgress = Number(monthProgress);
        let progress: number | null = null;

        if (Number.isFinite(rawProgress)) {
          progress = rawProgress;
          if (progress > 0 && progress <= 1) progress *= 100;
          progress = Math.round(progress);
        }

        const monthName = monthStart
          ? new Date(monthStart).toLocaleString('default', { month: 'long', year: 'numeric' })
          : null;

        setData({ 
          monthProgress: progress, 
          monthName,
          progressSections: progressSections || {},
          isAllClientsSelected: false
        });
      })
      .catch(() => setData({ 
        monthProgress: null, 
        monthName: null, 
        progressSections: {},
        isAllClientsSelected: false
      }));
  }, [clientId]);

  return data;
} 