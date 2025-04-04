'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { TrafficChart } from '@/components/kpi/traffic-chart';
import { ConversionChart } from '@/components/kpi/conversion-chart';
import { ProjectionsTable } from '@/components/kpi/projections-table';

// Enhanced KPI data with more realistic values
const kpiData = {
  trafficGoals: {
    current: 12543,
    target: 15000,
    monthlyTargets: [48000, 52000, 58000, 65000, 70000, 75000],
    previousPeriod: [42000, 43500, 44800, 45200, 45500],
    growth: '+7.2%'
  },
  conversionRate: {
    current: 3.2,
    target: 4.0,
    monthlyTargets: [3.0, 3.2, 3.5, 3.7, 3.9, 4.0],
    previousPeriod: [2.4, 2.5, 2.6, 2.7, 2.8],
    growth: '+16.7%'
  },
  leads: {
    current: 187,
    target: 250,
    monthlyTargets: [350, 450, 550, 650, 700, 750],
    previousPeriod: [280, 290, 300, 310, 320],
    growth: '+14.3%'
  },
  revenue: {
    current: 24800,
    target: 30000,
    monthlyTargets: [140000, 160000, 180000, 200000, 225000, 250000],
    previousPeriod: [110000, 115000, 118000, 122000, 125000],
    growth: '+13.6%'
  }
};

// Progress bar component
function ProgressBar({ value, max, color = "bg-blue-500" }: { value: number; max: number; color?: string }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

// KPI Card Component
function KpiCard({ 
  title, 
  current, 
  target, 
  unit, 
  percentage,
  color
}: { 
  title: string; 
  current: number | string; 
  target: number | string; 
  unit: string; 
  percentage: number;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-lightGray dark:bg-darkGray dark:border-gray-700">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium text-dark dark:text-white">{title}</h3>
        <span className="text-xs text-green-500">↑ {percentage}%</span>
      </div>
      <div className="text-2xl font-bold text-dark dark:text-white mb-2">
        {typeof current === 'number' && unit === '$' ? `$${current.toLocaleString()}` : current}
        {typeof current === 'number' && unit === '%' ? `${current}%` : ''}
        {typeof current === 'number' && unit === '' ? current.toLocaleString() : ''}
      </div>
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Target: {typeof target === 'number' && unit === '$' ? `$${target.toLocaleString()}` : target}
        {typeof target === 'number' && unit === '%' ? `${target}%` : ''}
        {typeof target === 'number' && unit === '' ? target.toLocaleString() : ''}
      </div>
      <ProgressBar value={typeof current === 'number' ? current : 0} max={typeof target === 'number' ? target : 100} color={color} />
    </div>
  );
}

function KpiDashboard() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('traffic');
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">KPI Dashboard</h1>
        <p className="text-mediumGray dark:text-gray-400">Track your performance against key metrics and goals</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Organic Traffic" 
          current={kpiData.trafficGoals.current} 
          target={kpiData.trafficGoals.target} 
          unit="" 
          percentage={83}
          color="bg-blue-500" 
        />
        
        <KpiCard 
          title="Conversion Rate" 
          current={kpiData.conversionRate.current} 
          target={kpiData.conversionRate.target} 
          unit="%" 
          percentage={80}
          color="bg-blue-500" 
        />
        
        <KpiCard 
          title="Lead Generation" 
          current={kpiData.leads.current} 
          target={kpiData.leads.target} 
          unit="" 
          percentage={75}
          color="bg-blue-500" 
        />
        
        <KpiCard 
          title="Revenue Impact" 
          current={kpiData.revenue.current} 
          target={kpiData.revenue.target} 
          unit="$" 
          percentage={83}
          color="bg-blue-500" 
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'traffic' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('traffic')}
        >
          Traffic
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'conversions' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('conversions')}
        >
          Conversions
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'projections' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('projections')}
        >
          Projections
        </button>
      </div>

      {/* Traffic Tab */}
      {activeTab === 'traffic' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-lightGray dark:bg-darkGray dark:border-gray-700">
          <h2 className="text-xl font-bold text-dark dark:text-white mb-4">Traffic Goals & Performance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Monthly traffic trends compared to goals</p>
          <div className="h-[400px]">
            <TrafficChart />
          </div>
        </div>
      )}

      {/* Conversions Tab */}
      {activeTab === 'conversions' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-lightGray dark:bg-darkGray dark:border-gray-700">
          <h2 className="text-xl font-bold text-dark dark:text-white mb-4">Conversion Rate Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Monthly conversion rates compared to targets</p>
          <div className="h-[400px]">
            <ConversionChart />
          </div>
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-lightGray dark:bg-darkGray dark:border-gray-700">
          <h2 className="text-xl font-bold text-dark dark:text-white mb-4">Future Projections</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Estimated performance for upcoming months</p>
          <ProjectionsTable />
        </div>
      )}
    </DashboardLayout>
  );
}

export default KpiDashboard;
