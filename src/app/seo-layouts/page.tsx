'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { CompactTable, CompactTableBody, CompactTableCell, CompactTableHead, CompactTableHeader, CompactTableRow } from "./components/CompactTable";
import { ArrowUpDown, Filter, Download, Search } from "lucide-react";
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
    contentStatus: 'Refresh',
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
    contentStatus: 'Refresh',
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
    contentStatus: 'New',
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
    contentStatus: 'New',
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
    contentStatus: 'Refresh',
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

  // Get column width based on column key
  const getColumnWidth = (key: string) => {
    // Define column widths based on content type
    const columnWidths: Record<string, string> = {
      // Common columns
      'mainKw': '180px',
      'targetUrl': '180px',
      'publicationStatus': '120px',
      'pageTypeMain': '120px',
      'pageTypeSub': '120px',
      'targetKwScore': '120px',
      'mainKwPosition': '120px',
      'clicksLastMonth': '120px',
      'potentialClickUplift': '140px',
      'potentialUpliftSignups': '140px',
      'linkBuildingStatus': '120px',
      'contentStatus': '120px',

      // Internal link map specific
      'pageType': '120px',
      'cluster': '120px',
      'secondaryAnchorText': '180px',
      'internalLinkRemapStatus': '140px',

      // Link building specific
      'actualRdsNeeded': '120px',
      'startingRds': '120px',
      'month': '120px',

      // Default for any other columns
      'default': '120px'
    };

    return columnWidths[key] || columnWidths['default'];
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10 h-10 text-base"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {Object.entries(filterOptions).map(([key, { label, options }]) => (
            <div key={key} className="flex items-center">
              <Select
                value={filters[key] || 'all'}
                onValueChange={(value) => handleFilterChange(key, value)}
              >
                <SelectTrigger className="w-[180px] h-10 text-sm">
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">All {label}</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <Button variant="outline" className="h-10 ml-2">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border w-full">
        <div className="overflow-x-auto">
          <CompactTable className="w-full">
            <CompactTableHeader>
              <CompactTableRow className="bg-gray-50">
                {columns.map((column) => (
                  <CompactTableHead
                    key={column.key}
                    width={getColumnWidth(column.key)}
                  >
                    {column.sortable ? (
                      <button
                        className="flex items-center"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.header}
                        <ArrowUpDown className="ml-1 h-3 w-3 flex-shrink-0" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </CompactTableHead>
                ))}
              </CompactTableRow>
            </CompactTableHeader>
            <CompactTableBody>
              {filteredData.length === 0 ? (
                <CompactTableRow>
                  <CompactTableCell colSpan={columns.length} className="text-center py-2 text-gray-500">
                    No results found
                  </CompactTableCell>
                </CompactTableRow>
              ) : (
                filteredData.map((row) => (
                  <CompactTableRow key={row.id}>
                    {columns.map((column) => (
                      <CompactTableCell
                        key={`${row.id}-${column.key}`}
                        width={getColumnWidth(column.key)}
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </CompactTableCell>
                    ))}
                  </CompactTableRow>
                ))
              )}
            </CompactTableBody>
          </CompactTable>
        </div>
      </div>
    </div>
  );
}

// Removed unused cluster data as per requirements

export default function SEOLayoutsPage() {
  const [activeTab, setActiveTab] = useState('uplift');

  // State for custom ad-hoc views
  const [customViews] = useState<{id: string, label: string}[]>([
    // Example custom view - in a real app, these would be loaded from a backend
    { id: 'product-prune', label: 'Product Prune' }
  ]);

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning"; label: string }> = {
      'Complete': { variant: 'success', label: 'Complete' },
      'In Progress': { variant: 'warning', label: 'In Progress' },
      'Not Started': { variant: 'secondary', label: 'Not Started' },
      'Active': { variant: 'success', label: 'Active' },
      'Planned': { variant: 'warning', label: 'Planned' },
      'Published': { variant: 'success', label: 'Published' },
      'Draft': { variant: 'warning', label: 'Draft' },
      'New': { variant: 'default', label: 'New' },
      'Refresh': { variant: 'secondary', label: 'Refresh' },
      'Implemented': { variant: 'success', label: 'Implemented' },
      'Not Implemented': { variant: 'warning', label: 'Not Implemented' },
      'Prune': { variant: 'destructive', label: 'Prune' },
      'Keep': { variant: 'success', label: 'Keep' },
      'Redirect': { variant: 'warning', label: 'Redirect' },
    };

    const config = statusMap[status] || { variant: 'secondary', label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">SEO Layouts</h1>
          <p className="text-base text-mediumGray">Transparent SEO data views to support strategy, content creation and reporting</p>
        </div>
      </div>

      <div className="relative z-0">
        <PageContainer className="w-full">
          <PageContainerTabs>
            <TabNavigation
              tabs={[
                { id: 'uplift', label: 'Uplift Potential' },
                { id: 'internal-link', label: 'Internal Link Map' },
                { id: 'link-building', label: 'Link Building Targets' },
                // Add custom ad-hoc views
                ...customViews.map(view => ({ id: view.id, label: view.label }))
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="primary"
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
                    <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-mediumGray mb-3">
                        This is a custom ad-hoc view for Product Prune. Client-specific tables can be added here as needed.
                      </p>
                      <div className="overflow-x-auto">
                        <CompactTable className="w-full">
                          <CompactTableHeader>
                            <CompactTableRow className="bg-gray-50">
                              <CompactTableHead width="250px">
                                Product URL
                              </CompactTableHead>
                              <CompactTableHead width="150px">
                                Traffic
                              </CompactTableHead>
                              <CompactTableHead width="150px">
                                Revenue
                              </CompactTableHead>
                              <CompactTableHead width="150px">
                                Action
                              </CompactTableHead>
                            </CompactTableRow>
                          </CompactTableHeader>
                          <CompactTableBody>
                            <CompactTableRow>
                              <CompactTableCell className="font-medium" width="250px">
                                /products/example-1
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                125
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                $0
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                {renderStatusBadge('Prune')}
                              </CompactTableCell>
                            </CompactTableRow>
                            <CompactTableRow>
                              <CompactTableCell className="font-medium" width="250px">
                                /products/example-2
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                250
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                $125
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                {renderStatusBadge('Keep')}
                              </CompactTableCell>
                            </CompactTableRow>
                            <CompactTableRow>
                              <CompactTableCell className="font-medium" width="250px">
                                /products/example-3
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                50
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                $10
                              </CompactTableCell>
                              <CompactTableCell width="150px">
                                {renderStatusBadge('Redirect')}
                              </CompactTableCell>
                            </CompactTableRow>
                          </CompactTableBody>
                        </CompactTable>
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
