'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
