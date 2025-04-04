"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function ConversionChart() {
  // Sample data - in a real app, this would come from your API
  const data = [
    { month: "Jan", actual: 2.1, target: 2.5 },
    { month: "Feb", actual: 2.3, target: 2.7 },
    { month: "Mar", actual: 2.6, target: 3.0 },
    { month: "Apr", actual: 2.9, target: 3.2 },
    { month: "May", actual: 3.2, target: 3.5 },
    { month: "Jun", actual: 3.4, target: 3.7 },
    { month: "Jul", actual: 3.6, target: 4.0 },
    { month: "Aug", actual: 0, target: 4.0 },
    { month: "Sep", actual: 0, target: 4.0 },
  ]

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar dataKey="actual" name="Actual Rate" fill="#8884d8" />
          <Bar dataKey="target" name="Target Rate" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
