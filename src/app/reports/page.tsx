"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ChevronDown,
  Calendar,
  ExternalLink,
  MessageSquare,
  Filter,
  ArrowUp,
  BarChart2,
  FolderOpen,
  Link2,
  ChartColumn,
  TrendingUp,
  Edit,
  AlertTriangle,
  ArrowRight,
  Info,
  ArrowUpRight,
  Video,
  Users,
  ThumbsUp,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TabNavigation from "@/components/ui/navigation/TabNavigation";
import PageContainer, {
  PageContainerBody,
  PageContainerTabs,
} from "@/components/ui/layout/PageContainer";
import { fetchBriefs, fetchArticles, fetchBacklinks } from "@/lib/client-api";
import { Brief, Article, Backlink } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BiMessageRoundedDetail,
  BiLinkExternal,
  BiDownload,
  BiFilter,
  BiErrorCircle,
  BiCheckCircle,
  BiVideo,
} from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { fetchClientsByWeek } from "@/lib/airtable/tables/clientsByWeek";
import WeeklyReportView from "@/components/reports/WeeklyReportView";
import KPIStrip from "@/components/reports/KPIStrip";
import MonthlyReportV2 from "@/components/reports/MonthlyReportV2";
import QuarterlyReportV2 from "@/components/reports/QuarterlyReportV2";

// Date filter options - removed as not needed

// Month filter options
const monthFilterOptions = [
  { value: "all", label: "All Months" },
  { value: "2025-04", label: "April 2025" },
  { value: "2025-03", label: "March 2025" },
  { value: "2025-02", label: "February 2025" },
  { value: "2025-01", label: "January 2025" },
  { value: "2024-12", label: "December 2024" },
  { value: "2024-11", label: "November 2024" },
];

// Colors for charts
const COLORS = ['#9ea8fb', '#fcdc94', '#eadcff', '#ff9d7d', '#e5e7eb'];

// Ensure kpiData and showROI are defined *before* sampleReportContent
const kpiData = {
  traffic: 17000, // Example: Use actual or derived values
  leads: 410,     // Example: Use actual or derived values
  roiPct: 257,    // Example: Use actual or derived values
  cpc: 124,       // Example: Use actual or derived values
};

const showROI = true; // Or derive this value as needed

// Keyword position buckets – used by monthly report charts
const keywordBucketData = [
  { name: 'Top 3',  keywords: 22 },
  { name: '4-10',   keywords: 45 },
  { name: '11-20',  keywords: 67 },
  { name: '20+',    keywords: 89 },
];

/* -------------------------------------------------------------- */
/*  Static placeholder datasets used by legacy charts              */
/*  These prevent "xxx is not defined" runtime errors.             */
/* -------------------------------------------------------------- */
export const leadSourceData = [
  { name: 'Organic', value: 260 },
  { name: 'Paid',    value: 140 },
  { name: 'Referral',value: 80  },
  { name: 'Direct',  value: 60  },
];

export const leadConversionData = [
  { name: 'Visitors',    value: 8_000 },
  { name: 'Leads',       value: 420  },
  { name: 'MQLs',        value: 135  },
  { name: 'Customers',   value: 42   },
];

export const monthlyPerformanceData = [
  { month: 'Jan', clicks: 11_000, leads: 180, revenue: 11_000 },
  { month: 'Feb', clicks: 12_500, leads: 230, revenue: 14_200 },
  { month: 'Mar', clicks: 15_000, leads: 300, revenue: 17_500 },
  { month: 'Apr', clicks: 17_000, leads: 410, revenue: 24_000 },
];

export const quarterlyPerformanceData = [
  { quarter: 'Q2 2025', traffic: 17_000, revenue: 24_000 },
  { quarter: 'Q1 2025', traffic: 15_000, revenue: 18_000 },
  { quarter: 'Q4 2024', traffic: 13_000, revenue: 15_000 },
];

export const topMovers = [
  { url: '/product-feature',        position: 3,  change:  +2, traffic: 1_200, conversionRate: 4.5, revenue: 3_800 },
  { url: '/blog/top-article',       position: 7,  change:  -1, traffic: 900,  conversionRate: 3.1, revenue: 2_000 },
  { url: '/resource/definitive',    position: 11, change:  +4, traffic: 650,  conversionRate: 2.0, revenue: 1_100 },
];

// Custom label function for pie charts
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <>
      {/* Semi-transparent background for better readability */}
      <circle cx={x} cy={y} r={14} fill="rgba(255,255,255,0.7)" />
      {/* Larger, bolder text */}
      <text 
        x={x} 
        y={y} 
        fill="#333333" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontWeight="600"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </>
  );
};

