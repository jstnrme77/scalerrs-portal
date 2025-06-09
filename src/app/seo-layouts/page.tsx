'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Filter, Download, Search, Link2, PenTool, ClipboardCheck, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Sample uplift potential data
const upliftData = [
  {
    id: 1,
    mainKw: 'seo strategy guide',
    targetUrl: '/blog/seo-strategy-2024',
    publicationStatus: 'Published',
    pageTypeMain: 'Blog',
    pageTypeSub: 'How-to',
    targetKwScore: 85,
    mainKwPosition: 8,
    clicksLastMonth: 1250,
    potentialClickUplift: 2550,
    potentialUpliftSignups: 76,
    linkBuildingStatus: 'In Progress',
    contentStatus: 'Refresh'
  },
  {
    id: 2,
    mainKw: 'technical seo services',
    targetUrl: '/services/technical-seo',
    publicationStatus: 'Published',
    pageTypeMain: 'Service',
    pageTypeSub: 'Core',
    targetKwScore: 92,
    mainKwPosition: 12,
    clicksLastMonth: 850,
    potentialClickUplift: 1250,
    potentialUpliftSignups: 37,
    linkBuildingStatus: 'Planned',
    contentStatus: 'Refresh'
  },
  {
    id: 3,
    mainKw: 'ecommerce seo case study',
    targetUrl: '/case-studies/ecommerce-seo',
    publicationStatus: 'Published',
    pageTypeMain: 'Case Study',
    pageTypeSub: 'Industry',
    targetKwScore: 78,
    mainKwPosition: 6,
    clicksLastMonth: 1450,
    potentialClickUplift: 1350,
    potentialUpliftSignups: 40,
    linkBuildingStatus: 'Active',
    contentStatus: 'New'
  },
  {
    id: 4,
    mainKw: 'local seo guide',
    targetUrl: '/blog/local-seo-guide',
    publicationStatus: 'Draft',
    pageTypeMain: 'Blog',
    pageTypeSub: 'Guide',
    targetKwScore: 88,
    mainKwPosition: 15,
    clicksLastMonth: 720,
    potentialClickUplift: 3780,
    potentialUpliftSignups: 113,
    linkBuildingStatus: 'Not Started',
    contentStatus: 'New'
  },
  {
    id: 5,
    mainKw: 'content marketing services',
    targetUrl: '/services/content-marketing',
    publicationStatus: 'Published',
    pageTypeMain: 'Service',
    pageTypeSub: 'Core',
    targetKwScore: 90,
    mainKwPosition: 9,
    clicksLastMonth: 980,
    potentialClickUplift: 870,
    potentialUpliftSignups: 26,
    linkBuildingStatus: 'Active',
    contentStatus: 'Refresh'
  },
];

// Sample internal link map data
const internalLinkData = [
  {
    id: 1,
    mainKw: 'seo strategy guide',
    targetUrl: '/blog/seo-strategy-2024',
    publicationStatus: 'Published',
    pageType: 'Blog',
    targetKwScore: 85,
    cluster: 'SEO Strategy',
    secondaryAnchorText: 'comprehensive SEO strategy, SEO planning, strategic SEO',
    internalLinkRemapStatus: 'Complete',
  },
  {
    id: 2,
    mainKw: 'technical seo services',
    targetUrl: '/services/technical-seo',
    publicationStatus: 'Published',
    pageType: 'Service',
    targetKwScore: 92,
    cluster: 'Technical SEO',
    secondaryAnchorText: 'technical SEO help, SEO technical audit, site structure optimization',
    internalLinkRemapStatus: 'In Progress',
  },
  {
    id: 3,
    mainKw: 'ecommerce seo case study',
    targetUrl: '/case-studies/ecommerce-seo',
    publicationStatus: 'Published',
    pageType: 'Case Study',
    targetKwScore: 78,
    cluster: 'E-commerce SEO',
    secondaryAnchorText: 'e-commerce SEO results, online store optimization, e-commerce search rankings',
    internalLinkRemapStatus: 'Complete',
  },
  {
    id: 4,
    mainKw: 'local seo guide',
    targetUrl: '/blog/local-seo-guide',
    publicationStatus: 'Draft',
    pageType: 'Blog',
    targetKwScore: 88,
    cluster: 'Local SEO',
    secondaryAnchorText: 'local search optimization, Google Business Profile SEO, local ranking factors',
    internalLinkRemapStatus: 'Not Started',
  },
  {
    id: 5,
    mainKw: 'content marketing services',
    targetUrl: '/services/content-marketing',
    publicationStatus: 'Published',
    pageType: 'Service',
    targetKwScore: 90,
    cluster: 'Content Marketing',
    secondaryAnchorText: 'content strategy services, content creation help, professional content marketing',
    internalLinkRemapStatus: 'In Progress',
  },
];

