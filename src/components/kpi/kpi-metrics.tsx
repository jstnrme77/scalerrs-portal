"use client"

import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState, useCallback } from "react"
import { fetchKPIMetrics } from "@/lib/client-api"
import { KPIMetric } from "@/types"
import { useClientData } from "@/context/ClientDataContext"

interface KpiMetricsProps {
  metricsData?: any[]
}

export function KpiMetrics({ metricsData }: KpiMetricsProps) {
  const { clientId, isLoading: isClientLoading } = useClientData();
  const [metrics, setMetrics] = useState([
    {
      title: "Organic Traffic",
      value: "Loading...",
      target: "Loading...",
      progress: 0,
      trend: "up",
      description: "vs. target",
      unit: ""
    },
    {
      title: "Conversion Rate",
      value: "Loading...",
      target: "Loading...",
      progress: 0,
      trend: "up",
      description: "vs. target",
      unit: "%"
    },
    {
      title: "Lead Generation",
      value: "Loading...",
      target: "Loading...",
      progress: 0,
      trend: "up",
      description: "vs. target",
      unit: ""
    },
    {
      title: "Revenue Impact",
      value: "Loading...",
      target: "Loading...",
      progress: 0,
      trend: "up",
      description: "estimated",
      unit: "$"
    },
  ])

  const [loading, setLoading] = useState(!metricsData)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const CACHE_TTL = 60 * 1000 // 1 minute cache TTL

  const fetchData = useCallback(async (skipCache = false) => {
    if (isClientLoading) {
      console.log('Client data still loading, delaying fetch');
      return;
    }
    
    if (!clientId) {
      console.log('No clientId available, skipping fetch');
      setError('No client selected. Please select a client to view KPI metrics.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true)
      setError(null)
      const now = Date.now();
      
      // Only fetch if cache is expired or skipCache is true
      if (skipCache || now - lastFetchTime > CACHE_TTL) {
        console.log(`Fetching fresh KPI metrics data for client: ${clientId}`);
        const data = await fetchKPIMetrics(clientId)
        
        if (!data || data.length === 0) {
          console.log('No KPI metrics data returned');
          setError('No KPI metrics data available for this client.');
        } else {
          console.log(`Received ${data.length} KPI metrics`);
          processMetricsData(data)
        }
        
        setLastFetchTime(now)
      } else {
        console.log(`Using cached KPI metrics data for client: ${clientId}`);
      }
    } catch (error) {
      console.error("Error fetching KPI metrics:", error)
      setError('Failed to load KPI metrics. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [clientId, isClientLoading, lastFetchTime])

  useEffect(() => {
    // If metrics data is provided as props, use it
    if (metricsData && metricsData.length > 0) {
      processMetricsData(metricsData)
      return
    }

    // Wait for client data to load
    if (isClientLoading) {
      return;
    }

    // Otherwise fetch the data
    if (clientId) {
      fetchData()
    } else {
      setError('No client selected. Please select a client to view KPI metrics.');
      setLoading(false);
    }
  }, [metricsData, clientId, isClientLoading, fetchData])

  const processMetricsData = (data: any[]) => {
    // Define mapping between Airtable metric names and our component titles
    const metricMapping: Record<string, string> = {
      'Organic Clicks': 'Organic Traffic',
      'Organic Traffic': 'Organic Traffic',
      'Traffic': 'Organic Traffic',
      'Conversion Rate': 'Conversion Rate',
      'Conversion': 'Conversion Rate',
      'Lead Generation': 'Lead Generation',
      'Estimated Leads': 'Lead Generation',
      'Leads': 'Lead Generation',
      'Revenue Impact': 'Revenue Impact',
      'Revenue': 'Revenue Impact'
    }

    // Create a copy of the current metrics
    const updatedMetrics = [...metrics]

    // Update metrics with data from Airtable
    data.forEach(item => {
      const metricName = item.MetricName || item['Metric Name'] || ''
      const mappedTitle = metricMapping[metricName]

      if (mappedTitle) {
        const index = updatedMetrics.findIndex(m => m.title === mappedTitle)
        if (index !== -1) {
          const currentValue = item.CurrentValue || item['Current Value'] || 0
          const targetValue = item.Goal || item['Target Value'] || item.TargetValue || 0
          const unit = item.Unit || updatedMetrics[index].unit || ''
          const changePercentage = item.ChangePercentage || item['Delta/Change'] || 0
          const trend = (item.Trend || '').toLowerCase() === 'down' ? 'down' : 'up'

          // Calculate progress percentage
          let progress = 0
          if (targetValue > 0) {
            progress = Math.round((currentValue / targetValue) * 100)
          }

          // Format values based on unit
          let formattedValue = currentValue.toLocaleString()
          let formattedTarget = targetValue.toLocaleString()

          if (unit === '%') {
            formattedValue = `${currentValue}%`
            formattedTarget = `${targetValue}%`
          } else if (unit === '$') {
            formattedValue = `$${currentValue.toLocaleString()}`
            formattedTarget = `$${targetValue.toLocaleString()}`
          }

          // Update the metric
          updatedMetrics[index] = {
            ...updatedMetrics[index],
            value: formattedValue,
            target: formattedTarget,
            progress: progress,
            trend: trend,
            unit: unit
          }
        }
      }
    })

    setMetrics(updatedMetrics)
  }

  // Function to manually refresh data
  const refreshData = () => {
    fetchData(true)
  }

  // If there's an error, display it
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          onClick={refreshData}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className={`uniform-card ${loading ? 'opacity-60' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {!loading && (
              <div
                className={`flex items-center text-xs ${metric.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}
              >
                {metric.trend === "up" ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {metric.progress}%
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Target: {metric.target}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${loading ? 'bg-gray-300 animate-pulse' : 'bg-primary'}`}
                style={{ width: loading ? '30%' : `${metric.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
