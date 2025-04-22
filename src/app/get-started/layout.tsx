'use client';

import DashboardLayoutNoTopNav from '@/components/DashboardLayoutNoTopNav';

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutNoTopNav>{children}</DashboardLayoutNoTopNav>;
}
