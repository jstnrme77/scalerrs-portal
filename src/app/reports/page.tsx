'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

// Sample report data
const reports = {
  weekly: [
    { id: 1, title: 'Weekly SEO Update - Apr 1, 2025', date: '2025-04-01', type: 'weekly' },
    { id: 2, title: 'Weekly SEO Update - Mar 25, 2025', date: '2025-03-25', type: 'weekly' },
    { id: 3, title: 'Weekly SEO Update - Mar 18, 2025', date: '2025-03-18', type: 'weekly' },
    { id: 4, title: 'Weekly SEO Update - Mar 11, 2025', date: '2025-03-11', type: 'weekly' },
  ],
  monthly: [
    { id: 5, title: 'March 2025 SEO Performance Report', date: '2025-04-01', type: 'monthly' },
    { id: 6, title: 'February 2025 SEO Performance Report', date: '2025-03-01', type: 'monthly' },
    { id: 7, title: 'January 2025 SEO Performance Report', date: '2025-02-01', type: 'monthly' },
  ],
  quarterly: [
    { id: 8, title: 'Q1 2025 SEO Strategy & Performance Review', date: '2025-04-01', type: 'quarterly' },
    { id: 9, title: 'Q4 2024 SEO Strategy & Performance Review', date: '2025-01-01', type: 'quarterly' },
  ]
};