// Sample report data
const reports = {
  weekly: [
    {
      id: 1,
      title: "Weekly Report - Apr 29-May 5, 2025",
      date: "2025-05-05",
      type: "weekly",
      month: "2025-05",
    },
    {
      id: 2,
      title: "Weekly Report - Apr 22-28, 2025",
      date: "2025-04-28",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 3,
      title: "Weekly Report - Apr 15-21, 2025",
      date: "2025-04-21",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 4,
      title: "Weekly Report - Apr 8-14, 2025",
      date: "2025-04-14",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 10,
      title: "Weekly Report - Apr 1-7, 2025",
      date: "2025-04-07",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 11,
      title: "Weekly Report - Mar 25-31, 2025",
      date: "2025-03-31",
      type: "weekly",
      month: "2025-03",
    },
    {
      id: 12,
      title: "Weekly Report - Mar 18-24, 2025",
      date: "2025-03-24",
      type: "weekly",
      month: "2025-03",
    },
  ],
  monthly: [
    {
      id: 5,
      title: 'April 2025 Performance Report',
      date: '2025-05-01',
      type: 'monthly',
      month: '2025-04',
    },
    {
      id: 6,
      title: 'March 2025 Performance Report',
      date: '2025-04-01',
      type: 'monthly',
      month: '2025-03',
    },
    {
      id: 7,
      title: 'February 2025 Performance Report',
      date: '2025-03-01',
      type: 'monthly',
      month: '2025-02',
    },
    {
      id: 8,
      title: 'January 2025 Performance Report',
      date: '2025-02-01',
      type: 'monthly',
      month: '2025-01',
    },
  ],
  quarterly: [
    {
      id: 101,
      title: 'Q1 2025 Performance Report',
      date: '2025-04-15',
      type: 'quarterly',
      month: '2025-03',
    }
  ],
};

/* ------------------------------------------------------------------ */
/*  Sample content lookup (kept for backwards-compat with page logic)  */
/* ------------------------------------------------------------------ */

