"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { useEffect, useState } from "react"

interface ProjectionsTableProps {
  projectionsData?: any[]
}

export function ProjectionsTable({ projectionsData }: ProjectionsTableProps) {
  const [loading, setLoading] = useState(!projectionsData)
  const [projections, setProjections] = useState([
    {
      month: "Loading...",
      traffic: 0,
      conversionRate: "0%",
      leads: 0,
      revenue: "$0",
    }
  ])

  useEffect(() => {
    if (projectionsData && projectionsData.length > 0) {
      processProjectionsData(projectionsData)
      return
    }

    // If no data is provided, fetch it or use default data
    const fetchData = async () => {
      try {
        setLoading(true)
        // In a real implementation, we would fetch from Airtable here
        // For now, we'll use default data if no props are provided
        const defaultData = [
          {
            Month: "May",
            Year: "2025",
            "Current Trajectory": 15000,
            "KPI Goal/Target": 18000,
            "Required Trajectory": 16500
          },
          {
            Month: "June",
            Year: "2025",
            "Current Trajectory": 16500,
            "KPI Goal/Target": 19000,
            "Required Trajectory": 18000
          },
          {
            Month: "July",
            Year: "2025",
            "Current Trajectory": 18000,
            "KPI Goal/Target": 20000,
            "Required Trajectory": 19500
          },
          {
            Month: "August",
            Year: "2025",
            "Current Trajectory": 19500,
            "KPI Goal/Target": 21000,
            "Required Trajectory": 21000
          },
          {
            Month: "September",
            Year: "2025",
            "Current Trajectory": 21000,
            "KPI Goal/Target": 22000,
            "Required Trajectory": 22500
          },
          {
            Month: "October",
            Year: "2025",
            "Current Trajectory": 22500,
            "KPI Goal/Target": 23000,
            "Required Trajectory": 24000
          }
        ]
        processProjectionsData(defaultData)
      } catch (error) {
        console.error("Error fetching projections data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectionsData])

  const processProjectionsData = (data: any[]) => {
    // Transform the data into the format needed for the table
    const processedData = data.map(item => {
      // Get the traffic value
      const traffic = item["Current Trajectory"] || 0

      // Calculate conversion rate (assuming 3.5% base with slight increase each month)
      const baseConversionRate = 3.5
      const monthIndex = data.indexOf(item)
      const conversionRate = (baseConversionRate + (monthIndex * 0.1)).toFixed(1) + "%"

      // Calculate leads based on traffic and conversion rate
      const conversionRateValue = parseFloat(conversionRate) / 100
      const leads = Math.round(traffic * conversionRateValue)

      // Calculate revenue (assuming $60 per lead)
      const revenueValue = leads * 60
      const revenue = "$" + revenueValue.toLocaleString()

      // Format the month
      const month = `${item.Month} ${item.Year}`

      return {
        month,
        traffic,
        conversionRate,
        leads,
        revenue
      }
    })

    setProjections(processedData)
  }

  return (
    <div className={`rounded-md border overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">
              <Button variant="ghost" className="p-0 h-8 font-medium">
                Month
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <Button variant="ghost" className="p-0 h-8 font-medium">
                Traffic
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <Button variant="ghost" className="p-0 h-8 font-medium">
                Conv. Rate
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <Button variant="ghost" className="p-0 h-8 font-medium">
                Leads
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <Button variant="ghost" className="p-0 h-8 font-medium">
                Est. Revenue
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-primary animate-pulse mr-2"></div>
                  <span>Loading projections data...</span>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!loading && projections.map((projection) => (
            <TableRow key={projection.month}>
              <TableCell className="font-medium">{projection.month}</TableCell>
              <TableCell>{typeof projection.traffic === 'number' ? projection.traffic.toLocaleString() : projection.traffic}</TableCell>
              <TableCell>{projection.conversionRate}</TableCell>
              <TableCell>{typeof projection.leads === 'number' ? projection.leads.toLocaleString() : projection.leads}</TableCell>
              <TableCell>{projection.revenue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
