"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function TrafficChart() {
  // Sample data - in a real app, this would come from your API
  const data = [
    { month: "Jan", actual: 4000, goal: 4500 },
    { month: "Feb", actual: 5000, goal: 5500 },
    { month: "Mar", actual: 7000, goal: 6500 },
    { month: "Apr", actual: 8500, goal: 8000 },
    { month: "May", actual: 10000, goal: 9500 },
    { month: "Jun", actual: 11000, goal: 11000 },
    { month: "Jul", actual: 12500, goal: 12500 },
    { month: "Aug", actual: 14000, goal: 14000 },
    { month: "Sep", actual: 15500, goal: 15500 },
    { month: "Oct", actual: 0, goal: 17000 },
    { month: "Nov", actual: 0, goal: 18500 },
    { month: "Dec", actual: 0, goal: 20000 },
  ]

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="goal" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
