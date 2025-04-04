import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiMetrics() {
  const metrics = [
    {
      title: "Organic Traffic",
      value: "12,543",
      target: "15,000",
      progress: 83,
      trend: "up",
      description: "vs. target",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      target: "4.0%",
      progress: 80,
      trend: "up",
      description: "vs. target",
    },
    {
      title: "Lead Generation",
      value: "187",
      target: "250",
      progress: 75,
      trend: "up",
      description: "vs. target",
    },
    {
      title: "Revenue Impact",
      value: "$24,800",
      target: "$30,000",
      progress: 83,
      trend: "up",
      description: "estimated",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="uniform-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Target: {metric.target}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${metric.progress}%` }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