// Sample link building targets data
const linkBuildingData = [
  {
    id: 1,
    mainKw: 'seo strategy guide',
    targetUrl: '/blog/seo-strategy-2024',
    publicationStatus: 'Published',
    pageTypeMain: 'Blog',
    pageTypeSub: 'How-to',
    mainKwPosition: 8,
    clicksLastMonth: 1250,
    potentialClickUplift: 2550,
    potentialUpliftSignups: 76,
    linkBuildingStatus: 'In Progress',
    actualRdsNeeded: 15,
    startingRds: 8,
    month: 'May 2025',
  },
  {
    id: 2,
    mainKw: 'technical seo services',
    targetUrl: '/services/technical-seo',
    publicationStatus: 'Published',
    pageTypeMain: 'Service',
    pageTypeSub: 'Core',
    mainKwPosition: 12,
    clicksLastMonth: 850,
    potentialClickUplift: 1250,
    potentialUpliftSignups: 37,
    linkBuildingStatus: 'Planned',
    actualRdsNeeded: 20,
    startingRds: 12,
    month: 'June 2025',
  },
  {
    id: 3,
    mainKw: 'ecommerce seo case study',
    targetUrl: '/case-studies/ecommerce-seo',
    publicationStatus: 'Published',
    pageTypeMain: 'Case Study',
    pageTypeSub: 'Industry',
    mainKwPosition: 6,
    clicksLastMonth: 1450,
    potentialClickUplift: 1350,
    potentialUpliftSignups: 40,
    linkBuildingStatus: 'Active',
    actualRdsNeeded: 10,
    startingRds: 5,
    month: 'May 2025',
  },
  {
    id: 4,
    mainKw: 'local seo guide',
    targetUrl: '/blog/local-seo-guide',
    publicationStatus: 'Draft',
    pageTypeMain: 'Blog',
    pageTypeSub: 'Guide',
    mainKwPosition: 15,
    clicksLastMonth: 720,
    potentialClickUplift: 3780,
    potentialUpliftSignups: 113,
    linkBuildingStatus: 'Not Started',
    actualRdsNeeded: 25,
    startingRds: 3,
    month: 'July 2025',
  },
  {
    id: 5,
    mainKw: 'content marketing services',
    targetUrl: '/services/content-marketing',
    publicationStatus: 'Published',
    pageTypeMain: 'Service',
    pageTypeSub: 'Core',
    mainKwPosition: 9,
    clicksLastMonth: 980,
    potentialClickUplift: 870,
    potentialUpliftSignups: 26,
    linkBuildingStatus: 'Active',
    actualRdsNeeded: 12,
    startingRds: 7,
    month: 'May 2025',
  },
];

// Define types for DataTable props
interface DataTableRow {
  id: number;
  [key: string]: any;
}

interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: DataTableRow) => React.ReactNode;
}

interface DataTableProps {
  data: DataTableRow[];
  columns: DataTableColumn[];
  filterOptions?: Record<string, { label: string; options: { value: string; label: string }[] }>;
  searchPlaceholder?: string;
}