const sampleReportContent = {
  monthly: <MonthlyReportV2 />,
  quarterly: <QuarterlyReportV2 />,
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedReport, setSelectedReport] = useState<number | null>(1);
  const [reportContent, setReportContent] = useState<React.ReactNode | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);
  const [filteredReports, setFilteredReports] = useState({
    weekly: reports.weekly,
    monthly: reports.monthly,
    quarterly: reports.quarterly,
  });
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);

  // Reference for sticky header
  const headerRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* Dynamic weekly reports (Clients By Week)                           */
  /* ------------------------------------------------------------------ */
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);

  /* Fetch all weeks for the current client once on mount */
  useEffect(() => {
    (async () => {
      try {
        const records = await fetchClientsByWeek();

        const mapped = records
          .map((r: any) => {
            const fields = r.fields as any;

            /* Build title + month in the same structure as the static sample */
            const weekTitle = fields["Client + Week"] || fields["Week"] || "Week";
            const weekStart = fields["Week Start"] || "";
            const monthIso = weekStart ? new Date(weekStart).toISOString().slice(0, 7) : "all";

            return {
              id: r.id,
              title: weekTitle,
              date: fields["Week"] || weekStart,
              month: monthIso,
              fields,
            };
          })
          /* Sort newest first */
          .sort((a: any, b: any) => (b.date > a.date ? 1 : -1));

        setWeeklyReports(mapped);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* Keep filteredReports.weekly in sync with fetched weeks + month filter */
  useEffect(() => {
    const weeklyFiltered = selectedMonth.value !== "all"
      ? weeklyReports.filter((r) => r.month === selectedMonth.value)
      : weeklyReports;

    setFilteredReports((prev) => ({
      ...prev,
      weekly: weeklyFiltered,
    }));
  }, [weeklyReports, selectedMonth]);

  /* When the user selects a weekly report (or when weeks load), inject the dynamic component */
  useEffect(() => {
    if (activeTab !== "weekly") return;
    const rec = weeklyReports.find((r) => r.id === selectedReport);
    if (rec) {
      setReportContent(<WeeklyReportView weekRecord={rec.fields} />);
    }
  }, [activeTab, selectedReport, weeklyReports]);

  // Set initial report content and apply filters
  useEffect(() => {
    // Filter reports based on selected month
    if (selectedMonth.value !== "all") {
      setFilteredReports({
        weekly: reports.weekly.filter(
          (report) => report.month === selectedMonth.value
        ),
        monthly: reports.monthly.filter(
          (report) => report.month === selectedMonth.value
        ),
        quarterly: reports.quarterly, // Quarterly reports aren't filtered by month
      });
    } else {
      setFilteredReports({
        weekly: reports.weekly,
        monthly: reports.monthly,
        quarterly: reports.quarterly,
      });
    }
  }, [selectedMonth]);

  // Set initial report content
  useEffect(() => {
    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];

    if (currentReports.length > 0) {
      setSelectedReport(currentReports[0].id);

      if (activeTab === "weekly") {
        setReportContent(null);
      } else if (activeTab === "monthly") {
        setReportContent(sampleReportContent.monthly);
      } else if (activeTab === "quarterly") {
        setReportContent(sampleReportContent.quarterly);
      }
    } else {
      setSelectedReport(null);
      setReportContent(null);
    }
  }, [activeTab, filteredReports]);

  // Handle report selection
  const handleReportSelect = (reportId: number, type: string) => {
    setSelectedReport(reportId);

    // Set sample content based on report type
    if (type === "weekly") {
      setReportContent(null);
    } else if (type === "monthly") {
      setReportContent(sampleReportContent.monthly);
    } else if (type === "quarterly") {
      setReportContent(sampleReportContent.quarterly);
    }
  };

  // Handle month filter change
  const handleMonthChange = (value: string) => {
    // Extract month and year from the format "Month Year" (e.g., "January 2025")
    if (value.includes(" ")) {
      const [month, year] = value.split(" ");
      // Convert to the format used in monthFilterOptions (e.g., "2025-01")
      const monthNumber = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      }[month];

      if (monthNumber && year) {
        const optionValue = `${year}-${monthNumber}`;
        const selected = monthFilterOptions.find(
          (option) => option.value === optionValue
        );
        if (selected) {
          setSelectedMonth(selected);
        } else {
          // Fallback to "all" if we can't find a matching option
          setSelectedMonth(monthFilterOptions[0]);
        }
      }
    } else {
      // Handle the old format for backward compatibility
      const selected = monthFilterOptions.find(
        (option) => option.value === value
      );
      if (selected) {
        setSelectedMonth(selected);
      }
    }
  };

  // Handle Slack share
  const handleSlackShare = () => {
    setIsSlackModalOpen(true);
  };

  // Navigate to previous report
  const navigateToPreviousReport = () => {
    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];
    if (!selectedReport || currentReports.length <= 1) return;

    const currentIndex = currentReports.findIndex(
      (report) => report.id === selectedReport
    );
    if (currentIndex > 0) {
      const previousReport = currentReports[currentIndex - 1];
      handleReportSelect(previousReport.id, activeTab);
    }
  };

  // Navigate to next report
  const navigateToNextReport = () => {
    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];
    if (!selectedReport || currentReports.length <= 1) return;

    const currentIndex = currentReports.findIndex(
      (report) => report.id === selectedReport
    );
    if (currentIndex < currentReports.length - 1) {
      const nextReport = currentReports[currentIndex + 1];
      handleReportSelect(nextReport.id, activeTab);
    }
  };

  // Get current report title
  const getCurrentReportTitle = () => {
    if (!selectedReport) return "";

    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];
    const report = currentReports.find((r) => r.id === selectedReport);
    return report?.title || "";
  };

  /* When weeks arrive, auto-select the newest one (if nothing picked yet) */
  useEffect(() => {
    if (activeTab === "weekly" && weeklyReports.length && !selectedReport) {
      setSelectedReport(weeklyReports[0].id);
    }
  }, [weeklyReports, activeTab, selectedReport]);

  return (
    <DashboardLayout
      topNavBarProps={{
        selectedMonth: selectedMonth.label,
        onMonthChange: handleMonthChange,
      }}
    >
      <PageContainer className="w-full">
        <div ref={headerRef} className="sticky top-0 z-20 bg-white">
          <PageContainerTabs>
            <div className="tab-navigation">
              <div className="flex justify-between items-center w-full">
                <div className="flex overflow-x-auto">
                  <TabNavigation
                    tabs={[
                      { id: "weekly", label: "Weekly", icon: <Calendar size={18} /> },
                      { id: "monthly", label: "Monthly", icon: <Calendar size={18} /> },
                      { id: "quarterly", label: "Quarterly", icon: <Calendar size={18} /> },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    variant="primary"
                  />
                </div>
              </div>
            </div>
          </PageContainerTabs>
        </div>

        <PageContainerBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Report List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-dark">
                    {activeTab === "weekly" && "Weekly Reports"}
                    {activeTab === "monthly" && "Monthly Reports"}
                    {activeTab === "quarterly" && "Quarterly Reports"}
                  </h2>
                </div>

                <div className="space-y-4">
                  {activeTab === "weekly" && filteredReports.weekly.length > 0
                    ? filteredReports.weekly.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${selectedReport === report.id
                            ? "bg-white border-4 border-[#9EA8FB]"
                            : "bg-white border-4 border-[#F5F5F9] hover:border-[#9EA8FB]/50"
                          }`}
                        onClick={() =>
                          handleReportSelect(report.id, "weekly")
                        }
                      >
                        <p
                          className={`text-base ${selectedReport === report.id
                              ? "font-medium text-primary"
                              : "text-dark"
                            }`}
                        >
                          {report.title}
                        </p>
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                          <p className="text-sm text-mediumGray">
                            {report.date}
                          </p>
                        </div>
                      </div>
                    ))
                    : activeTab === "weekly" && (
                      <div className="p-4 bg-white rounded-lg border-4 border-[#F5F5F9] shadow-sm text-center">
                        <p className="text-mediumGray">
                          No weekly reports found for the selected filters.
                        </p>
                      </div>
                    )}

                  {activeTab === "monthly" && filteredReports.monthly.length > 0
                    ? filteredReports.monthly.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${selectedReport === report.id
                            ? "bg-white border-4 border-[#9EA8FB]"
                            : "bg-white border-4 border-[#F5F5F9] hover:border-[#9EA8FB]/50"
                          }`}
                        onClick={() =>
                          handleReportSelect(report.id, "monthly")
                        }
                      >
                        <p
                          className={`text-base ${selectedReport === report.id
                              ? "font-medium text-primary"
                              : "text-dark"
                            }`}
                        >
                          {report.title}
                        </p>
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                          <p className="text-sm text-mediumGray">
                            {report.date}
                          </p>
                        </div>
                      </div>
                    ))
                    : activeTab === "monthly" && (
                      <div className="p-4 bg-white rounded-lg border-4 border-[#F5F5F9] shadow-sm text-center">
                        <p className="text-mediumGray">
                          No monthly reports found for the selected filters.
                        </p>
                      </div>
                    )}

                  {activeTab === "quarterly" &&
                    filteredReports.quarterly.length > 0
                    ? filteredReports.quarterly.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${selectedReport === report.id
                            ? "bg-white border-4 border-[#9EA8FB]"
                            : "bg-white border-4 border-[#F5F5F9] hover:border-[#9EA8FB]/50"
                          }`}
                        onClick={() =>
                          handleReportSelect(report.id, "quarterly")
                        }
                      >
                        <p
                          className={`text-base ${selectedReport === report.id
                              ? "font-medium text-primary"
                              : "text-dark"
                            }`}
                        >
                          {report.title}
                        </p>
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                          <p className="text-sm text-mediumGray">
                            {report.date}
                          </p>
                        </div>
                      </div>
                    ))
                    : activeTab === "quarterly" && (
                      <div className="p-4 bg-white rounded-lg border-4 border-[#F5F5F9] shadow-sm text-center">
                        <p className="text-mediumGray">
                          No quarterly reports found for the selected filters.
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 z-10">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      className={`mr-3 ${!selectedReport ||
                          filteredReports[
                            activeTab as keyof typeof filteredReports
                          ].findIndex((r) => r.id === selectedReport) <= 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#9EA8FB]/10"
                        }`}
                      onClick={navigateToPreviousReport}
                      disabled={
                        !selectedReport ||
                        filteredReports[
                          activeTab as keyof typeof filteredReports
                        ].findIndex((r) => r.id === selectedReport) <= 0
                      }
                    >
                      <ChevronDown className="h-5 w-5 transform -rotate-90" />
                    </Button>
                    <h2 className="text-lg md:text-xl font-medium text-dark">
                      {activeTab === "weekly" &&
                        selectedReport &&
                        filteredReports.weekly.find(
                          (r) => r.id === selectedReport
                        )?.title}
                      {activeTab === "monthly" &&
                        selectedReport &&
                        filteredReports.monthly.find(
                          (r) => r.id === selectedReport
                        )?.title}
                      {activeTab === "quarterly" &&
                        selectedReport &&
                        filteredReports.quarterly.find(
                          (r) => r.id === selectedReport
                        )?.title}
                    </h2>
                    <Button
                      variant="ghost"
                      className={`ml-3 ${!selectedReport ||
                          filteredReports[
                            activeTab as keyof typeof filteredReports
                          ].findIndex((r) => r.id === selectedReport) >=
                          filteredReports[
                            activeTab as keyof typeof filteredReports
                          ].length -
                          1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#9EA8FB]/10"
                        }`}
                      onClick={navigateToNextReport}
                      disabled={
                        !selectedReport ||
                        filteredReports[
                          activeTab as keyof typeof filteredReports
                        ].findIndex((r) => r.id === selectedReport) >=
                        filteredReports[
                          activeTab as keyof typeof filteredReports
                        ].length -
                        1
                      }
                    >
                      <ChevronDown className="h-5 w-5 transform rotate-90" />
                    </Button>
                  </div>
                </div>

                {/* Report Content */}
                <div className="mt-6">{reportContent}</div>
              </div>
            </div>
          </div>
        </PageContainerBody>
      </PageContainer>
    </DashboardLayout>
  );
}
