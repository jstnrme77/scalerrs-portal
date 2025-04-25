"use client"

import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { fetchKPIMetrics } from "@/lib/client-api"
import { KPIMetric } from "@/types"

interface KpiMetricsProps {
  metricsData?: any[]
}

export function KpiMetrics({ metricsData }: KpiMetricsProps) {
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

  useEffect(() => {
    // If metrics data is provided as props, use it
    if (metricsData && metricsData.length > 0) {
      processMetricsData(metricsData)
      return
    }

    // Otherwise fetch the data
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchKPIMetrics()
        processMetricsData(data)
      } catch (error) {
        console.error("Error fetching KPI metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [metricsData])

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
