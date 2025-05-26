import React from 'react';
import { reportTheme, metricInclude } from '@/theme/reportTheme';

interface KPIStripProps {
  traffic: number;
  leads: number;
  roiPct?: number;
  cpc?: number;
  /* Optional MoM / QoQ change percentages (e.g. +9.8) */
  trafficChangePct?: number;
  leadsChangePct?: number;
  roiChangePct?: number;
  cpcChangePct?: number;
  showROI?: boolean;      // toggles ROI + CPC cards
  loading?: boolean;      // optional skeleton placeholder
}

export default function KPIStrip({
  traffic,
  leads,
  roiPct,
  cpc,
  trafficChangePct,
  leadsChangePct,
  roiChangePct,
  cpcChangePct,
  showROI = false,
  loading = false,
}: KPIStripProps) {
  const infoStyle = {
    background: reportTheme.infoBg,
    borderColor: reportTheme.infoBorder,
    color: reportTheme.infoText,
  } as React.CSSProperties;

  const shouldShowROI   = showROI && metricInclude.roiPct;
  const shouldShowCPC   = showROI && metricInclude.cpc;

  /* Helper to render change % with colour sign & colour */
  const renderChange = (val?: number) => {
    if (val === undefined) return null;
    if (val === 0) {
      return <span className="text-sm font-medium ml-1 text-gray-500">0%</span>;
    }
    const isPositive = val > 0;
    const txt = `${isPositive ? '+' : ''}${val.toFixed(1)}%`;
    const colour = isPositive ? 'text-green-600' : 'text-red-600';
    return <span className={`text-sm font-medium ml-1 ${colour}`}>{txt}</span>;
  };

  /* White card – fixed dims, subtle hover-shadow, responsive padding */
  const cardClass = [
    'p-4',           // mobile padding
    'sm:p-5',        // desktop padding
    'rounded-lg bg-[#F5F5F9] border border-gray-200', // light-grey background
    'hover:shadow-md transition-shadow',
    'flex flex-col justify-between w-full',            // flexible width
  ].join(' ');

  /* ------------------------------------------------------------------ */
  /* Skeleton when data is still loading                                 */
  /* ------------------------------------------------------------------ */
  if (loading) {
    const skeletonCard = (
      <div className="p-4 sm:p-5 rounded-lg bg-gray-200 border border-gray-200 w-full h-[120px] animate-pulse" />
    );
    const placeholders = [0, 1, 2, 3].map((i) => (
      <React.Fragment key={i}>{skeletonCard}</React.Fragment>
    ));

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {placeholders}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricInclude.traffic && (
          <div className={cardClass}>
            <div className="flex items-start justify-between mb-1">
              <p
                className="text-sm text-mediumGray whitespace-nowrap"
                title="Total organic sessions tracked in analytics"
              >
                Organic Traffic
              </p>
              {renderChange(trafficChangePct)}
            </div>
            <div className="text-2xl font-extrabold tabular-nums">
              {traffic.toLocaleString()}
            </div>
          </div>
        )}

        {metricInclude.leads && (
          <div className={cardClass}>
            <div className="flex items-start justify-between mb-1">
              <p
                className="text-sm text-mediumGray whitespace-nowrap"
                title="Total leads recorded (form submissions, calls, etc.)"
              >
                Leads
              </p>
              {renderChange(leadsChangePct)}
            </div>
            <div className="text-2xl font-extrabold tabular-nums">
              {leads.toLocaleString()}
            </div>
          </div>
        )}

        {shouldShowROI && (
          <div className={cardClass}>
            <div className="flex items-start justify-between mb-1">
              <p
                className="text-sm text-mediumGray whitespace-nowrap"
                title="Estimated return on retainer investment"
              >
                ROI on Retainer
              </p>
              {renderChange(roiChangePct)}
            </div>
            <div className="text-2xl font-extrabold tabular-nums text-green-600">
              {roiPct}%
            </div>
          </div>
        )}

        {shouldShowCPC && (
          <div className={cardClass}>
            <div className="flex items-start justify-between mb-1">
              <p
                className="text-sm text-mediumGray whitespace-nowrap"
                title="Equivalent cost-per-click vs paid search benchmark"
              >
                CPC Equivalence
              </p>
              {renderChange(cpcChangePct)}
            </div>
            <div className="text-2xl font-extrabold tabular-nums">
              ${cpc}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer removed as per requirements */}
    </div>
  );
} 