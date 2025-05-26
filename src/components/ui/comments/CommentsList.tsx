'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AirtableComment } from '@/types/airtable-comments';
import AirtableCommentItem from './AirtableCommentItem';
import CommentSkeleton from './CommentSkeleton';

interface CommentsListProps {
  comments: AirtableComment[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  showContentType?: boolean;
  showFullTimestamp?: boolean;
  maxHeight?: string;
  autoRefresh?: boolean;
  autoRefreshInterval?: number; // in milliseconds
  emptyStateMessage?: string;
  emptyStateSubMessage?: string;
}

export default function CommentsList({
  comments,
  isLoading = false,
  error = null,
  onRefresh,
  showContentType = false,
  showFullTimestamp = false,
  maxHeight = '400px',
  autoRefresh = false,
  autoRefreshInterval = 30000, // 30 seconds
  emptyStateMessage = 'No comments yet',
  emptyStateSubMessage = 'Be the first to start the conversation'
}: CommentsListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadComments, setUnreadComments] = useState<Set<string>>(new Set());

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastRefresh(new Date());
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh, autoRefreshInterval]);

  // Mark new comments as unread when they arrive
  useEffect(() => {
    const currentCommentIds = new Set(comments.map(c => c.id));
    const previousCommentIds = new Set(Array.from(unreadComments));
    
    // Find new comments
    const newCommentIds = comments
      .filter(comment => !previousCommentIds.has(comment.id))
      .map(comment => comment.id);
    
    if (newCommentIds.length > 0) {
      setUnreadComments(prev => {
        const updated = new Set(prev);
        newCommentIds.forEach(id => updated.add(id));
        return updated;
      });
    }
  }, [comments]);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = (commentId: string) => {
    setUnreadComments(prev => {
      const updated = new Set(prev);
      updated.delete(commentId);
      return updated;
    });
  };

  const formatLastRefresh = (): string => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return lastRefresh.toLocaleDateString();
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm font-medium text-red-700 mb-1">Failed to load comments</p>
        <p className="text-xs text-red-600 mb-3">{error}</p>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            <RefreshCw size={12} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MessageCircle size={16} className="text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>
          {unreadComments.size > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {unreadComments.size} new
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Auto-refresh indicator */}
          {autoRefresh && (
            <div className="text-xs text-gray-500">
              Updated {formatLastRefresh()}
            </div>
          )}
          
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50"
              title="Refresh comments"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}
          
          {/* Collapse/Expand button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            title={isCollapsed ? 'Expand comments' : 'Collapse comments'}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Comments Content */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Loading state */}
          {isLoading ? (
            <CommentSkeleton count={3} />
          ) : comments.length > 0 ? (
            /* Comments list */
            <div 
              className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{ maxHeight }}
            >
              {comments.map((comment) => (
                <AirtableCommentItem
                  key={comment.id}
                  comment={comment}
                  showContentType={showContentType}
                  showFullTimestamp={showFullTimestamp}
                  isUnread={unreadComments.has(comment.id)}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageCircle size={32} className="text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-500 mb-1">{emptyStateMessage}</p>
              <p className="text-xs text-gray-400">{emptyStateSubMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 