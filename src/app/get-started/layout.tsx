'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
