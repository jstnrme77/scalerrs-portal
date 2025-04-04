import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ProjectionsTable() {
  const projections = [
    {
      month: "May 2025",
      traffic: 15000,
      conversionRate: "3.5%",
      leads: 525,
      revenue: "$31,500",
    },
    {
      month: "June 2025",
      traffic: 16500,
      conversionRate: "3.6%",
      leads: 594,
      revenue: "$35,640",
    },
    {
      month: "July 2025",
      traffic: 18000,
      conversionRate: "3.7%",
      leads: 666,
      revenue: "$39,960",
    },
    {
      month: "August 2025",
      traffic: 19500,
      conversionRate: "3.8%",
      leads: 741,
      revenue: "$44,460",
    },
    {
      month: "September 2025",
      traffic: 21000,
      conversionRate: "3.9%",
      leads: 819,
      revenue: "$49,140",
    },
    {
      month: "October 2025",
      traffic: 22500,
      conversionRate: "4.0%",
      leads: 900,
      revenue: "$54,000",
    },
  ]

  return (
    <div className="rounded-md border overflow-x-auto">
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
          {projections.map((projection) => (
            <TableRow key={projection.month}>
              <TableCell className="font-medium">{projection.month}</TableCell>
              <TableCell>{projection.traffic.toLocaleString()}</TableCell>
              <TableCell>{projection.conversionRate}</TableCell>
              <TableCell>{projection.leads.toLocaleString()}</TableCell>
              <TableCell>{projection.revenue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
