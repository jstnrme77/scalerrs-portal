"use client"

import { KpiMetrics } from "@/components/kpi/kpi-metrics"
import { TrafficChart } from "@/components/kpi/traffic-chart"
import { ConversionChart } from "@/components/kpi/conversion-chart"
import { ProjectionsTable } from "@/components/kpi/projections-table"
import { fetchKPIMetrics, fetchMonthlyProjections } from "@/lib/client-api"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [kpiMetrics, setKpiMetrics] = useState<any[]>([])
  const [monthlyProjections, setMonthlyProjections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch KPI metrics
        const metricsData = await fetchKPIMetrics()
        setKpiMetrics(metricsData)

        // Fetch monthly projections
        const projectionsData = await fetchMonthlyProjections()
        setMonthlyProjections(projectionsData)
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Marketing Performance Dashboard</h1>
        <p className="text-muted-foreground">
          Track your key marketing metrics and performance indicators
        </p>
      </div>

      {/* KPI Metrics Cards */}
      <div className="pt-4">
        <KpiMetrics metricsData={kpiMetrics} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Traffic Performance</h2>
          <TrafficChart />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Conversion Rate</h2>
          <ConversionChart />
        </div>
      </div>

      {/* Projections Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Future Projections</h2>
        <ProjectionsTable projectionsData={monthlyProjections} />
      </div>
    </div>
  )
}
