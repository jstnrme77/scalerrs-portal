'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A consistent container for page content with standardized styling
 */
export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("page-container", className)}>
      {children}
    </div>
  );
}

/**
 * A consistent header for page containers
 */
export function PageContainerHeader({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("page-container-header", className)}>
      {children}
    </div>
  );
}

/**
 * A consistent body for page containers
 */
export function PageContainerBody({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("page-container-body", className)}>
      {children}
    </div>
  );
}

/**
 * A consistent footer for page containers
 */
export function PageContainerFooter({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("page-container-footer", className)}>
      {children}
    </div>
  );
}

/**
 * A consistent tabs container for page containers
 */
export function PageContainerTabs({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("page-container-tabs", className)}>
      {children}
    </div>
  );
}