// Custom table component with filtering and sorting
function DataTable({
  data,
  columns,
  filterOptions = {},
  searchPlaceholder = "Search..."
}: DataTableProps) {
  const [filteredData, setFilteredData] = useState(data);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize data when component mounts or data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  // Handle filtering
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };

    if (value === 'all') {
      delete newFilters[key];
    }

    setFilters(newFilters);

    // Apply all active filters and search
    applyFiltersAndSearch(newFilters, searchQuery);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(filters, query);
  };

  // Apply filters and search to data
  const applyFiltersAndSearch = (activeFilters: Record<string, string>, query: string) => {
    let result = [...data];

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => String(item[key]) === value);
      }
    });

    // Apply search
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(item =>
        columns.some(column =>
          String(item[column.key]).toLowerCase().includes(lowercaseQuery)
        )
      );
    }

    // Apply current sort if exists
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(result);
  };

  return (
    <div className="space-y-4">
      <div className="w-full md:w-80 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-10 h-10 rounded-md w-full"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md overflow-hidden">
        <Table className="w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((column) => {
                // Add specific width classes based on column type
                const widthClass =
                  column.key === 'mainKw' ? 'w-[25%]' :
                  column.key === 'targetUrl' ? 'w-[20%]' :
                  column.key === 'publicationStatus' ? 'w-[15%]' :
                  column.key === 'documentLink' ? 'w-[10%]' : '';

                return (
                  <TableHead
                    key={column.key}
                    className={`font-semibold ${widthClass}`}
                  >
                    {column.sortable ? (
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort(column.key)}>
                        {column.header}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4 text-gray-500">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.id}-${column.key}`}
                      className={column.key === 'mainKw' ? "font-medium" : ""}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Removed unused cluster data as per requirements

// Status badge helper
const renderStatusBadge = (status: string) => {
  const statusColors: Record<string, string> = {
    Published: 'bg-green-100 text-green-800',
    Draft: 'bg-yellow-100 text-yellow-800',
    Planned: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-indigo-100 text-indigo-800',
    Active: 'bg-purple-100 text-purple-800',
    'Not Started': 'bg-gray-100 text-gray-800',
    New: 'bg-emerald-100 text-emerald-800',
    Refresh: 'bg-amber-100 text-amber-800',
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-orange-100 text-orange-800',
    Low: 'bg-blue-100 text-blue-800',
  };

  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{status}</span>;
};

export default function SEOLayoutsPage() {
  const [activeTab, setActiveTab] = useState('uplift');

  // State for custom ad-hoc views
  const [customViews] = useState<{id: string, label: string}[]>([
    // Example custom view - in a real app, these would be loaded from a backend
    { id: 'product-prune', label: 'Product Prune' }
  ]);

  // Uplift potential columns
  const upliftColumns = [
    { key: 'mainKw', header: 'Main KW', sortable: true },
    { key: 'targetUrl', header: 'Target Page URL', sortable: true },
    {
      key: 'publicationStatus',
      header: 'Publication Status',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
    { key: 'pageTypeMain', header: 'Page Type - Main', sortable: true },
    { key: 'pageTypeSub', header: 'Page Type - Sub', sortable: true },
    { key: 'targetKwScore', header: 'Target KW Score', sortable: true },
    { key: 'mainKwPosition', header: 'Main KW Position', sortable: true },
    { key: 'clicksLastMonth', header: 'Clicks Last Month', sortable: true },
    {
      key: 'potentialClickUplift',
      header: 'Potential Click Uplift Gap',
      sortable: true,
      render: (value: number) => <span className="text-green-600 font-medium">+{value}</span>
    },
    {
      key: 'potentialUpliftSignups',
      header: 'Potential Uplifts in Signups',
      sortable: true,
      render: (value: number) => <span className="text-green-600 font-medium">+{value}</span>
    },
    {
      key: 'linkBuildingStatus',
      header: 'Link Building Status',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
    {
      key: 'contentStatus',
      header: 'New/Refresh',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
    {
      key: 'contentStatus',
      header: 'KW / Content Status',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
  ];

  // Internal link map columns
  const internalLinkColumns = [
    { key: 'mainKw', header: 'Main KW', sortable: true },
    { key: 'targetUrl', header: 'Target Page URL', sortable: true },
    {
      key: 'publicationStatus',
      header: 'Publication Status',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
    { key: 'pageType', header: 'Page Type', sortable: true },
    { key: 'targetKwScore', header: 'Target KW Score', sortable: true },
    { key: 'cluster', header: 'Cluster', sortable: true },
    {
      key: 'secondaryAnchorText',
      header: 'Secondary Anchor Text',
      sortable: false,
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'internalLinkRemapStatus',
      header: 'Internal Link Remap Status',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
  ];

  // Link building targets columns
  const linkBuildingColumns = [
    { key: 'mainKw', header: 'Main KW', sortable: true },
    { key: 'targetUrl', header: 'Target Page URL', sortable: true },
    {
      key: 'publicationStatus',
      header: 'Publication Status',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
    { key: 'pageTypeMain', header: 'Page Type - Main', sortable: true },
    { key: 'pageTypeSub', header: 'Page Type - Sub', sortable: true },
    { key: 'mainKwPosition', header: 'Main KW Position', sortable: true },
    { key: 'clicksLastMonth', header: 'Clicks Last Month', sortable: true },
    {
      key: 'potentialClickUplift',
      header: 'Potential Click Uplift Gap',
      sortable: true,
      render: (value: number) => <span className="text-green-600 font-medium">+{value}</span>
    },
    {
      key: 'potentialUpliftSignups',
      header: 'Potential Uplift In Signups',
      sortable: true,
      render: (value: number) => <span className="text-green-600 font-medium">+{value}</span>
    },
    {
      key: 'linkBuildingStatus',
      header: 'Link Building Status',
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
    {
      key: 'actualRdsNeeded',
      header: 'Actual N° RDs Needed',
      sortable: true
    },
    { key: 'startingRds', header: 'Starting N° RDs', sortable: true },
    { key: 'month', header: 'Month (Link Building)', sortable: true },
  ];

  // Filter options
  const upliftFilterOptions = {
    cluster: {
      label: 'Cluster',
      options: [
        { value: 'SEO Strategy', label: 'SEO Strategy' },
        { value: 'Technical SEO', label: 'Technical SEO' },
        { value: 'E-commerce SEO', label: 'E-commerce SEO' },
        { value: 'Local SEO', label: 'Local SEO' },
        { value: 'Content Marketing', label: 'Content Marketing' },
      ]
    },
    pageTypeMain: {
      label: 'Page Type',
      options: [
        { value: 'Blog', label: 'Blog' },
        { value: 'Service', label: 'Service' },
        { value: 'Case Study', label: 'Case Study' },
      ]
    },
    publicationStatus: {
      label: 'Status',
      options: [
        { value: 'Published', label: 'Published' },
        { value: 'Draft', label: 'Draft' },
        { value: 'Planned', label: 'Planned' },
      ]
    },
    linkBuildingStatus: {
      label: 'Link Building Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Planned', label: 'Planned' },
        { value: 'Not Started', label: 'Not Started' },
      ]
    },
    contentStatus: {
      label: 'Content Status',
      options: [
        { value: 'New', label: 'New' },
        { value: 'Refresh', label: 'Refresh' },
      ]
    }
  };

  const internalLinkFilterOptions = {
    pageType: {
      label: 'Page Type',
      options: [
        { value: 'Blog', label: 'Blog' },
        { value: 'Service', label: 'Service' },
        { value: 'Case Study', label: 'Case Study' },
      ]
    },
    cluster: {
      label: 'Cluster',
      options: [
        { value: 'SEO Strategy', label: 'SEO Strategy' },
        { value: 'Technical SEO', label: 'Technical SEO' },
        { value: 'E-commerce SEO', label: 'E-commerce SEO' },
        { value: 'Local SEO', label: 'Local SEO' },
        { value: 'Content Marketing', label: 'Content Marketing' },
      ]
    },
    internalLinkRemapStatus: {
      label: 'Remap Status',
      options: [
        { value: 'Complete', label: 'Complete' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Not Started', label: 'Not Started' },
      ]
    }
  };

  const linkBuildingFilterOptions = {
    pageTypeMain: {
      label: 'Page Type',
      options: [
        { value: 'Blog', label: 'Blog' },
        { value: 'Service', label: 'Service' },
        { value: 'Case Study', label: 'Case Study' },
      ]
    },
    linkBuildingStatus: {
      label: 'Link Building Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Planned', label: 'Planned' },
        { value: 'Not Started', label: 'Not Started' },
      ]
    },
    month: {
      label: 'Month',
      options: [
        { value: 'May 2025', label: 'May 2025' },
        { value: 'June 2025', label: 'June 2025' },
        { value: 'July 2025', label: 'July 2025' },
      ]
    }
  };

  // We're keeping the cluster data for potential future use, but not using it in the UI
  // since the Content Clusters tab has been removed as per requirements

  return (
    <DashboardLayout>
      <div className="relative z-0">
        <PageContainer className="w-full">
          <PageContainerTabs>
            <TabNavigation
              tabs={[
                { id: 'uplift', label: 'Uplift Potential', icon: <ClipboardCheck size={16} /> },
                { id: 'internal-link', label: 'Internal Link Map', icon: <PenTool size={16} /> },
                { id: 'link-building', label: 'Link Building Targets', icon: <Link2 size={16} /> },
                // Add custom ad-hoc views
                ...customViews.map(view => ({
                  id: view.id,
                  label: view.label,
                  icon: view.id === 'product-prune' ? <Scissors size={16} /> : undefined
                }))
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="primary"
              containerClassName="flex flex-wrap w-full"
            />
          </PageContainerTabs>

          <PageContainerBody className="p-2 md:p-4">
            {/* Content Clusters tab is removed as per requirements */}

            {activeTab === 'uplift' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <h2 className="text-lg md:text-xl font-medium text-dark">Uplift Potential</h2>
                  <div className="flex items-center">
                    <Button variant="outline" className="flex items-center text-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                <div className="w-full overflow-hidden">
                  <DataTable
                    data={upliftData}
                    columns={upliftColumns}
                    filterOptions={upliftFilterOptions}
                    searchPlaceholder="Search by keyword or URL..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'internal-link' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <h2 className="text-lg md:text-xl font-medium text-dark">Internal Link Map</h2>
                  <div className="flex items-center">
                    <Button variant="outline" className="flex items-center text-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                <div className="w-full overflow-hidden">
                  <DataTable
                    data={internalLinkData}
                    columns={internalLinkColumns}
                    filterOptions={internalLinkFilterOptions}
                    searchPlaceholder="Search by keyword, URL or anchor text..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'link-building' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <h2 className="text-lg md:text-xl font-medium text-dark">Link Building Targets</h2>
                  <div className="flex items-center">
                    <Button variant="outline" className="flex items-center text-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                <div className="w-full overflow-hidden">
                  <DataTable
                    data={linkBuildingData}
                    columns={linkBuildingColumns}
                    filterOptions={linkBuildingFilterOptions}
                    searchPlaceholder="Search by keyword or URL..."
                  />
                </div>
              </div>
            )}

            {/* Handle custom ad-hoc views */}
            {customViews.map(view => (
              activeTab === view.id && (
                <div key={view.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <h2 className="text-lg md:text-xl font-medium text-dark">{view.label}</h2>
                    <div className="flex items-center">
                      <Button variant="outline" className="flex items-center text-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </div>
                  </div>

                  {/* Example Product Prune table */}
                  {view.id === 'product-prune' && (
                    <div className="bg-white p-3 md:p-4">
                      <p className="text-sm text-mediumGray mb-3">
                        This is a custom ad-hoc view for Product Prune. Client-specific tables can be added here as needed.
                      </p>
                      <div className="overflow-x-auto">
                        <Table className="w-full">
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="font-semibold w-[40%]">
                                Product URL
                              </TableHead>
                              <TableHead className="font-semibold w-[20%]">
                                Traffic
                              </TableHead>
                              <TableHead className="font-semibold w-[20%]">
                                Revenue
                              </TableHead>
                              <TableHead className="font-semibold w-[20%]">
                                Action
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                /products/example-1
                              </TableCell>
                              <TableCell>
                                125
                              </TableCell>
                              <TableCell>
                                $0
                              </TableCell>
                              <TableCell>
                                {renderStatusBadge('Prune')}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                /products/example-2
                              </TableCell>
                              <TableCell>
                                250
                              </TableCell>
                              <TableCell>
                                $125
                              </TableCell>
                              <TableCell>
                                {renderStatusBadge('Keep')}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                /products/example-3
                              </TableCell>
                              <TableCell>
                                50
                              </TableCell>
                              <TableCell>
                                $10
                              </TableCell>
                              <TableCell>
                                {renderStatusBadge('Redirect')}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )
            ))}
          </PageContainerBody>
        </PageContainer>
      </div>
    </DashboardLayout>
  );
}
