'use client';

import React from 'react';

interface CommentSkeletonProps {
  count?: number;
}

const CommentSkeletonItem = () => (
  <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
    {/* Avatar Skeleton */}
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
    
    {/* Content Skeleton */}
    <div className="flex-1 min-w-0 space-y-2">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
      </div>
      
      {/* Text Skeleton - multiple lines */}
      <div className="space-y-1">
        <div className="h-3 w-full bg-gray-300 rounded animate-pulse"></div>
        <div className="h-3 w-3/4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function CommentSkeleton({ count = 3 }: CommentSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <CommentSkeletonItem key={index} />
      ))}
    </div>
  );
} 