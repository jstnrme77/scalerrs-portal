'use client'

import { useState, useEffect } from 'react'
import { fetchMonthlyProjections } from '@/lib/client-api'
import { MonthlyProjection } from '@/types'

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let bgColor = ''
  let textColor = ''

  switch (status) {
    case 'On Track':
      bgColor = 'bg-green-100'
      textColor = 'text-green-800'
      break
    case 'At Risk':
      bgColor = 'bg-amber-100'
      textColor = 'text-amber-800'
      break
    case 'Off Track':
      bgColor = 'bg-red-100'
      textColor = 'text-red-800'
      break
    default:
      bgColor = 'bg-lightGray'
      textColor = 'text-mediumGray'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  )
}

export default function MonthlyProjectionsBoard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projections, setProjections] = useState<MonthlyProjection[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching monthly projections data...')
        const data = await fetchMonthlyProjections()
        console.log('Monthly projections data fetched:', data)
        
        setProjections(data)
      } catch (err: any) {
        console.error('Error fetching monthly projections:', err)
        setError(err.message || 'Failed to fetch monthly projections')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate status for each projection
  const getStatus = (current: number, target: number): string => {
    const percentage = (current / target) * 100
    if (percentage >= 90) return 'On Track'
    if (percentage >= 70) return 'At Risk'
    return 'Off Track'
  }

  // Calculate gap to close
  const getGap = (current: number, target: number): number => {
    return Math.round(((target - current) / target) * 100)
  }

  return (
    <div className="card bg-white rounded-scalerrs border border-lightGray overflow-hidden" style={{ color: '#353233' }}>
      {/* Summary header */}
      <div className="bg-lightGray p-3 border-b border-lightGray">
        <p className="text-sm font-medium text-text-light dark:text-text-dark">
          Monthly Traffic Projections
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-700">
          <p>{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-lightGray/50 border-b border-lightGray">
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray dark:text-gray-300 uppercase tracking-wider">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray dark:text-gray-300 uppercase tracking-wider">Current Trajectory</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray dark:text-gray-300 uppercase tracking-wider">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray dark:text-gray-300 uppercase tracking-wider">Required Trajectory</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray dark:text-gray-300 uppercase tracking-wider">Gap to Close</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightGray">
              {projections.length > 0 ? (
                projections.map((projection, index) => {
                  const current = projection['Current Trajectory'] || 0
                  const target = projection['KPI Goal/Target'] || 0
                  const required = projection['Required Trajectory'] || 0
                  const status = getStatus(current, target)
                  const gap = getGap(current, target)
                  
                  return (
                    <tr key={index} className="hover:bg-lightGray/20">
                      <td className="px-4 py-3 text-sm text-text-light dark:text-text-dark">
                        {projection.Month} {projection.Year}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-light dark:text-text-dark">
                        {current.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-light dark:text-text-dark">
                        {target.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-light dark:text-text-dark">
                        {required.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-light dark:text-text-dark">
                        {gap}%
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-mediumGray">
                    No projections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
