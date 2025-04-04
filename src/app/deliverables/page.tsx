'use client';

import DashboardLayout from '@/components/DashboardLayout';

// Sample data for the dashboard
const seoMetrics = {
  briefsCreated: 12,
  pagesUploaded: 8,
  backlinksBuilt: 24,
  articlesProduced: 15,
};

// Sample backlinks data
const backlinks = [
  { id: 1, domain: 'example.com', da: 45, dr: 52, referringDomains: 120, status: 'Live' },
  { id: 2, domain: 'seosite.org', da: 38, dr: 41, referringDomains: 85, status: 'Live' },
  { id: 3, domain: 'marketingblog.com', da: 52, dr: 58, referringDomains: 210, status: 'Pending' },
  { id: 4, domain: 'digitaltrends.net', da: 61, dr: 67, referringDomains: 340, status: 'Live' },
  { id: 5, domain: 'techcrunch.com', da: 93, dr: 91, referringDomains: 12500, status: 'In Progress' },
];

// Sample articles data
const articles = [
  { id: 1, title: 'Top 10 SEO Strategies for SaaS Companies', keywords: 'saas seo, saas marketing', wordCount: 2500, status: 'Published' },
  { id: 2, title: 'How to Optimize Your SaaS Website for Conversions', keywords: 'saas conversion, website optimization', wordCount: 1800, status: 'Published' },
  { id: 3, title: 'The Ultimate Guide to Content Marketing for SaaS', keywords: 'saas content marketing, content strategy', wordCount: 3200, status: 'In Review' },
  { id: 4, title: 'SaaS SEO Case Study: How We Increased Organic Traffic by 300%', keywords: 'saas seo case study, organic traffic', wordCount: 2100, status: 'Draft' },
  { id: 5, title: 'Technical SEO Checklist for SaaS Platforms', keywords: 'technical seo, saas seo checklist', wordCount: 2800, status: 'Published' },
];

// Metric Card Component
function MetricCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white p-6 rounded-scalerrs shadow-sm border border-lightGray`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-dark">{title}</h3>
        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-dark">{value}</p>
    </div>
  );
}

export default function Deliverables() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Deliverables Overview</h1>
        <p className="text-mediumGray">Track your SEO campaign deliverables and performance metrics</p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Briefs Created" 
          value={seoMetrics.briefsCreated} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          } 
          color="bg-primary" 
        />
        
        <MetricCard 
          title="Pages Uploaded" 
          value={seoMetrics.pagesUploaded} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          } 
          color="bg-gold" 
        />
        
        <MetricCard 
          title="Backlinks Built" 
          value={seoMetrics.backlinksBuilt} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          } 
          color="bg-lavender" 
        />
        
        <MetricCard 
          title="Articles Produced" 
          value={seoMetrics.articlesProduced} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          } 
          color="bg-primary" 
        />
      </div>

      {/* Backlinks Table */}
      <div className="bg-white p-6 rounded-scalerrs shadow-sm border border-lightGray mb-8">
        <h2 className="text-xl font-semibold text-dark mb-4">Backlinks</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lightGray">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">DA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">DR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Referring Domains</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-lightGray">
              {backlinks.map((link) => (
                <tr key={link.id} className="hover:bg-lightGray">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">{link.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{link.da}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{link.dr}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{link.referringDomains}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${link.status === 'Live' ? 'bg-green-100 text-green-800' : 
                        link.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {link.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white p-6 rounded-scalerrs shadow-sm border border-lightGray">
        <h2 className="text-xl font-semibold text-dark mb-4">Content Articles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lightGray">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Keywords</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Word Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-lightGray">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-lightGray">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">{article.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{article.keywords}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{article.wordCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${article.status === 'Published' ? 'bg-green-100 text-green-800' : 
                        article.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {article.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
