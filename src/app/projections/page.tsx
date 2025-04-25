'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { ProjectionsTable } from '@/components/kpi/projections-table'
import { fetchMonthlyProjections } from '@/lib/client-api'
import { useState, useEffect } from 'react'

export default function ProjectionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthlyProjections, setMonthlyProjections] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching monthly projections data...')
        const data = await fetchMonthlyProjections()
        console.log('Monthly projections data fetched:', data)
        
        setMonthlyProjections(data)
      } catch (err: any) {
        console.error('Error fetching monthly projections:', err)
        setError(err.message || 'Failed to fetch monthly projections')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Monthly Projections</h1>
        <p className="text-mediumGray">View and analyze monthly traffic and conversion projections</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-mediumGray">Loading projections data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <div className="flex items-start">
            <div className="mr-2">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Monthly Projections</h2>
            <ProjectionsTable projectionsData={monthlyProjections} />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