// Sample report content for demonstration
const sampleReportContent = {
  weekly: (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-dark">Weekly SEO Update - Apr 1, 2025</h3>
      
      <div className="space-y-2">
        <h4 className="font-medium text-dark">Key Metrics This Week</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Organic Traffic: 11,245 users (+5% week-over-week)</li>
          <li>Keyword Rankings: 324 keywords in top 10 (+12 new keywords)</li>
          <li>Conversion Rate: 2.8% (+0.2% week-over-week)</li>
          <li>Leads Generated: 78 (+8% week-over-week)</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-dark">Content Updates</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Published 3 new blog posts targeting high-intent keywords</li>
          <li>Updated 2 existing pages with fresh content and improved CTAs</li>
          <li>Created 5 new content briefs for upcoming articles</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-dark">Link Building Progress</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Secured 4 new backlinks from DA 40+ websites</li>
          <li>Initiated outreach to 15 potential link partners</li>
          <li>Completed 3 guest post drafts for submission</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-dark">Technical SEO Updates</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Fixed 12 broken internal links</li>
          <li>Improved page load speed on 5 key landing pages</li>
          <li>Implemented schema markup on product pages</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-dark">Next Week's Focus</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Complete technical SEO audit for the new product section</li>
          <li>Publish 2 new case studies targeting competitive keywords</li>
          <li>Finalize content calendar for Q2 2025</li>
        </ul>
      </div>
    </div>
  ),
  monthly: (
    <div className="space-y-6">
      <div className="bg-lightGray p-4 rounded-scalerrs">
        <h3 className="text-lg font-medium text-dark mb-2">March 2025 SEO Performance Report</h3>
        <p className="text-mediumGray">Monthly comprehensive analysis of your SEO campaign performance, achievements, and strategic recommendations.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-2">Organic Traffic</h4>
          <p className="text-3xl font-bold text-primary">45.5K</p>
          <p className="text-sm text-green-600">+12.3% vs. February</p>
        </div>
        
        <div className="bg-white p-4 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-2">Keyword Rankings</h4>
          <p className="text-3xl font-bold text-gold">324</p>
          <p className="text-sm text-green-600">+28 new keywords in top 10</p>
        </div>
        
        <div className="bg-white p-4 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-2">Leads Generated</h4>
          <p className="text-3xl font-bold text-lavender">320</p>
          <p className="text-sm text-green-600">+15.2% vs. February</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium text-dark">Monthly Highlights</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Successfully launched new product category pages with optimized content</li>
          <li>Achieved first page rankings for 12 high-value keywords</li>
          <li>Improved site-wide page load speed by 22%</li>
          <li>Secured 15 high-quality backlinks from industry publications</li>
          <li>Published 12 new blog posts targeting strategic keywords</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium text-dark">Areas for Improvement</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Mobile conversion rate still lags behind desktop by 1.2%</li>
          <li>Bounce rate on product comparison pages remains high at 65%</li>
          <li>Need to improve internal linking structure for deeper pages</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium text-dark">Next Month's Strategy</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Focus on mobile UX improvements to increase conversion rate</li>
          <li>Implement A/B testing on high-bounce product comparison pages</li>
          <li>Develop comprehensive internal linking strategy</li>
          <li>Expand content creation for middle-of-funnel keywords</li>
          <li>Increase link building efforts targeting competitor backlink gaps</li>
        </ul>
      </div>
      
      <div className="bg-primary/10 p-4 rounded-scalerrs">
        <h4 className="font-medium text-dark mb-2">Strategic Recommendations</h4>
        <p className="text-mediumGray">Based on our analysis, we recommend allocating additional resources to mobile UX optimization and middle-of-funnel content creation to capitalize on the growing traffic and improve conversion rates.</p>
      </div>
    </div>
  ),
  quarterly: (
    <div className="space-y-6">
      <div className="bg-primary/20 p-6 rounded-scalerrs-lg">
        <h3 className="text-xl font-bold text-dark mb-2">Q1 2025 SEO Strategy & Performance Review</h3>
        <p className="text-mediumGray">Comprehensive quarterly analysis of your SEO campaign performance, strategic achievements, and recommendations for Q2 2025.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-3">Q1 Performance Summary</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Organic Traffic</span>
                <span className="text-sm font-medium text-dark">45.5K (+32.4% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Keyword Rankings</span>
                <span className="text-sm font-medium text-dark">324 (+86 QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-gold h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Conversion Rate</span>
                <span className="text-sm font-medium text-dark">2.8% (+0.6% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-lavender h-1.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Leads Generated</span>
                <span className="text-sm font-medium text-dark">950 (+42.3% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Revenue Impact</span>
                <span className="text-sm font-medium text-dark">$125K (+38.2% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-gold h-1.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-3">Q1 Strategic Achievements</h4>
          <ul className="list-disc pl-5 text-mediumGray space-y-2">
            <li>Completed full technical SEO audit and implemented 85% of recommendations</li>
            <li>Launched new content hub targeting high-value industry topics</li>
            <li>Secured 45 high-quality backlinks from industry publications</li>
            <li>Improved site-wide page load speed by 35%</li>
            <li>Implemented structured data across all product and service pages</li>
            <li>Developed comprehensive competitor gap analysis</li>
            <li>Optimized conversion funnels resulting in 0.6% CR improvement</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Competitive Analysis</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lightGray">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Competitor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Traffic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Keywords</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Backlinks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Content</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-lightGray">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark">Your Company</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">45.5K</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">324</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">1,245</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">86 pages</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark">Competitor A</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">62.3K</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">412</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">2,156</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">124 pages</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark">Competitor B</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">38.7K</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">286</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">985</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">72 pages</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Q2 2025 Strategic Recommendations</h4>
        <div className="space-y-4">
          <div className="p-3 bg-primary/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Content Gap Opportunity</h5>
            <p className="text-sm text-mediumGray">Develop 15 new in-depth guides targeting competitor content gaps in the middle and bottom of the funnel.</p>
          </div>
          
          <div className="p-3 bg-gold/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Technical SEO Enhancement</h5>
            <p className="text-sm text-mediumGray">Implement advanced schema markup and improve Core Web Vitals scores across all key landing pages.</p>
          </div>
          
          <div className="p-3 bg-lavender/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Conversion Rate Optimization</h5>
            <p className="text-sm text-mediumGray">Conduct comprehensive A/B testing on top landing pages to improve conversion rates by at least 0.5%.</p>
          </div>
          
          <div className="p-3 bg-primary/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Link Building Strategy</h5>
            <p className="text-sm text-mediumGray">Focus on acquiring 50+ high-quality backlinks from industry publications and partner websites.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-primary/20 p-5 rounded-scalerrs">
        <h4 className="font-medium text-dark mb-2">Additional Service Recommendations</h4>
        <p className="text-mediumGray mb-3">Based on our analysis, we recommend the following additional services to accelerate your growth:</p>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Conversion Rate Optimization (CRO) package to improve lead generation</li>
          <li>Expanded content creation to target competitive keywords</li>
          <li>Advanced competitor analysis and monitoring</li>
        </ul>
      </div>
    </div>
  )
};

// Report Card Component
function ReportCard({ report, onClick }: { report: any; onClick: () => void }) {
  return (
    <div 
      className="bg-white p-4 rounded-scalerrs border border-lightGray hover:border-primary cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-md font-medium text-dark">{report.title}</h3>
          <p className="text-sm text-mediumGray">{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          report.type === 'weekly' ? 'bg-primary/10 text-primary' : 
          report.type === 'monthly' ? 'bg-gold/10 text-gold' : 
          'bg-lavender/10 text-lavender'
        }`}>
          {report.type === 'weekly' ? 'Weekly' : report.type === 'monthly' ? 'Monthly' : 'Quarterly'}
        </span>
      </div>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const handleReportClick = (type: string) => {
    setSelectedReport(type);
  };
  
  const handleBackClick = () => {
    setSelectedReport(null);
  };

  return (
    <DashboardLayout>
      {selectedReport ? (
        <div>
          <button 
            onClick={handleBackClick}
            className="flex items-center text-primary mb-6 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </button>
          
          <div className="bg-white p-6 rounded-scalerrs shadow-sm border border-lightGray">
            {sampleReportContent[selectedReport as keyof typeof sampleReportContent]}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark">Reports</h1>
            <p className="text-mediumGray">Access your weekly, monthly, and quarterly SEO performance reports</p>
          </div>
          
          <div className="bg-white rounded-scalerrs shadow-sm border border-lightGray mb-8">
            <div className="flex border-b border-lightGray">
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'weekly' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                onClick={() => setActiveTab('weekly')}
              >
                Weekly Reports
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'monthly' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly Reports
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'quarterly' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                onClick={() => setActiveTab('quarterly')}
              >
                Quarterly Reports
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {reports[activeTab as keyof typeof reports].map((report) => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onClick={() => handleReportClick(report.type)} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-lightGray p-4 rounded-scalerrs">
            <p className="text-sm text-mediumGray">
              <strong>Note:</strong> Weekly reports are based on current Slack updates. Monthly and quarterly reports follow a more detailed format with comprehensive analysis and recommendations.
            </p>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
